import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ToolsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { search?: string; category?: string; provider?: string }) {
    const { search, category, provider } = query;

    return this.prisma.tool.findMany({
      where: {
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { org: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(provider && { provider: provider.toUpperCase() as never }),
        ...(category && { category: { slug: category } }),
      },
      include: {
        tags: { select: { label: true, cls: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    });
  }

  async findBySlug(slug: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { slug },
      include: {
        tags: true,
        category: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });
    if (!tool) throw new NotFoundException('Tool not found');
    return tool;
  }

  async getReviews(slug: string) {
    const tool = await this.prisma.tool.findUnique({ where: { slug }, select: { id: true } });
    if (!tool) throw new NotFoundException('Tool not found');

    return this.prisma.review.findMany({
      where: { toolId: tool.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async addReview(userId: string, slug: string, rating: number, comment?: string) {
    const tool = await this.prisma.tool.findUnique({ where: { slug }, select: { id: true } });
    if (!tool) throw new NotFoundException('Tool not found');

    const review = await this.prisma.review.upsert({
      where: { userId_toolId: { userId, toolId: tool.id } },
      create: { userId, toolId: tool.id, rating, comment },
      update: { rating, comment },
    });

    // Recalculate average rating
    const agg = await this.prisma.review.aggregate({
      where: { toolId: tool.id },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.tool.update({
      where: { id: tool.id },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });

    return review;
  }
}
