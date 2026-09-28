import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MessagingService } from './messaging.service';
import { MessagingController, MessagesAuxController } from './messaging.controller';
import { MessagingGateway } from './messaging.gateway';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MessagingController, MessagesAuxController],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService, MessagingGateway],
})
export class MessagingModule {}
