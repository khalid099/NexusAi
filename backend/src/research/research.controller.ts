import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResearchService } from './research.service';

@ApiTags('research')
@Controller('research')
export class ResearchController {
  constructor(private readonly research: ResearchService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Get research feed posts' })
  findAll() {
    return this.research.findAll();
  }
}
