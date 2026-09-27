import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('resumes')
export class ResumesController {
  constructor(private resumesService: ResumesService) {}

  @Get()
  async getMyResumes(@CurrentUser('id') userId: string) {
    return this.resumesService.getMyResumes(userId);
  }

  @Post()
  async saveResume(
    @CurrentUser('id') userId: string,
    @Body() dto: { filename: string; s3Key: string; size: number },
  ) {
    return this.resumesService.saveResume(userId, dto);
  }

  @Delete(':id')
  async deleteResume(
    @CurrentUser('id') userId: string,
    @Param('id') resumeId: string,
  ) {
    return this.resumesService.deleteResume(resumeId, userId);
  }
}
