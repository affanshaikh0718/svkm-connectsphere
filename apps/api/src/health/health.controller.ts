import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'connectsphere-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
