import { type FC, useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Settings as SettingsIcon, Keyboard } from 'lucide-react';
import Header from './Header';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';
import ExamplesSection from './ExamplesSection';
import RequestLimitBanner from './RequestLimitBanner';
import Settings from './Settings';
import ToastContainer from './ToastContainer';
import KeyboardShortcutsDialog from './KeyboardShortcutsDialog';
import { usePrompt } from '../context/PromptContext';
import { useToast } from '../hooks/useToast';
import useKeyboardShortcuts, { type KeyboardShortcut } from '../hooks/useKeyboardShortcuts';

const AppLayout: FC = () => {
  const {
    state: { requestLimit, requestsLeft, llmStatus, showSettings },
    actions: { setShowSettings, checkLlmStatus, generatePrompt, clearAll, copyToClipboard }
  } = usePrompt();

  const { toasts, removeToast, success } = useToast();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'Enter',
      meta: true,
      description: 'Generate prompt',
      action: () => {
        generatePrompt();
        success('Generating prompt...');
      },
    },
    {
      key: 'k',
      meta: true,
      description: 'Clear all',
      action: () => {
        clearAll();
        success('Cleared all fields');
      },
    },
    {
      key: 'c',
      meta: true,
      shift: true,
      description: 'Copy output',
      action: () => {
        copyToClipboard();
      },
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcuts(true),
    },
    {
      key: 'Escape',
      description: 'Close dialogs',
      action: () => {
        setShowShortcuts(false);
        setShowSettings(false);
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <RequestLimitBanner requestLimit={requestLimit} requestsLeft={requestsLeft} />
        <Header llmStatus={llmStatus} onOpenSettings={() => setShowSettings(true)} />
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-7xl mx-auto overflow-hidden">
          <InputPanel />
          <OutputPanel />
        </div>
        <ExamplesSection />
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Boost your AI interactions with better prompts. Perfect for ChatGPT, Claude, and more!
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
              Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono">?</kbd> for shortcuts
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-12 border-t border-gray-700/30">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Collapsible Notice */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowNotice(!showNotice)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-900/10 hover:bg-amber-900/20 border border-amber-600/20 rounded-xl text-sm text-amber-400 transition-colors"
              aria-expanded={showNotice}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                <span className="font-medium">Important Notice</span>
              </div>
              {showNotice ? (
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            {showNotice && (
              <div className="mt-2 px-4 py-3 bg-amber-900/10 border border-amber-600/20 border-t-0 rounded-b-xl">
                <p className="text-amber-200/80 text-sm leading-relaxed">
                  By using this service, you acknowledge that your inputs may be processed by third-party AI services and could potentially be used for training purposes.
                  Please avoid submitting sensitive, confidential, or personal information. Use this tool responsibly and in accordance with your organization's data policies.
                </p>
              </div>
            )}
          </div>

          {/* Footer Links */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-sm text-gray-500">
            <span>&copy; {new Date().getFullYear()} Prompt Craft</span>
            <span className="hidden sm:inline text-gray-700">&middot;</span>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center gap-1.5 hover:text-gray-400 transition-colors"
            >
              <SettingsIcon className="w-3.5 h-3.5" aria-hidden="true" />
              Privacy Settings
            </button>
          </div>

          <p className="text-xs text-gray-600 text-center mt-3 max-w-xl mx-auto leading-relaxed">
            Provided "as is" without warranty. Results should be reviewed before use. For educational and personal use.
          </p>
        </div>
      </footer>

      <Settings
        isOpen={showSettings}
        onClose={() => {
          setShowSettings(false);
          checkLlmStatus();
        }}
      />

      <KeyboardShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={shortcuts}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default AppLayout;
