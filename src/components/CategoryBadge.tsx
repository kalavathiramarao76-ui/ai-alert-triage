import { Category } from '@/types';

const categoryConfig: Record<Category, { bg: string; text: string; icon: string }> = {
  infra: { bg: 'bg-purple-500/15', text: 'text-purple-400', icon: '🖥' },
  app: { bg: 'bg-blue-500/15', text: 'text-blue-400', icon: '📦' },
  network: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', icon: '🌐' },
  security: { bg: 'bg-red-500/15', text: 'text-red-400', icon: '🛡' },
  database: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: '🗄' },
};

export default function CategoryBadge({ category }: { category: Category }) {
  const config = categoryConfig[category];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      {category}
    </span>
  );
}
