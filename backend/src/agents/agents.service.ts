import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto, UpdateAgentDto, RunAgentDto } from './dto/agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('agents') private readonly agentsQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateAgentDto) {
    return this.prisma.agent.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        config: dto.config as object,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.agent.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { executions: true } },
      },
    });
  }

  async findOne(userId: string, agentId: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Agent not found');
    if (agent.userId !== userId) throw new ForbiddenException();
    return agent;
  }

  async update(userId: string, agentId: string, dto: UpdateAgentDto) {
    await this.findOne(userId, agentId);
    return this.prisma.agent.update({
      where: { id: agentId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.config && { config: dto.config as object }),
      },
    });
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
        status: 'PENDING',
        input: (dto.input ?? {}) as object,
      },
    });

    await this.agentsQueue.add(
      'run-agent',
      {
        executionId: execution.id,
        agentId,
        config: agent.config as Record<string, unknown>,
        input: (dto.input ?? {}) as Record<string, unknown>,
      },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    return { executionId: execution.id, status: 'PENDING' };
  }

  async getExecution(userId: string, executionId: string) {
    const exec = await this.prisma.execution.findUnique({
      where: { id: executionId },
      include: { agent: { select: { userId: true, name: true } } },
    });
    if (!exec) throw new NotFoundException('Execution not found');
    if (exec.agent.userId !== userId) throw new ForbiddenException();
    return exec;
  }
}
