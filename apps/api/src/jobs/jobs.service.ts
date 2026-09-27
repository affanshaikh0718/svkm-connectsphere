import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyJobDto, CreateJobDto } from './dto/job.dto';
import { ApplicationStatus, EntityType, JobStatus, NotificationType } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async createJob(userId: string, dto: CreateJobDto) {
    // Verify user is a member of the company (ADMIN or RECRUITER)
    const membership = await this.prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId: dto.companyId,
          userId,
        },
      },
    });

    if (!membership || membership.role === 'MEMBER') {
      throw new ForbiddenException('Only company administrators and recruiters can post jobs');
    }

    const job = await this.prisma.job.create({
      data: {
        companyId: dto.companyId,
        postedById: userId,
        title: dto.title,
        description: dto.description,
        responsibilities: dto.responsibilities,
        requirements: dto.requirements,
        benefits: dto.benefits,
        location: dto.location,
        locationType: dto.locationType || 'ON_SITE',
        employmentType: dto.employmentType || 'FULL_TIME',
        experienceLevel: dto.experienceLevel || 'MID',
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        salaryCurrency: dto.salaryCurrency || 'USD',
        applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : null,
        status: JobStatus.OPEN,
      },
    });

    // Handle required skills
    if (dto.skillNames && dto.skillNames.length > 0) {
      for (const name of dto.skillNames) {
        let skill = await this.prisma.skill.findUnique({ where: { name: name.trim() } });
        if (!skill) {
          skill = await this.prisma.skill.create({ data: { name: name.trim() } });
        }
        await this.prisma.jobSkill.create({
          data: {
            jobId: job.id,
            skillId: skill.id,
          },
        });
      }
    }

    return this.getJobById(job.id);
  }

  async getAllJobs(filters?: {
    keyword?: string;
    locationType?: string;
    employmentType?: string;
    experienceLevel?: string;
  }) {
    const where: any = { status: JobStatus.OPEN };

    if (filters?.keyword) {
      where.OR = [
        { title: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }
    if (filters?.locationType) {
      where.locationType = filters.locationType;
    }
    if (filters?.employmentType) {
      where.employmentType = filters.employmentType;
    }
    if (filters?.experienceLevel) {
      where.experienceLevel = filters.experienceLevel;
    }

    return this.prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            location: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getJobById(jobId: string, viewerId?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            location: true,
            description: true,
            website: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!job) throw new NotFoundException('Job listing not found');

    let hasApplied = false;
    let isSaved = false;

    if (viewerId) {
      const app = await this.prisma.jobApplication.findUnique({
        where: { jobId_applicantId: { jobId, applicantId: viewerId } },
      });
      hasApplied = !!app;

      const saved = await this.prisma.savedJob.findUnique({
        where: { userId_jobId: { userId: viewerId, jobId } },
      });
      isSaved = !!saved;
    }

    return {
      ...job,
      hasApplied,
      isSaved,
    };
  }

  async applyToJob(jobId: string, applicantId: string, dto: ApplyJobDto) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== JobStatus.OPEN) {
      throw new NotFoundException('Job is no longer open for applications');
    }

    const existing = await this.prisma.jobApplication.findUnique({
      where: { jobId_applicantId: { jobId, applicantId } },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    const application = await this.prisma.jobApplication.create({
      data: {
        jobId,
        applicantId,
        resumeUrl: dto.resumeUrl,
        coverLetter: dto.coverLetter,
        status: ApplicationStatus.APPLIED,
      },
    });

    await this.prisma.job.update({
      where: { id: jobId },
      data: { applicationCount: { increment: 1 } },
    });

    // Notify recruiter/poster
    const applicant = await this.prisma.user.findUnique({
      where: { id: applicantId },
      select: { firstName: true, lastName: true },
    });

    await this.prisma.notification.create({
      data: {
        recipientId: job.postedById,
        actorId: applicantId,
        type: NotificationType.JOB_APPLICATION_UPDATE,
        entityType: EntityType.JOB,
        entityId: jobId,
        message: `${applicant?.firstName} ${applicant?.lastName} submitted an application for ${job.title}`,
      },
    });

    return application;
  }

  async toggleSaveJob(userId: string, jobId: string) {
    const existing = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (existing) {
      await this.prisma.savedJob.delete({ where: { userId_jobId: { userId, jobId } } });
      return { isSaved: false, message: 'Job removed from saved jobs' };
    }

    await this.prisma.savedJob.create({
      data: { userId, jobId },
    });
    return { isSaved: true, message: 'Job saved successfully' };
  }

  async getMyApplications(userId: string) {
    return this.prisma.jobApplication.findMany({
      where: { applicantId: userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getMySavedJobs(userId: string) {
    const saved = await this.prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    return saved.map((s) => s.job);
  }
}
