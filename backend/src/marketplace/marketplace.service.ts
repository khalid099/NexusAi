import { Injectable } from '@nestjs/common';
import { MARKETPLACE_LABS, MARKETPLACE_MODELS } from './marketplace.data';

@Injectable()
export class MarketplaceService {
  getCatalog() {
    return {
      models: MARKETPLACE_MODELS,
      labs: MARKETPLACE_LABS,
    };
  }
}
