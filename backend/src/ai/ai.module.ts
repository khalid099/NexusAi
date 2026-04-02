import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ModelRouterService } from './model-router.service';

@Module({
  controllers: [AiController],
  providers: [AiService, ModelRouterService],
  exports: [AiService, ModelRouterService],
})
export class AiModule {}
