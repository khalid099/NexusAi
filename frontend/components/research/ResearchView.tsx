'use client';
import styles from './ResearchView.module.css';

interface ResearchViewProps {
  onToast: (msg: string) => void;
}

const RESEARCH = [
  { date: 'Mar 26', org: 'Google DeepMind', title: 'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks', summary: 'Scores 83.2% on AIME 2025 math competition, outperforming all prior models on reasoning-intensive tasks.' },
  { date: 'Mar 22', org: 'MIT CSAIL', title: 'Scaling laws for multimodal models: new empirical findings', summary: 'Research reveals unexpected scaling dynamics when combining vision and language — efficiency gains plateau earlier than expected.' },
  { date: 'Mar 18', org: 'Anthropic', title: 'Constitutional AI v2: improved alignment through iterative refinement', summary: 'New methodology achieves 40% reduction in harmful outputs while preserving capability on standard benchmarks.' },
  { date: 'Mar 15', org: 'Meta AI', title: 'Llama 4 Scout & Maverick: natively multimodal from the ground up', summary: '17B MoE architecture trained on 40 trillion tokens with native understanding across text, image, and video.' },
  { date: 'Mar 10', org: 'Stanford NLP', title: 'Long-context recall: how models handle 1M+ token windows', summary: 'Comprehensive evaluation shows sharp recall degradation beyond 200K tokens for most models tested.' },
  { date: 'Mar 5', org: 'OpenAI', title: 'GPT-5.4 technical report released', summary: 'Detailed architecture overview reveals 2.5M context window and 512-token parallel generation for accelerated inference.' },
  { date: 'Mar 1', org: 'Berkeley AI', title: 'Fine-tuning vs. prompting: when does each approach excel?', summary: 'Empirical study across 15 domains shows fine-tuning provides 12% improvement on domain-specific tasks.' },
  { date: 'Feb 26', org: 'Microsoft Research', title: 'Multimodal fusion: breaking the modality bottleneck', summary: 'Novel attention mechanism enables true cross-modal understanding without intermediate representation loss.' },
];

export default function ResearchView({ onToast }: ResearchViewProps) {
  return (
    <div className={styles.wrapper}>
      <h2>AI Research Feed</h2>
      <div className={styles.feed}>
        {RESEARCH.map((item, i) => (
          <div key={i} className={styles.feedItem} onClick={() => onToast('Full article coming soon!')}>
            <div className={styles.feedMeta}>
              <span className={styles.feedDate}>{item.date}</span>
              <span className={styles.feedOrg}>{item.org}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
