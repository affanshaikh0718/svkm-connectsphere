import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
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

  @Get('me/summary')
  async getMySummary(@CurrentUser('id') userId: string) {
    return this.usersService.getProfileSummary(userId);
  }

  @Get('me/profile-summary')
  async getMyProfileSummary(@CurrentUser('id') userId: string) {
    return this.usersService.getProfileSummary(userId);
  }

  @Get('me/analytics')
  async getMyAnalytics(@CurrentUser('id') userId: string) {
    return this.usersService.getAnalytics(userId);
  }

  @Get('me/profile-viewers')
  async getMyProfileViewers(@CurrentUser('id') userId: string) {
    return this.usersService.getAnalytics(userId);
  }

  @Get('me/profile-completion')
  async getMyProfileCompletion(@CurrentUser('id') userId: string) {
    return this.usersService.getProfileCompletion(userId);
  }

  @Get('me/saved-posts')
  async getMySavedPosts(@CurrentUser('id') userId: string) {
    return this.usersService.getSavedPosts(userId);
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
  async updateProfilePut(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('me/profile')
  async updateProfilePatch(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('me/profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'avatars');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname || '.jpg');
          cb(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadProfilePicture(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const profilePictureUrl = `http://localhost:4000/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(userId, profilePictureUrl);
  }

  @Post('me/cover-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'covers');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname || '.jpg');
          cb(null, `cover-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
    }),
  )
  async uploadCoverImage(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const coverImageUrl = `http://localhost:4000/uploads/covers/${file.filename}`;
    return this.usersService.updateCoverImage(userId, coverImageUrl);
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
