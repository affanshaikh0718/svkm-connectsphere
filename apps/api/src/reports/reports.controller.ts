import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { EntityType, ReportCategory, UserRole } from '@prisma/client';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  async createReport(
    @CurrentUser('id') userId: string,
    @Body('targetType') targetType: EntityType,
    @Body('targetId') targetId: string,
    @Body('category') category: ReportCategory,
    @Body('description') description?: string,
  ) {
    return this.reportsService.createReport(userId, targetType, targetId, category, description);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllReports() {
    return this.reportsService.getAllReports();
  }
}
