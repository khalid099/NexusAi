import {
  Controller, Get, Post, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { ToolsService } from './tools.service';
import { CreateReviewDto } from './dto/review.dto';

@ApiTags('models')
@Controller('models')
export class ToolsController {
  constructor(private readonly tools: ToolsService) {}

  @Get()
  @ApiOperation({ summary: 'List all AI models/tools with optional filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'provider', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('provider') provider?: string,
  ) {
    return this.tools.findAll({ search, category, provider });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single model/tool by slug' })
  findOne(@Param('slug') slug: string) {
    return this.tools.findBySlug(slug);
  }

  @Get(':slug/reviews')
  @ApiOperation({ summary: 'Get reviews for a model' })
  getReviews(@Param('slug') slug: string) {
    return this.tools.getReviews(slug);
  }

  @Post(':slug/reviews')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add or update a review for a model' })
  addReview(
    @CurrentUser() user: CurrentUserPayload,
    @Param('slug') slug: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.tools.addReview(user.userId, slug, dto.rating, dto.comment);
  }
}
