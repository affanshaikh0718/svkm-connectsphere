import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { CompanyMemberRole } from '@prisma/client';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  async createCompany(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companiesService.createCompany(userId, dto);
  }

  @Public()
  @Get(':slug')
  async getCompanyBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.companiesService.getCompanyBySlug(slug, viewerId);
  }

  @Put(':id')
  async updateCompany(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.updateCompany(id, userId, dto);
  }

  @Post(':id/request')
  async requestMembership(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.companiesService.requestMembership(id, userId);
  }

  @Post(':id/join')
  async joinCompany(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.companiesService.requestMembership(id, userId);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @CurrentUser('id') adminUserId: string,
    @Body('userId') targetUserId?: string,
    @Body('role') role?: CompanyMemberRole,
  ) {
    return this.companiesService.addMember(id, adminUserId, targetUserId, role);
  }
}
