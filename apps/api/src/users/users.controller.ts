import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { EducationDto, ExperienceDto, UpdateProfileDto } from './dto/profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Public()
  @Get(':username')
  async getByUsername(
    @Param('username') username: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.usersService.getByUsername(username, viewerId);
  }

  @Put('me/profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('me/experience')
  async addExperience(
    @CurrentUser('id') userId: string,
    @Body() dto: ExperienceDto,
  ) {
    return this.usersService.addExperience(userId, dto);
  }

  @Delete('me/experience/:id')
  async deleteExperience(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.deleteExperience(userId, id);
  }

  @Post('me/education')
  async addEducation(
    @CurrentUser('id') userId: string,
    @Body() dto: EducationDto,
  ) {
    return this.usersService.addEducation(userId, dto);
  }

  @Delete('me/education/:id')
  async deleteEducation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.deleteEducation(userId, id);
  }

  @Post('me/skills')
  async addSkill(
    @CurrentUser('id') userId: string,
    @Body('name') name: string,
  ) {
    return this.usersService.addSkill(userId, name);
  }

  @Delete('me/skills/:id')
  async removeSkill(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.removeSkill(userId, id);
  }
}
