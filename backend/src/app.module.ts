import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { AgentsModule } from './agents/agents.module';
import { ToolsModule } from './tools/tools.module';
import { ResearchModule } from './research/research.module';
import { MarketplaceModule } from './marketplace/marketplace.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: 60 },
    ]),

    PrismaModule,
    AuthModule,
    UsersModule,
    AiModule,
    AgentsModule,
    ToolsModule,
    ResearchModule,
    MarketplaceModule,
  ],
})
export class AppModule {}
