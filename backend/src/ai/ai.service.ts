import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ModelRouterService } from './model-router.service';
import { ChatCompletionDto, ChatMessageDto } from './dto/chat.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly router: ModelRouterService,
  ) {}

  async streamChat(dto: ChatCompletionDto, userId: string, res: Response): Promise<void> {
    const { provider, modelId } = this.router.route(dto.model);
    const startedAt = Date.now();

    // Ensure session exists
    let sessionId = dto.sessionId;
    if (!sessionId) {
      const session = await this.prisma.chatSession.create({
        data: {
          userId,
          modelId,
          title: this.extractTitle(dto.messages),
        },
      });
      sessionId = session.id;
    }

    // Persist user message
    await this.prisma.message.create({
      data: {
        sessionId,
        role: 'USER',
        content: dto.messages[dto.messages.length - 1].content,
      },
    });

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send session id first so client can track it
    res.write(`data: ${JSON.stringify({ type: 'session', sessionId })}\n\n`);

    let fullContent = '';
    let totalTokens = 0;

    try {
      if (this.router.mockMode) {
        await this.streamMockResponse(dto.messages[dto.messages.length - 1].content, modelId, res);
        const latencyMs = Date.now() - startedAt;
        await this.prisma.message.create({
          data: { sessionId, role: 'ASSISTANT', content: '[Mock response]', latencyMs, modelUsed: modelId },
        });
        res.write(`data: ${JSON.stringify({ type: 'done', sessionId, latencyMs, tokens: 42 })}\n\n`);
        res.end();
        return;
      }

      if (provider === 'openai') {
        const stream = await this.router.getOpenAI().chat.completions.create({
          model: modelId,
          messages: dto.messages,
          temperature: dto.temperature ?? 0.7,
          max_tokens: dto.maxTokens,
          stream: true,
        });

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) {
            fullContent += delta;
            res.write(`data: ${JSON.stringify({ type: 'delta', content: delta })}\n\n`);
          }
          if (chunk.usage) totalTokens = chunk.usage.total_tokens;
        }
      } else {
        const stream = await this.router.getAnthropic().messages.stream({
          model: modelId,
          messages: dto.messages as { role: 'user' | 'assistant'; content: string }[],
          max_tokens: dto.maxTokens ?? 4096,
          temperature: dto.temperature ?? 0.7,
        });

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const delta = event.delta.text;
            fullContent += delta;
            res.write(`data: ${JSON.stringify({ type: 'delta', content: delta })}\n\n`);
          }
        }

        const finalMsg = await stream.finalMessage();
        totalTokens = finalMsg.usage.input_tokens + finalMsg.usage.output_tokens;
      }

      const latencyMs = Date.now() - startedAt;

      // Persist assistant message
      await this.prisma.message.create({
        data: {
          sessionId,
          role: 'ASSISTANT',
          content: fullContent,
          tokenCount: totalTokens,
          latencyMs,
          modelUsed: modelId,
        },
      });

      // Update session token count
      await this.prisma.chatSession.update({
        where: { id: sessionId },
        data: { tokenCount: { increment: totalTokens } },
      });

      // Usage record
      await this.prisma.usageRecord.create({
        data: {
          userId,
          modelId,
          tokens: totalTokens,
          latencyMs,
          endpoint: 'chat/completions',
        },
      });

      res.write(`data: ${JSON.stringify({ type: 'done', sessionId, latencyMs, tokens: totalTokens })}\n\n`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Stream error';
      res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
    } finally {
      res.end();
    }
  }

  private async streamMockResponse(userMsg: string, modelId: string, res: Response): Promise<void> {
    const mockReply = `[Mock — ${modelId}] You said: "${userMsg.slice(0, 80)}". This is a simulated response. Set real API keys in .env to enable live AI.`;
    const words = mockReply.split(' ');
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ type: 'delta', content: word + ' ' })}\n\n`);
      await new Promise(r => setTimeout(r, 40));
    }
  }

  async getChatHistory(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        modelId: true,
        tokenCount: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async getSession(userId: string, sessionId: string) {
    return this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, role: true, content: true, createdAt: true, modelUsed: true, latencyMs: true },
        },
      },
    });
  }

  private extractTitle(messages: ChatMessageDto[]): string {
    const first = messages.find(m => m.role === 'user')?.content ?? 'New chat';
    return first.slice(0, 60);
  }
}
