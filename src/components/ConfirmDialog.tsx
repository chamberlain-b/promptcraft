import { type FC, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const confirmButtonClass =
    confirmVariant === 'danger'
      ? 'bg-red-500 hover:bg-red-400 text-white focus:ring-red-300/40'
      : 'bg-teal-400 hover:bg-teal-300 text-[#06100f] focus:ring-teal-300/40';

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div className="w-full max-w-md animate-scale-in rounded-lg border border-white/[0.08] bg-[#0a1015] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {confirmVariant === 'danger' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-300/[0.08] border border-red-300/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-200" aria-hidden="true" />
                </div>
              )}
              <h3 id="confirm-dialog-title" className="text-xl font-semibold text-white">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <p id="confirm-dialog-description" className="text-slate-300 leading-relaxed mb-6">
            {message}
          </p>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-slate-200 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#0a1015]"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`px-4 py-2.5 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a1015] ${confirmButtonClass}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
