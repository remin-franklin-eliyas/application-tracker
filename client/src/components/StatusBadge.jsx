export const STATUS_CONFIG = {
  'Applied':             { cls: 'tag-applied',   dot: '#3b82f6', icon: '📤' },
  'In Review':           { cls: 'tag-review',    dot: '#f59e0b', icon: '🔍' },
  'Interview Scheduled': { cls: 'tag-interview', dot: '#8b5cf6', icon: '🎯' },
  'Offer':               { cls: 'tag-offer',     dot: '#22c55e', icon: '🏆' },
  'Rejected':            { cls: 'tag-rejected',  dot: '#ef4444', icon: '✕'  },
  'Withdrawn':           { cls: 'tag-withdrawn', dot: '#6b7280', icon: '–'  },
};

export const ALL_STATUSES = Object.keys(STATUS_CONFIG);

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Applied'];
  return (
    <span className={`badge ${cfg.cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      {status}
    </span>
  );
}
