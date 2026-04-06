'use client';
import { Model } from '@/lib/types';
import styles from './ModelCard.module.css';

interface ModelCardProps {
  model: Model;
  onSelect: (model: Model) => void;
  onOpenModal: (modelId: string) => void;
}

export default function ModelCard({ model, onSelect, onOpenModal }: ModelCardProps) {
  return (
    <div className="mcard" onClick={() => onSelect(model)}>
      <div className={styles.top}>
        <div className={styles.iconWrap}>
          <div className={styles.icon} style={{ background: model.iconBg }}>{model.icon}</div>
          <div>
            <div className={styles.name}>{model.name}</div>
            <div className={styles.org}>by {model.org}</div>
          </div>
        </div>
        <span className={`badge badge-${model.badge}`}>
          {model.badge === 'new' ? 'New' : model.badge === 'hot' ? 'Hot' : model.badge === 'open' ? 'Open' : 'Beta'}
        </span>
      </div>

      <p className={styles.desc}>{model.desc}</p>

      <div className={styles.tags}>
        {model.tags.map((t, i) => (
          <span key={i} className={`tag ${t.cls}`}>{t.label}</span>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.rating}>
          <span className={styles.stars}>{'★'.repeat(Math.floor(model.rating))}</span>
          <span>{model.rating} ({model.reviews.toLocaleString()})</span>
        </div>
        <span className={styles.price}>{model.price}</span>
        <button className={styles.cta} onClick={e => { e.stopPropagation(); onOpenModal(model.id); }}>
          Try it →
        </button>
      </div>
    </div>
  );
}
