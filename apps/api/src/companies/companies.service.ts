import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { CompanyMemberRole } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async createCompany(userId: string, dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('A company with this URL slug already exists');
    }

    return this.prisma.company.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        industry: dto.industry,
        companySize: dto.companySize,
        foundedYear: dto.foundedYear,
        website: dto.website,
        location: dto.location,
        createdById: userId,
        members: {
          create: {
            userId,
            role: CompanyMemberRole.ADMIN,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async getCompanyBySlug(slug: string, viewerId?: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profile: { select: { headline: true, profilePictureUrl: true } },
              },
            },
          },
        },
        jobs: {
          where: { status: 'OPEN' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    let isFollowing = false;
    let isMember = false;
    let memberRole: CompanyMemberRole | null = null;

    if (viewerId) {
      const follow = await this.prisma.follow.findFirst({
        where: {
          followerId: viewerId,
          followingId: company.id,
          followingType: 'COMPANY',
        },
      });
      isFollowing = !!follow;

      const mem = company.members.find((m) => m.userId === viewerId);
      if (mem) {
        isMember = true;
        memberRole = mem.role;
      }
    }

    return {
      ...company,
      isFollowing,
      isMember,
      memberRole,
    };
  }

  async updateCompany(companyId: string, userId: string, dto: UpdateCompanyDto) {
    const member = await this.prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId, userId } },
    });

    if (!member || member.role === 'MEMBER') {
      throw new ForbiddenException('Only company administrators can update company details');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: dto,
    });
  }

  async addMember(companyId: string, adminUserId: string, targetUserId: string, role: CompanyMemberRole) {
    const admin = await this.prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId, userId: adminUserId } },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only company administrators can add members');
    }

    return this.prisma.companyMember.upsert({
      where: { companyId_userId: { companyId, userId: targetUserId } },
      update: { role },
      create: {
        companyId,
        userId: targetUserId,
        role,
        invitedById: adminUserId,
      },
    });
  }
}
