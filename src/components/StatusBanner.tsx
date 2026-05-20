import { type FC } from 'react';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';

type StatusBannerProps = {
  llmStatus: 'checking' | 'enhanced' | 'error';
  className?: string;
};

const StatusBanner: FC<StatusBannerProps> = ({ llmStatus, className = '' }) => {
  const config = {
    enhanced: {
      icon: <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />,
      label: 'AI Enhanced',
      dotClass: 'bg-green-400',
      textClass: 'text-emerald-200',
      bgClass: 'bg-emerald-300/[0.07] border-emerald-300/20',
    },
    error: {
      icon: <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />,
      label: 'Service Unavailable',
      dotClass: 'bg-red-400',
      textClass: 'text-red-200',
      bgClass: 'bg-red-300/[0.07] border-red-300/20',
    },
    checking: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />,
      label: 'Local Mode',
      dotClass: 'bg-yellow-400',
      textClass: 'text-amber-200',
      bgClass: 'bg-amber-300/[0.07] border-amber-300/20',
    },
  };

  const status = config[llmStatus];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-[0_14px_50px_rgba(0,0,0,0.18)] ${status.bgClass} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className={`w-2 h-2 rounded-full ${status.dotClass} ${llmStatus === 'enhanced' ? 'animate-pulse' : ''}`} />
      <span className={status.textClass}>{status.icon}</span>
      <span className={`font-medium ${status.textClass}`}>{status.label}</span>
    </div>
  );
};

export default StatusBanner;
