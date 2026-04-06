import { Injectable } from '@nestjs/common';
import { RESEARCH_POSTS } from './research.data';

@Injectable()
export class ResearchService {
  findAll() {
    return RESEARCH_POSTS;
  }
}
