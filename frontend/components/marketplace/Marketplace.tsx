'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AutoAwesomeRounded,
  CategoryRounded,
  GraphicEqRounded,
  ImageRounded,
  LanguageRounded,
  LinkRounded,
  MicRounded,
  PsychologyRounded,
  SearchRounded,
  TravelExploreRounded,
} from '@mui/icons-material';
import { LABS, MODELS } from '@/lib/mock-data';
import type { Lab } from '@/lib/mock-data';
import { apiRequest } from '@/lib/auth';
import { Model } from '@/lib/types';
import ModelCard from './ModelCard';
import styles from './Marketplace.module.css';

interface MarketplaceProps {
  onSelectModel: (model: Model) => void;
  onOpenModal: (modelId: string, tab?: string) => void;
  onToast: (msg: string) => void;
}

interface MarketplaceCatalogResponse {
  models: Model[];
  labs: Lab[];
}

const FILTERS = [
  { id: 'all', label: 'All', icon: <CategoryRounded fontSize="small" /> },
  { id: 'language', label: 'Language', icon: <LanguageRounded fontSize="small" /> },
  { id: 'vision', label: 'Vision', icon: <TravelExploreRounded fontSize="small" /> },
  { id: 'code', label: 'Code', icon: <PsychologyRounded fontSize="small" /> },
  { id: 'image', label: 'Image Gen', icon: <ImageRounded fontSize="small" /> },
  { id: 'audio', label: 'Audio', icon: <GraphicEqRounded fontSize="small" /> },
  { id: 'open', label: 'Open Source', icon: <AutoAwesomeRounded fontSize="small" /> },
];

