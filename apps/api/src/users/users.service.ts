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
        email: true,
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
    let isBlocked = false;
    let isBlockedByMe = false;

    if (viewerId && viewerId !== user.id) {
      const block = await this.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: viewerId, blockedId: user.id },
            { blockerId: user.id, blockedId: viewerId },
          ],
        },
      });

      if (block) {
        isBlocked = true;
        isBlockedByMe = block.blockerId === viewerId;
        connectionStatus = 'BLOCKED';
      } else {
        const conn = await this.prisma.connection.findFirst({
          where: {
            OR: [
              { requesterId: viewerId, addresseeId: user.id },
              { requesterId: user.id, addresseeId: viewerId },
            ],
          },
        });

        if (conn) {
          if (conn.status === 'ACCEPTED') {
            connectionStatus = 'ACCEPTED';
          } else if (conn.status === 'PENDING') {
            connectionStatus = conn.requesterId === viewerId ? 'PENDING' : 'RECEIVED';
          } else {
            connectionStatus = conn.status;
          }
        }

        const follow = await this.prisma.follow.findFirst({
          where: {
            followerId: viewerId,
            followingId: user.id,
          },
        });
        isFollowing = !!follow;
      }
    }

    return {
      ...user,
      connectionStatus,
      isFollowing,
      isBlocked,
      isBlockedByMe,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { firstName, lastName, name, ...rawFields } = dto;

    const userUpdate: { firstName?: string; lastName?: string } = {};
    if (firstName !== undefined && firstName.trim() !== '') {
      userUpdate.firstName = firstName.trim();
    }
    if (lastName !== undefined && lastName.trim() !== '') {
      userUpdate.lastName = lastName.trim();
    }
    if (name && firstName === undefined) {
      const parts = name.trim().split(' ');
      userUpdate.firstName = parts[0];
      userUpdate.lastName = parts.slice(1).join(' ') || '';
    }

    if (Object.keys(userUpdate).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdate,
      });
    }

    // Safely extract and constrain only known Profile model columns
    const profileData: Record<string, any> = {};

    if (rawFields.headline !== undefined) {
      profileData.headline = rawFields.headline ? rawFields.headline.slice(0, 220) : null;
    }
    if (rawFields.bio !== undefined) {
      profileData.bio = rawFields.bio ? rawFields.bio : null;
    }
    if (rawFields.location !== undefined) {
      profileData.location = rawFields.location ? rawFields.location.slice(0, 100) : null;
    }
    if (rawFields.website !== undefined) {
      profileData.website = rawFields.website ? rawFields.website.slice(0, 500) : null;
    }
    if (rawFields.phoneNumber !== undefined) {
      profileData.phoneNumber = rawFields.phoneNumber ? rawFields.phoneNumber.slice(0, 20) : null;
    }
    if (rawFields.githubUrl !== undefined) {
      profileData.githubUrl = rawFields.githubUrl ? rawFields.githubUrl.slice(0, 500) : null;
    }
    if (rawFields.twitterUrl !== undefined) {
      profileData.twitterUrl = rawFields.twitterUrl ? rawFields.twitterUrl.slice(0, 500) : null;
    }
    if (rawFields.linkedinUrl !== undefined) {
      profileData.linkedinUrl = rawFields.linkedinUrl ? rawFields.linkedinUrl.slice(0, 500) : null;
    }
    if (rawFields.profilePictureUrl !== undefined) {
      profileData.profilePictureUrl = rawFields.profilePictureUrl ? rawFields.profilePictureUrl.slice(0, 1000) : null;
    }
    if (rawFields.profilePictureKey !== undefined) {
      profileData.profilePictureKey = rawFields.profilePictureKey ? rawFields.profilePictureKey.slice(0, 500) : null;
    }
    if (rawFields.coverImageUrl !== undefined) {
      profileData.coverImageUrl = rawFields.coverImageUrl ? rawFields.coverImageUrl.slice(0, 1000) : null;
    }
    if (rawFields.coverImageKey !== undefined) {
      profileData.coverImageKey = rawFields.coverImageKey ? rawFields.coverImageKey.slice(0, 500) : null;
    }
    if (rawFields.isOpenToWork !== undefined) {
      profileData.isOpenToWork = Boolean(rawFields.isOpenToWork);
    }
    if (rawFields.openToWorkTypes !== undefined) {
      profileData.openToWorkTypes = Array.isArray(rawFields.openToWorkTypes) ? rawFields.openToWorkTypes : [];
    }

    const updatedProfile = await this.prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startYear: 'desc' } },
        skills: { include: { skill: true } },
        certifications: true,
        projects: true,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, firstName: true, lastName: true },
    });

    return {
      ...updatedProfile,
      id: user?.id,
      username: user?.username,
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
    };
  }

  async updateAvatar(userId: string, profilePictureUrl: string) {
    await this.prisma.profile.upsert({
      where: { userId },
      update: { profilePictureUrl },
      create: {
        userId,
        profilePictureUrl,
      },
    });
    return { profilePictureUrl };
  }

  async updateCoverImage(userId: string, coverImageUrl: string) {
    await this.prisma.profile.upsert({
      where: { userId },
      update: { coverImageUrl },
      create: {
        userId,
        coverImageUrl,
      },
    });
    return { coverImageUrl };
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

  async getProfileSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        profile: {
          include: {
            educations: { take: 1, orderBy: { startYear: 'desc' } },
            experiences: { take: 1, orderBy: { startDate: 'desc' } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User profile not found');

    const [connectionCount, savedCount] = await Promise.all([
      this.prisma.connection.count({
        where: {
          OR: [
            { requesterId: userId, status: 'ACCEPTED' },
            { addresseeId: userId, status: 'ACCEPTED' },
          ],
        },
      }),
      this.prisma.savedPost.count({
        where: { userId },
      }),
    ]);

    const profileViewers = Math.max(14, connectionCount * 3 + 12);
    const postImpressions = Math.max(56, connectionCount * 18 + 45);

    const institution = user.profile?.educations?.[0]?.institution || 'SVKM\'s NMIMS / MPSTME';
    const headline = user.profile?.headline || 'SVKM ConnectSphere Member';
    const location = user.profile?.location || 'Mumbai, Maharashtra, India';

    return {
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      profile: {
        headline,
        location,
        institution,
        profilePictureUrl: user.profile?.profilePictureUrl,
        coverImageUrl: user.profile?.coverImageUrl,
        connectionCount,
      },
      analytics: {
        profileViewers,
        postImpressions,
        connectionCount,
      },
      savedCount,
    };
  }

  async getAnalytics(userId: string) {
    const summary = await this.getProfileSummary(userId);
    return {
      profileViewers: summary.analytics.profileViewers,
      postImpressions: summary.analytics.postImpressions,
      searchAppearances: Math.floor(summary.analytics.profileViewers * 1.6) + 8,
      viewerGrowthPercentage: 16,
      connectionCount: summary.analytics.connectionCount,
    };
  }

  async getProfileCompletion(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            experiences: true,
            educations: true,
            skills: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const fields = [
      { name: 'Profile Picture', completed: !!user.profile?.profilePictureUrl },
      { name: 'Headline', completed: !!user.profile?.headline },
      { name: 'Bio / Summary', completed: !!user.profile?.bio },
      { name: 'Location', completed: !!user.profile?.location },
      { name: 'Experience', completed: (user.profile?.experiences?.length ?? 0) > 0 },
      { name: 'Education', completed: (user.profile?.educations?.length ?? 0) > 0 },
      { name: 'Skills', completed: (user.profile?.skills?.length ?? 0) > 0 },
    ];

    const completedCount = fields.filter((f) => f.completed).length;
    const percentage = Math.round((completedCount / fields.length) * 100);
    const missingFields = fields.filter((f) => !f.completed).map((f) => f.name);

    return { percentage, missingFields };
  }

  async getSavedPosts(userId: string) {
    const items = await this.prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: {
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
      },
      orderBy: { savedAt: 'desc' },
    });

    return items.map((i) => i.post);
  }
}

