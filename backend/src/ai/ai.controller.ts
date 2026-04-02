import {
  Controller, Post, Get, Param, Body, Res,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { ChatCompletionDto } from './dto/chat.dto';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('completions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stream a chat completion via SSE' })
  streamChat(
    @Body() dto: ChatCompletionDto,
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ) {
    return this.ai.streamChat(dto, user.userId, res);
  }

  @Get('history')
  @ApiOperation({ summary: 'List all chat sessions for the current user' })
  getHistory(@CurrentUser() user: CurrentUserPayload) {
    return this.ai.getChatHistory(user.userId);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a specific session with its messages' })
  getSession(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.ai.getSession(user.userId, id);
  }
}
