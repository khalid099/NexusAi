import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto, UpdateAgentDto, RunAgentDto } from './dto/agent.dto';
import { ModelRouterService } from '../ai/model-router.service';

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly router: ModelRouterService,
  ) {}

  private parseJson<T>(value: string | null | undefined, fallback: T): T {
    if (!value) return fallback;

    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  private serializeAgent<T extends { config: string }>(agent: T) {
    return {
      ...agent,
      config: this.parseJson<Record<string, unknown>>(agent.config, {}),
    };
  }

  private serializeExecution<T extends { input: string | null; output: string | null; stepResults: string | null }>(execution: T) {
    return {
      ...execution,
      input: this.parseJson<Record<string, unknown>>(execution.input, {}),
      output: this.parseJson<Record<string, unknown>>(execution.output, {}),
      stepResults: this.parseJson<Record<string, unknown>[]>(execution.stepResults, []),
    };
  }

  private buildFallbackResponse(agent: {
    name: string;
    description: string | null;
    config: Record<string, unknown>;
  }, input: Record<string, unknown>) {
    const message = String(input.message ?? input.prompt ?? input.query ?? 'Hello');
    const systemPrompt = String(agent.config.systemPrompt ?? '').trim();
    const mainGoal = agent.description?.trim() || 'Help the user complete their request.';
    const toolSummary = Array.isArray(agent.config.tools) && agent.config.tools.length > 0
      ? `Tools available: ${(agent.config.tools as string[]).join(', ')}.`
      : 'No external tools are connected yet.';

    return [
      `Agent "${agent.name}" received your request: "${message}"`,
      '',
      systemPrompt ? `Role: ${systemPrompt}` : `Goal: ${mainGoal}`,
      toolSummary,
      '',
      'Suggested next steps:',
      '1. Confirm the exact outcome you want.',
      '2. Provide any files, links, or constraints the agent should use.',
      '3. Run again after deployment/tool setup for deeper automation.',
    ].join('\n');
  }

  private async generateAgentResponse(
    agent: { name: string; description: string | null; config: Record<string, unknown> },
    input: Record<string, unknown>,
  ) {
    const message = String(input.message ?? input.prompt ?? input.query ?? 'Hello');
    const systemPrompt = String(agent.config.systemPrompt ?? agent.description ?? '').trim();

    if (this.router.mockMode) {
      return this.buildFallbackResponse(agent, input);
    }

    try {
      const { provider, modelId } = this.router.route(String(agent.config.modelId ?? 'gpt-4o'));
      const prompt = [
        systemPrompt || `You are the custom AI agent "${agent.name}".`,
        '',
        `User request: ${message}`,
        '',
        'Respond as this specific agent. Be direct, useful, and action-oriented.',
      ].join('\n');

      if (provider === 'openai') {
        const result = await this.router.getOpenAI().chat.completions.create({
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt || `You are the custom AI agent "${agent.name}".` },
            { role: 'user', content: message },
          ],
          temperature: 0.7,
        });

        return result.choices[0]?.message?.content?.trim() || this.buildFallbackResponse(agent, input);
      }

      const result = await this.router.getAnthropic().messages.create({
        model: modelId,
        system: systemPrompt || `You are the custom AI agent "${agent.name}".`,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      });

      const text = result.content
        .filter((item) => item.type === 'text')
        .map((item) => item.text)
        .join('\n')
        .trim();

      return text || this.buildFallbackResponse(agent, input);
    } catch {
      return this.buildFallbackResponse(agent, input);
    }
  }

  async create(userId: string, dto: CreateAgentDto) {
    const agent = await this.prisma.agent.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        config: JSON.stringify(dto.config ?? {}),
      },
    });

    return this.serializeAgent(agent);
  }

  async findAll(userId: string) {
    const agents = await this.prisma.agent.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        config: true,
        _count: { select: { executions: true } },
      },
    });

    return agents.map((agent) => this.serializeAgent(agent));
  }

  async findOne(userId: string, agentId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        _count: { select: { executions: true } },
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            status: true,
            input: true,
            output: true,
            stepResults: true,
            error: true,
            startedAt: true,
            finishedAt: true,
            createdAt: true,
          },
        },
      },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    if (agent.userId !== userId) throw new ForbiddenException();

    return {
      ...this.serializeAgent(agent),
      executions: agent.executions.map((execution) => this.serializeExecution(execution)),
    };
  }

  async update(userId: string, agentId: string, dto: UpdateAgentDto) {
    await this.findOne(userId, agentId);
    const agent = await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.config && { config: JSON.stringify(dto.config) }),
      },
    });

    return this.serializeAgent(agent);
  }

  async remove(userId: string, agentId: string) {
    await this.findOne(userId, agentId);
    await this.prisma.agent.delete({ where: { id: agentId } });
  }

  async deploy(userId: string, agentId: string) {
    await this.findOne(userId, agentId);
    return this.prisma.agent.update({
      where: { id: agentId },
      data: { status: 'ACTIVE' },
      select: { id: true, status: true },
    });
  }

  async run(userId: string, agentId: string, dto: RunAgentDto) {
    const agent = await this.findOne(userId, agentId);

    const execution = await this.prisma.execution.create({
      data: {
        agentId,
        status: 'RUNNING',
        input: JSON.stringify(dto.input ?? {}),
        stepResults: JSON.stringify([]),
        startedAt: new Date(),
      },
    });

    try {
      const response = await this.generateAgentResponse(
        {
          name: agent.name,
          description: agent.description ?? null,
          config: agent.config as Record<string, unknown>,
        },
        dto.input ?? {},
      );

      await this.prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          output: JSON.stringify({
            message: response,
            agentId,
            agentName: agent.name,
          }),
          stepResults: JSON.stringify([
            {
              step: 1,
              type: 'ai',
              result: { message: response },
            },
          ]),
          finishedAt: new Date(),
        },
      });

      return {
        executionId: execution.id,
        status: 'COMPLETED',
        agentId,
        agentName: agent.name,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Agent run failed';

      await this.prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: message,
          finishedAt: new Date(),
        },
      });

      return {
        executionId: execution.id,
        status: 'FAILED',
        agentId,
        agentName: agent.name,
      };
    }
  }

  async getExecution(userId: string, executionId: string) {
    const exec = await this.prisma.execution.findUnique({
      where: { id: executionId },
      include: { agent: { select: { userId: true, name: true } } },
    });
    if (!exec) throw new NotFoundException('Execution not found');
    if (exec.agent.userId !== userId) throw new ForbiddenException();

    return {
      ...this.serializeExecution(exec),
      agent: exec.agent,
    };
  }
}
