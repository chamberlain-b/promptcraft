import { type FC } from 'react';
import { Sparkles, Brain } from 'lucide-react';

type StatusBannerProps = {
  llmStatus: 'checking' | 'enhanced' | 'error';
  className?: string;
};

const StatusBanner: FC<StatusBannerProps> = ({ llmStatus, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`} role="status" aria-live="polite">
      {llmStatus === 'enhanced' ? (
        <>
          <Sparkles className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-sm text-green-400 font-bold">✨ AI ENHANCED</span>
        </>
      ) : llmStatus === 'error' ? (
        <>
          <Brain className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400 font-semibold">⚠️ Service Unavailable</span>
        </>
      ) : (
        <>
          <Brain className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400">Local Mode</span>
        </>
      )}
    </div>
  );
};

export default StatusBanner;
