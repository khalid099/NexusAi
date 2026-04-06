'use client';
import { ArrowOutwardRounded, StarRounded } from '@mui/icons-material';
import { Model } from '@/lib/types';
import styles from './ModelCard.module.css';

interface ModelCardProps {
  model: Model;
  index?: number;
  onSelect: (model: Model) => void;
  onOpenModal: (modelId: string) => void;
}

export default function ModelCard({ model, index = 0, onSelect, onOpenModal }: ModelCardProps) {
  const badgeLabel =
    model.badge === 'new' ? 'New' :
      model.badge === 'hot' ? 'Hot' :
        model.badge === 'open' ? 'Open' : 'Beta';

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 55}ms` }}
      onClick={() => onSelect(model)}
    >
      <div className={styles.top}>
        <div className={styles.iconWrap}>
          <div className={styles.icon} style={{ background: model.iconBg }}>{model.icon}</div>
          <div>
            <div className={styles.name}>{model.name}</div>
            <div className={styles.org}>{model.org}</div>
          </div>
        </div>
        <span className={styles.badge}>{badgeLabel}</span>
      </div>

      <p className={styles.desc}>{model.desc}</p>

      <div className={styles.tags}>
        {model.tags.slice(0, 4).map((tag) => (
          <span key={tag.label} className={styles.tag}>{tag.label}</span>
        ))}
      </div>

      <div className={styles.stats}>
        <div>
          <strong>{model.ctx}</strong>
          <span>Context</span>
        </div>
        <div>
          <strong>{model.price}</strong>
          <span>Entry price</span>
        </div>
        <div>
          <strong>{model.rating.toFixed(1)}</strong>
          <span>Rating</span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.rating}>
          <StarRounded sx={{ fontSize: 16 }} />
          <span>{model.rating.toFixed(1)} ({model.reviews.toLocaleString()})</span>
        </div>
        <button
          type="button"
          className={styles.cta}
          onClick={(event) => {
            event.stopPropagation();
            onOpenModal(model.id);
          }}
        >
          Explore
          <ArrowOutwardRounded sx={{ fontSize: 16 }} />
        </button>
      </div>
    </article>
  );
}
