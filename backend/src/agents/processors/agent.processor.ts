import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModelRouterService } from '../../ai/model-router.service';

export interface AgentJobData {
  executionId: string;
  agentId: string;
  config: Record<string, unknown>;
  input: Record<string, unknown>;
}

interface WorkflowStep {
  type: 'ai' | 'fetch' | 'transform';
  config: Record<string, unknown>;
}

@Processor('agents')
export class AgentProcessor extends WorkerHost {
  private readonly logger = new Logger(AgentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly router: ModelRouterService,
  ) {
    super();
  }

  async process(job: Job<AgentJobData>): Promise<void> {
    const { executionId, config, input } = job.data;

    await this.prisma.execution.update({
      where: { id: executionId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    const steps: WorkflowStep[] = (config.steps as WorkflowStep[]) ?? [];
    const stepResults: Record<string, unknown>[] = [];
    let context: Record<string, unknown> = { ...input };

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        let result: Record<string, unknown> = {};

        if (step.type === 'ai') {
          result = await this.runAiStep(step.config, context);
        } else if (step.type === 'fetch') {
          result = await this.runFetchStep(step.config);
        } else if (step.type === 'transform') {
          result = await this.runTransformStep(step.config, context);
        }

        stepResults.push({ step: i + 1, type: step.type, result });
        context = { ...context, ...result };

        await job.updateProgress(Math.round(((i + 1) / steps.length) * 100));
      }

      await this.prisma.execution.update({
        where: { id: executionId },
        data: {
          status: 'COMPLETED',
          output: context as object,
          stepResults: stepResults as unknown as object,
          finishedAt: new Date(),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Execution ${executionId} failed: ${message}`);

      await this.prisma.execution.update({
        where: { id: executionId },
        data: { status: 'FAILED', error: message, finishedAt: new Date() },
      });

      throw err;
    }
  }

  private async runAiStep(
    stepConfig: Record<string, unknown>,
    context: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const prompt = this.interpolate(String(stepConfig.prompt ?? ''), context);
    const { provider, modelId } = this.router.route(stepConfig.model as string | undefined);

    let content = '';

    if (provider === 'openai') {
      const res = await this.router.getOpenAI().chat.completions.create({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: (stepConfig.temperature as number) ?? 0.7,
      });
      content = res.choices[0].message.content ?? '';
    } else {
      const res = await this.router.getAnthropic().messages.create({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: (stepConfig.maxTokens as number) ?? 2048,
      });
      content = res.content[0].type === 'text' ? res.content[0].text : '';
    }

    return { aiOutput: content };
  }

  private async runFetchStep(
    stepConfig: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const url = String(stepConfig.url ?? '');
    const resp = await fetch(url, { headers: { 'User-Agent': 'NexusAI-Agent/1.0' } });
    const data = await resp.json();
    return { fetchResult: data };
  }

  private async runTransformStep(
    stepConfig: Record<string, unknown>,
    context: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const key = String(stepConfig.extract ?? 'aiOutput');
    return { transformed: context[key] };
  }

  private interpolate(template: string, vars: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''));
  }
}
