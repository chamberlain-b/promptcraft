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
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-dialog-title"
    >
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-900/50 border border-primary-600/50 flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-primary-400" aria-hidden="true" />
              </div>
              <h3 id="shortcuts-dialog-title" className="text-xl font-semibold text-gray-100">
                Keyboard Shortcuts
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-700/50"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
              >
                <span className="text-gray-300 text-sm">{shortcut.description}</span>
                <kbd className="px-3 py-1.5 bg-gray-900/60 border border-gray-600/50 rounded-md text-gray-300 text-xs font-mono font-semibold">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700/50">
            <p className="text-gray-400 text-xs text-center">
              Press <kbd className="px-2 py-1 bg-gray-900/60 border border-gray-600/50 rounded text-xs font-mono">?</kbd> to view shortcuts anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsDialog;
