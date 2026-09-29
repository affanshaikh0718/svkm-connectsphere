import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConnectionsModule } from './connections/connections.module';
import { PostsModule } from './posts/posts.module';
import { FeedModule } from './feed/feed.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { JobsModule } from './jobs/jobs.module';
import { CompaniesModule } from './companies/companies.module';
import { ResumesModule } from './resumes/resumes.module';
import { SearchModule } from './search/search.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '../../.env', '../.env'],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    ConnectionsModule,
    PostsModule,
    FeedModule,
    MessagingModule,
    NotificationsModule,
    JobsModule,
    CompaniesModule,
    ResumesModule,
    SearchModule,
    ReportsModule,
    AdminModule,
    HealthModule,
    RecommendationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
