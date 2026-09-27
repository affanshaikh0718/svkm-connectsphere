import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ModerationAction, UserRole, UserStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/status')
  async setUserStatus(
    @CurrentUser('id') adminId: string,
    @Param('id') targetUserId: string,
    @Body('status') status: UserStatus,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.setUserStatus(adminId, targetUserId, status, reason);
  }

  @Put('reports/:id/action')
  async handleReport(
    @CurrentUser('id') adminId: string,
    @Param('id') reportId: string,
    @Body('action') action: ModerationAction,
    @Body('reviewNote') reviewNote?: string,
  ) {
    return this.adminService.handleReport(adminId, reportId, action, reviewNote);
  }

  @Get('audit-logs')
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
