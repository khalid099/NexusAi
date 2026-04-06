import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplace: MarketplaceService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Get marketplace mock catalog' })
  getCatalog() {
    return this.marketplace.getCatalog();
  }
}
