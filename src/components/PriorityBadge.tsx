import { Priority } from '@/types';

const priorityConfig: Record<Priority, { bg: string; text: string; border: string; label: string }> = {
  P0: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: 'P0 Critical' },
  P1: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', label: 'P1 High' },
  P2: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'P2 Medium' },
  P3: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', label: 'P3 Low' },
  P4: { bg: 'bg-zinc-500/15', text: 'text-zinc-400', border: 'border-zinc-500/30', label: 'P4 Info' },
};

export default function PriorityBadge({ priority, compact }: { priority: Priority; compact?: boolean }) {
  const config = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {compact ? priority : config.label}
    </span>
  );
}
