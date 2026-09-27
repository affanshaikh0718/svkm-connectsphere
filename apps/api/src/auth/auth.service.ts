import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto, ResetPasswordDto } from './dto/password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('An account with this email already exists');
      }
      throw new ConflictException('This username is already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        status: UserStatus.ACTIVE, // active for seamless development testing
        emailVerified: true,
        profile: {
          create: {
            headline: dto.roleType
              ? `${dto.roleType === 'STUDENT' ? 'Student' : dto.roleType === 'ALUMNI' ? 'Alumnus/Alumna' : dto.roleType === 'FACULTY' ? 'Faculty Member' : 'Campus Recruiter'} | ${dto.institution || 'SVKM Ecosystem'}`
              : (dto.institution ? `Member @ ${dto.institution}` : 'Member of SVKM Professional Ecosystem'),
            location: 'Mumbai, Maharashtra',
          },
        },
        privacySettings: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { username: dto.identifier }],
      },
      include: {
        profile: {
          select: {
            headline: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('This account has been permanently suspended');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profile: user.profile,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.isRevoked || new Date() > session.expiresAt) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Refresh Token Rotation: revoke old session, issue new pair
    await this.prisma.session.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    const tokens = await this.generateTokens(session.user.id, session.user.email, session.user.role);

    return tokens;
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await this.prisma.session.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    }
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    return { message: 'All active sessions revoked' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Revoke all sessions to enforce re-login
    await this.logoutAll(userId);

    return { message: 'Password updated successfully. Please log in again.' };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    ipAddress?: string,
    deviceInfo?: string,
  ) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn') || '15m',
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        ipAddress,
        deviceInfo,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }
}
