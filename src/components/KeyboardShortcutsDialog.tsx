import { type FC } from 'react';
import { Keyboard, X } from 'lucide-react';
import { formatShortcut, type KeyboardShortcut } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const KeyboardShortcutsDialog: FC<KeyboardShortcutsDialogProps> = ({ isOpen, onClose, shortcuts }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-dialog-title"
    >
      <div className="w-full max-w-md animate-scale-in rounded-lg border border-white/[0.08] bg-[#0a1015] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-300/[0.08] border border-teal-300/20 flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-teal-200" aria-hidden="true" />
              </div>
              <h3 id="shortcuts-dialog-title" className="text-xl font-semibold text-white">
                Keyboard Shortcuts
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/[0.04] border border-white/[0.06] rounded-lg"
              >
                <span className="text-slate-300 text-sm">{shortcut.description}</span>
                <kbd className="px-3 py-1.5 bg-black/25 border border-white/[0.09] rounded-md text-slate-300 text-xs font-mono font-semibold">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.08]">
            <p className="text-slate-500 text-xs text-center">
              Press <kbd className="px-2 py-1 bg-black/25 border border-white/[0.09] rounded text-xs font-mono text-slate-300">?</kbd> to view shortcuts anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsDialog;
