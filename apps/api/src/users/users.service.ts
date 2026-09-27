import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EducationDto, ExperienceDto, UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        profile: {
          include: {
            experiences: { orderBy: { startDate: 'desc' } },
            educations: { orderBy: { startYear: 'desc' } },
            skills: { include: { skill: true } },
            certifications: true,
            projects: true,
          },
        },
        privacySettings: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async getByUsername(username: string, viewerId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        profile: {
          include: {
            experiences: { orderBy: { startDate: 'desc' } },
            educations: { orderBy: { startYear: 'desc' } },
            skills: { include: { skill: true } },
            certifications: true,
            projects: true,
          },
        },
        privacySettings: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Profile @${username} not found`);
    }

    // Check relationship if viewer is logged in
    let connectionStatus = 'NONE';
    let isFollowing = false;

    if (viewerId && viewerId !== user.id) {
      const conn = await this.prisma.connection.findFirst({
        where: {
          OR: [
            { requesterId: viewerId, addresseeId: user.id },
            { requesterId: user.id, addresseeId: viewerId },
          ],
        },
      });

      if (conn) {
        connectionStatus = conn.status;
      }

      const follow = await this.prisma.follow.findFirst({
        where: {
          followerId: viewerId,
          followingId: user.id,
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      connectionStatus,
      isFollowing,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.profile.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });
  }

  async addExperience(userId: string, dto: ExperienceDto) {
    return this.prisma.experience.create({
      data: {
        userId,
        companyName: dto.companyName,
        position: dto.position,
        employmentType: dto.employmentType,
        location: dto.location,
        locationType: dto.locationType,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent || false,
        description: dto.description,
        skills: dto.skills || [],
      },
    });
  }

  async deleteExperience(userId: string, experienceId: string) {
    const exp = await this.prisma.experience.findUnique({ where: { id: experienceId } });
    if (!exp) throw new NotFoundException();
    if (exp.userId !== userId) throw new ForbiddenException('You do not own this experience record');

    await this.prisma.experience.delete({ where: { id: experienceId } });
    return { message: 'Experience deleted successfully' };
  }

  async addEducation(userId: string, dto: EducationDto) {
    return this.prisma.education.create({
      data: {
        userId,
        institution: dto.institution,
        degree: dto.degree,
        fieldOfStudy: dto.fieldOfStudy,
        startYear: dto.startYear,
        endYear: dto.endYear,
        grade: dto.grade,
        description: dto.description,
      },
    });
  }

  async deleteEducation(userId: string, educationId: string) {
    const edu = await this.prisma.education.findUnique({ where: { id: educationId } });
    if (!edu) throw new NotFoundException();
    if (edu.userId !== userId) throw new ForbiddenException('You do not own this education record');

    await this.prisma.education.delete({ where: { id: educationId } });
    return { message: 'Education deleted successfully' };
  }

  async addSkill(userId: string, skillName: string) {
    let skill = await this.prisma.skill.findUnique({ where: { name: skillName.trim() } });
    if (!skill) {
      skill = await this.prisma.skill.create({ data: { name: skillName.trim() } });
    }

    return this.prisma.userSkill.upsert({
      where: {
        userId_skillId: { userId, skillId: skill.id },
      },
      update: {},
      create: {
        userId,
        skillId: skill.id,
      },
      include: { skill: true },
    });
  }

  async removeSkill(userId: string, userSkillId: string) {
    const us = await this.prisma.userSkill.findUnique({ where: { id: userSkillId } });
    if (!us) throw new NotFoundException();
    if (us.userId !== userId) throw new ForbiddenException('You do not own this skill record');

    await this.prisma.userSkill.delete({ where: { id: userSkillId } });
    return { message: 'Skill removed successfully' };
  }
}
