import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto, RunAgentDto } from './dto/agent.dto';

@ApiTags('agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agents')
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new agent' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateAgentDto) {
    return this.agents.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List agents for current user' })
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.agents.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent details' })
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.agents.findOne(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update agent config' })
  update(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string, @Body() dto: UpdateAgentDto) {
    return this.agents.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an agent' })
  remove(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.agents.remove(user.userId, id);
  }

  @Post(':id/deploy')
  @ApiOperation({ summary: 'Set agent status to ACTIVE' })
  deploy(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.agents.deploy(user.userId, id);
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Queue an agent execution' })
  run(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: RunAgentDto,
  ) {
    return this.agents.run(user.userId, id, dto);
  }

  @Get('executions/:execId')
  @ApiOperation({ summary: 'Get execution status and output' })
  getExecution(@CurrentUser() user: CurrentUserPayload, @Param('execId') execId: string) {
    return this.agents.getExecution(user.userId, execId);
  }
}
