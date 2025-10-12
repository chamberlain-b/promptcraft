import { type FC, useState } from 'react';
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

  const { toasts, removeToast, success, error } = useToast();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Define keyboard shortcuts
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
          <p className="text-gray-400">
            Boost your AI interactions with better prompts ✨ Perfect for ChatGPT, Claude, and more!
          </p>
          <button
            type="button"
            onClick={() => setShowShortcuts(true)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Press <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono">?</kbd> for keyboard shortcuts
          </button>
        </div>
      </div>
      <footer className="mt-16 pt-8 border-t border-gray-700/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="bg-amber-900/20 border border-amber-600/30 rounded-2xl p-4 mb-6">
            <h4 className="text-amber-400 font-semibold mb-2 flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              Important Notice
            </h4>
            <p className="text-amber-200 text-sm leading-relaxed">
              By using this service, you acknowledge that your inputs may be processed by third-party AI services and could potentially be used for training purposes.
              Please avoid submitting sensitive, confidential, or personal information. Use this tool responsibly and in accordance with your organization's data policies.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-400">
            <span>© 2025 Prompt Craft</span>
            <span className="hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="hover:text-gray-300 transition-colors underline"
            >
              Privacy Settings
            </button>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors underline"
            >
              Open Source
            </a>
          </div>
          <div className="text-xs text-gray-500 leading-relaxed max-w-2xl mx-auto">
            <p className="mb-2">
              This tool is provided "as is" without warranty of any kind. Results may vary and should be reviewed before use.
              No liability is assumed for the use of generated content.
            </p>
            <p>
              For educational and personal use. Please respect intellectual property rights and follow applicable laws and regulations.
            </p>
          </div>
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
