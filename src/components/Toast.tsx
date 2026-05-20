import { type FC, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: FC<ToastProps> = ({ id, type, message, duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" aria-hidden="true" />;
      case 'error':
        return <XCircle className="w-5 h-5" aria-hidden="true" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" aria-hidden="true" />;
      case 'info':
        return <Info className="w-5 h-5" aria-hidden="true" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-300/[0.10] border-emerald-300/25 text-emerald-100';
      case 'error':
        return 'bg-red-300/[0.10] border-red-300/25 text-red-100';
      case 'warning':
        return 'bg-amber-300/[0.10] border-amber-300/25 text-amber-100';
      case 'info':
        return 'bg-blue-300/[0.10] border-blue-300/25 text-blue-100';
    }
  };

  return (
    <div
      role="alert"
      className={`
        ${getStyles()}
        bg-[#0a1015]/95 backdrop-blur-lg border rounded-lg p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)]
        animate-toast-in flex items-start gap-3 min-w-[300px] max-w-md
      `}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:opacity-75 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
