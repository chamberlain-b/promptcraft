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
      textClass: 'text-green-400',
      bgClass: 'bg-green-400/10 border-green-400/20',
    },
    error: {
      icon: <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />,
      label: 'Service Unavailable',
      dotClass: 'bg-red-400',
      textClass: 'text-red-400',
      bgClass: 'bg-red-400/10 border-red-400/20',
    },
    checking: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />,
      label: 'Local Mode',
      dotClass: 'bg-yellow-400',
      textClass: 'text-yellow-400',
      bgClass: 'bg-yellow-400/10 border-yellow-400/20',
    },
  };

  const status = config[llmStatus];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.bgClass} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className={`w-2 h-2 rounded-full ${status.dotClass} ${llmStatus === 'enhanced' ? 'animate-pulse' : ''}`} />
      <span className={status.textClass}>{status.icon}</span>
      <span className={`text-sm font-medium ${status.textClass}`}>{status.label}</span>
    </div>
  );
};

export default StatusBanner;
