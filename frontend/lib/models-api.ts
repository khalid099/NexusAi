import { apiRequest } from '@/lib/auth';
import type { Model } from '@/lib/types';

interface BackendToolTag {
  label: string;
  cls: string;
}

interface BackendToolCategory {
  name?: string;
  slug?: string;
}

interface BackendToolCount {
  reviews?: number;
}

interface BackendToolMetadata {
  modelId?: string;
  mmlu?: string;
  humaneval?: string;
  math?: string;
}

export interface BackendTool {
  id: string;
  slug: string;
  name: string;
  org: string;
  provider?: string;
  icon?: string | null;
  iconBg?: string | null;
  badge?: string | null;
  description: string;
  contextLen?: string | null;
  latency?: string | null;
  price: string;
  rating?: number | null;
  reviewCount?: number | null;
  metadata?: BackendToolMetadata | null;
  tags?: BackendToolTag[];
  category?: BackendToolCategory | null;
  _count?: BackendToolCount;
}

const PROVIDER_ICON_MAP: Record<string, string> = {
  OPENAI: '◎',
  ANTHROPIC: '✦',
  GOOGLE: '✳',
  META: '◫',
  MISTRAL: '≈',
  OTHER: '◌',
};

const PROVIDER_BG_MAP: Record<string, string> = {
  OPENAI: '#edf1ff',
  ANTHROPIC: '#f7efe7',
  GOOGLE: '#edf8ed',
  META: '#eef4ff',
  MISTRAL: '#eef8ff',
  OTHER: '#f3efe9',
};

function normalizeBadge(value?: string | null): Model['badge'] {
  if (value === 'new' || value === 'hot' || value === 'open' || value === 'beta') {
    return value;
  }

  return 'beta';
}

function normalizeMetadata(raw: BackendTool['metadata']): BackendToolMetadata {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  return raw;
}

export function mapBackendToolToModel(tool: BackendTool): Model {
  const metadata = normalizeMetadata(tool.metadata);
  const provider = tool.provider?.toUpperCase() ?? 'OTHER';

  return {
    id: tool.slug,
    name: tool.name,
    org: tool.org,
    provider,
    icon: tool.icon || PROVIDER_ICON_MAP[provider] || PROVIDER_ICON_MAP.OTHER,
    iconBg: tool.iconBg || PROVIDER_BG_MAP[provider] || PROVIDER_BG_MAP.OTHER,
    badge: normalizeBadge(tool.badge),
    desc: tool.description,
    tags: tool.tags ?? [],
    rating: tool.rating ?? 0,
    reviews: tool.reviewCount ?? tool._count?.reviews ?? 0,
    price: tool.price || 'Custom',
    category: tool.category?.slug ? [tool.category.slug] : [],
    lab: tool.org,
    ctx: tool.contextLen || 'N/A',
    latency: tool.latency || 'Standard',
    mmlu: metadata.mmlu,
    humaneval: metadata.humaneval,
    math: metadata.math,
    backendModelId: metadata.modelId || tool.slug,
  };
}

export async function fetchModels(search?: string) {
  const query = new URLSearchParams();
  if (search?.trim()) {
    query.set('search', search.trim());
  }

  const suffix = query.toString();
  const tools = await apiRequest<BackendTool[]>(`/models${suffix ? `?${suffix}` : ''}`);
  return tools.map(mapBackendToolToModel);
}

export async function fetchModelById(modelId: string) {
  const tool = await apiRequest<BackendTool>(`/models/${modelId}`);
  return mapBackendToolToModel(tool);
}
