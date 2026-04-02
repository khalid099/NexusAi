import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { AgentProcessor } from './processors/agent.processor';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'agents' }),
    AiModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService, AgentProcessor],
})
export class AgentsModule {}
