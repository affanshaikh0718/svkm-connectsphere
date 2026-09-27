import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationAction, ReportStatus, UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, activeUsers, totalPosts, totalJobs, pendingReports, totalCompanies] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { status: 'ACTIVE' } }),
        this.prisma.post.count({ where: { isDeleted: false } }),
        this.prisma.job.count({ where: { status: 'OPEN' } }),
        this.prisma.report.count({ where: { status: 'PENDING' } }),
        this.prisma.company.count(),
      ]);

    return {
      totalUsers,
      activeUsers,
      totalPosts,
      totalJobs,
      pendingReports,
      totalCompanies,
    };
  }

  async getAllUsers(take = 50) {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async setUserStatus(adminId: string, targetUserId: string, status: UserStatus, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { status },
    });

    // Record audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: `USER_STATUS_${status}`,
        entityType: 'USER',
        entityId: targetUserId,
        metadata: { reason: reason || 'Administrative action' },
      },
    });

    return updated;
  }

  async handleReport(adminId: string, reportId: string, action: ModerationAction, reviewNote?: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.ACTION_TAKEN,
        reviewedById: adminId,
        actionTaken: action,
        reviewNote,
      },
    });

    if (action === ModerationAction.CONTENT_REMOVED && report.targetType === 'POST') {
      await this.prisma.post.update({
        where: { id: report.targetId },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } else if (action === ModerationAction.SUSPENDED && report.targetType === 'USER') {
      await this.prisma.user.update({
        where: { id: report.targetId },
        data: { status: UserStatus.SUSPENDED },
      });
    } else if (action === ModerationAction.BANNED && report.targetType === 'USER') {
      await this.prisma.user.update({
        where: { id: report.targetId },
        data: { status: UserStatus.BANNED },
      });
    }

    return updated;
  }

  async getAuditLogs(take = 50) {
    return this.prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
