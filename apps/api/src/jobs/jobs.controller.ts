import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApplyJobDto, CreateJobDto } from './dto/job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Public()
  @Get()
  async getAllJobs(
    @Query('keyword') keyword?: string,
    @Query('locationType') locationType?: string,
    @Query('employmentType') employmentType?: string,
    @Query('experienceLevel') experienceLevel?: string,
  ) {
    return this.jobsService.getAllJobs({
      keyword,
      locationType,
      employmentType,
      experienceLevel,
    });
  }

  @Get('user/applications')
  async getMyApplications(@CurrentUser('id') userId: string) {
    return this.jobsService.getMyApplications(userId);
  }

  @Get('user/saved')
  async getMySavedJobs(@CurrentUser('id') userId: string) {
    return this.jobsService.getMySavedJobs(userId);
  }

  @Public()
  @Get(':id')
  async getJobById(
    @Param('id') id: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.jobsService.getJobById(id, viewerId);
  }

  @Post()
  async createJob(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobsService.createJob(userId, dto);
  }

  @Post(':id/apply')
  async applyToJob(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ApplyJobDto,
  ) {
    return this.jobsService.applyToJob(id, userId, dto);
  }

  @Post(':id/save')
  async toggleSaveJob(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.jobsService.toggleSaveJob(userId, id);
  }
}