function parsePrice(value: string) {
  const match = value.match(/\$?\s*([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : 0;
}

function inferPricingBucket(model: Model) {
  const amount = parsePrice(model.price);
  if (model.price.toLowerCase().includes('free') || amount === 0) return 'Free tier';
  if (amount <= 1) return 'Pay-per-use';
  if (amount <= 20) return 'Subscription';
  return 'Enterprise';
}

function isOpenModel(model: Model) {
  const text = `${model.badge} ${model.desc} ${model.tags.map((tag) => tag.label).join(' ')}`.toLowerCase();
  return model.badge === 'open' || text.includes('open') || text.includes('self-host') || text.includes('commercial');
}

export default function Marketplace({ onSelectModel, onOpenModal, onToast }: MarketplaceProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeLab, setActiveLab] = useState('all');
  const [catalogModels, setCatalogModels] = useState<Model[]>(MODELS);
  const [catalogLabs, setCatalogLabs] = useState<Lab[]>(LABS);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral']);
  const [selectedPricing, setSelectedPricing] = useState<string[]>(['Pay-per-use', 'Subscription']);
  const [maxPrice, setMaxPrice] = useState(100);
  const [minRating, setMinRating] = useState(0);
  const [license, setLicense] = useState<'all' | 'commercial' | 'open'>('all');

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        const data = await apiRequest<MarketplaceCatalogResponse>('/marketplace/catalog');
        if (!active) return;
        setCatalogModels(data.models);
        setCatalogLabs(data.labs);
      } catch {
        if (!active) return;
        setCatalogModels(MODELS);
        setCatalogLabs(LABS);
        onToast('Marketplace fallback loaded');
      }
    }

    void loadCatalog();

    return () => {
      active = false;
    };
  }, [onToast]);

  const matchesBaseFilters = useCallback((model: Model, labId?: string) => {
    const haystack = `${model.name} ${model.org} ${model.desc} ${model.tags.map((tag) => tag.label).join(' ')}`.toLowerCase();
    const matchSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const matchFilter =
      filter === 'all' ||
      model.category.includes(filter) ||
      model.tags.some((tag) => tag.label.toLowerCase().includes(filter)) ||
      (filter === 'open' && isOpenModel(model));
    const matchLab = !labId || labId === 'all' || model.lab === labId;
    const matchProvider = selectedProviders.length === 0 || selectedProviders.includes(model.org);
    const matchPricing = selectedPricing.length === 0 || selectedPricing.includes(inferPricingBucket(model));
    const matchPrice = parsePrice(model.price) <= maxPrice || model.price.toLowerCase().includes('free');
    const matchRating = model.rating >= minRating;
    const matchLicense =
      license === 'all' ||
      (license === 'open' && isOpenModel(model)) ||
      (license === 'commercial' && !model.desc.toLowerCase().includes('research only'));

    return matchSearch && matchFilter && matchLab && matchProvider && matchPricing && matchPrice && matchRating && matchLicense;
  }, [filter, license, maxPrice, minRating, search, selectedPricing, selectedProviders]);

  const filtered = useMemo(() => catalogModels.filter((model) => matchesBaseFilters(model, activeLab)), [activeLab, catalogModels, matchesBaseFilters]);

  const labCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: catalogModels.filter((model) => matchesBaseFilters(model, 'all')).length,
    };

    catalogLabs.forEach((lab) => {
      counts[lab.id] = catalogModels.filter((model) => matchesBaseFilters(model, lab.id)).length;
    });

    return counts;
  }, [catalogLabs, catalogModels, matchesBaseFilters]);

  const fallbackModel = filtered[0] ?? catalogModels[0] ?? MODELS[0];

  const toggleProvider = (provider: string) => {
    setSelectedProviders((current) =>
      current.includes(provider)
        ? current.filter((item) => item !== provider)
        : [...current, provider],
    );
  };

  const togglePricing = (value: string) => {
    setSelectedPricing((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.title}>Model Marketplace</span>
          <p>Curated AI models with premium comparison surfaces, faster filtering, and builder-first guidance.</p>
        </div>

        <div className={styles.searchCluster}>
          <div className={styles.searchWrap}>
            <SearchRounded fontSize="small" />
            <input
              className={styles.searchInput}
              placeholder="Search models, capabilities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className={styles.searchTools}>
              <button type="button" className={styles.searchTool} onClick={() => onToast('Voice search coming soon')}>
                <MicRounded fontSize="small" />
              </button>
              <button type="button" className={styles.searchTool} onClick={() => onToast('Quick link search coming soon')}>
                <LinkRounded fontSize="small" />
              </button>
              <button type="button" className={styles.searchTool} onClick={() => onToast('Visual search coming soon')}>
                <ImageRounded fontSize="small" />
              </button>
            </div>
          </div>

          <div className={styles.filterRow}>
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.mfil} ${filter === item.id ? styles.mfilOn : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.labsBar}>
        <span className={styles.labsLbl}>AI Labs</span>
        <button
          type="button"
          className={`${styles.labPill} ${activeLab === 'all' ? styles.labOn : ''}`}
          onClick={() => setActiveLab('all')}
        >
          <span>All Labs</span>
          <span className={styles.labCount}>{labCounts.all}</span>
        </button>
        {catalogLabs.map((lab) => (
          <button
            key={lab.id}
            type="button"
            className={`${styles.labPill} ${activeLab === lab.id ? styles.labOn : ''}`}
            onClick={() => setActiveLab(lab.id)}
          >
            <span className={styles.labIcon}>{lab.icon}</span>
            <span>{lab.name}</span>
            <span className={styles.labCount}>{labCounts[lab.id] ?? 0}</span>
          </button>
        ))}
      </section>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <button type="button" className={styles.guideCard} onClick={() => onToast('AI guide flow coming soon')}>
            <div className={styles.guideTitle}>Need help choosing?</div>
            <p>Chat with our AI guide for a personalised recommendation in 60 seconds.</p>
          </button>

          <div className={styles.filterSec}>
            <div className={styles.filterTitle}>Provider</div>
            {['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'Cohere'].map((provider) => (
              <label key={provider} className={styles.mktCheck}>
                <input
                  type="checkbox"
                  checked={selectedProviders.includes(provider)}
                  onChange={() => toggleProvider(provider)}
                />
                <span>{provider}</span>
              </label>
            ))}
          </div>

          <div className={styles.filterSec}>
            <div className={styles.filterTitle}>Pricing model</div>
            {['Pay-per-use', 'Subscription', 'Free tier', 'Enterprise'].map((option) => (
              <label key={option} className={styles.mktCheck}>
                <input
                  type="checkbox"
                  checked={selectedPricing.includes(option)}
                  onChange={() => togglePricing(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <div className={styles.filterSec}>
            <div className={styles.filterTitle}>Max price /1M tokens</div>
            <input
              className={styles.range}
              type="range"
              min="0"
              max="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className={styles.rangeValue}>Up to ${maxPrice}</div>
          </div>

          <div className={styles.filterSec}>
            <div className={styles.filterTitle}>Min rating</div>
            <div className={styles.ratingRow}>
              {[0, 4, 4.5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.ratingPill} ${minRating === value ? styles.ratingPillOn : ''}`}
                  onClick={() => setMinRating(value)}
                >
                  {value === 0 ? 'Any' : `${value}+ ★`}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterSec}>
            <div className={styles.filterTitle}>Licence</div>
            <div className={styles.ratingRow}>
              {[
                { id: 'all', label: 'All' },
                { id: 'commercial', label: 'Commercial' },
                { id: 'open', label: 'Open source' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.ratingPill} ${license === item.id ? styles.ratingPillOn : ''}`}
                  onClick={() => setLicense(item.id as 'all' | 'commercial' | 'open')}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterSec}>
            <div className={styles.filterTitle}>Quick guides</div>
            {[
              { text: 'Prompt engineering tips', tab: 'prompt' },
              { text: 'Agent creation guide', tab: 'agent' },
              { text: 'Pricing comparison', tab: 'pricing' },
            ].map((guide) => (
              <button
                key={guide.text}
                type="button"
                className={styles.guideBtn}
                onClick={() => onOpenModal(fallbackModel.id, guide.tab)}
              >
                {guide.text}
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.main}>
          <div className={styles.grid}>
            {filtered.length === 0 ? (
              <div className={styles.emptyState}>No models match your current filters. Try widening the search.</div>
            ) : (
              filtered.map((model, index) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  index={index}
                  onSelect={onSelectModel}
                  onOpenModal={onOpenModal}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
