import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResumesService {
  constructor(private prisma: PrismaService) {}

  async getMyResumes(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async saveResume(userId: string, dto: { filename: string; s3Key: string; size: number }) {
    // Unset other defaults if this is first
    const existing = await this.prisma.resume.findMany({ where: { userId } });
    const isDefault = existing.length === 0;

    return this.prisma.resume.create({
      data: {
        userId,
        filename: dto.filename,
        s3Key: dto.s3Key,
        size: dto.size,
        isDefault,
      },
    });
  }

  async deleteResume(resumeId: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) throw new NotFoundException();
    if (resume.userId !== userId) throw new ForbiddenException();

    await this.prisma.resume.delete({ where: { id: resumeId } });
    return { message: 'Resume deleted successfully' };
  }
}
