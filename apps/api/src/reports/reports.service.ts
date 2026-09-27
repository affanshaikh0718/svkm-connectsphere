import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntityType, ReportCategory, ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(
    reporterId: string,
    targetType: EntityType,
    targetId: string,
    category: ReportCategory,
    description?: string,
  ) {
    return this.prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        category,
        description,
        status: ReportStatus.PENDING,
      },
    });
  }

  async getAllReports() {
    return this.prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
