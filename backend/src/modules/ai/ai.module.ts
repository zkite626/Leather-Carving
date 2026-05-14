import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AIConfigService } from './ai-config.service';

@Module({
  controllers: [AIController],
  providers: [AIService, AIConfigService],
  exports: [AIService, AIConfigService],
})
export class AIModule {}
