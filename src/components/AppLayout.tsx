import { type FC, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, CircleHelp, Command, Keyboard, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import Header from './Header';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';
import ExamplesSection from './ExamplesSection';
import RequestLimitBanner from './RequestLimitBanner';
import Settings from './Settings';
import ToastContainer from './ToastContainer';
import KeyboardShortcutsDialog from './KeyboardShortcutsDialog';
import WorkflowRail from './WorkflowRail';
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
    <div className="min-h-screen bg-[#080c10] text-white">
      <div className="app-chrome">
        <WorkflowRail />

        <div className="min-w-0 flex-1">
          <div className="mx-auto flex min-h-screen w-full max-w-[92rem] flex-col px-4 py-4 sm:px-6 lg:px-8">
            <RequestLimitBanner requestLimit={requestLimit} requestsLeft={requestsLeft} />

            <Header llmStatus={llmStatus} onOpenSettings={() => setShowSettings(true)} />

            <div className="mb-5 hidden items-center justify-between gap-4 rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-sm text-slate-400 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl lg:flex">
              <button
                type="button"
                onClick={() => setShowShortcuts(true)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.09] bg-black/20 text-slate-200">
                  <Command className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                Quick shortcuts
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowShortcuts(true)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <CircleHelp className="h-4 w-4" aria-hidden="true" />
                  Help
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <SettingsIcon className="h-4 w-4" aria-hidden="true" />
                  Settings
                </button>
                <span className="mx-2 h-8 w-px bg-white/[0.08]" />
                <span className="inline-flex items-center gap-2 rounded-lg border border-teal-300/20 bg-teal-300/[0.07] px-3 py-2 text-teal-200">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  All systems ready
                </span>
              </div>
            </div>

            <main className="flex-1">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-5">
                <InputPanel />
                <OutputPanel />
              </div>
              <ExamplesSection />
            </main>

            <div className="mt-6 text-center lg:hidden">
              <button
                type="button"
                onClick={() => setShowShortcuts(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-slate-400 transition hover:text-slate-200"
              >
                <Keyboard className="h-4 w-4" aria-hidden="true" />
                Press <kbd className="rounded border border-white/[0.1] bg-black/20 px-1.5 py-0.5 text-xs font-mono text-slate-300">?</kbd> for shortcuts
              </button>
            </div>

            <footer className="mt-8 border-t border-white/[0.07]">
              <div className="mx-auto max-w-4xl px-1 py-6">
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowNotice(!showNotice)}
                    className="w-full flex items-center justify-between rounded-lg border border-amber-300/20 bg-amber-300/[0.05] px-4 py-2.5 text-sm text-amber-200 transition hover:border-amber-300/35 hover:bg-amber-300/[0.08]"
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
                    <div className="mt-2 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3">
                      <p className="text-sm leading-relaxed text-amber-100/75">
                        By using this service, you acknowledge that your inputs may be processed by third-party AI services and could potentially be used for training purposes.
                        Please avoid submitting sensitive, confidential, or personal information. Use this tool responsibly and in accordance with your organization's data policies.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center gap-3 text-sm text-slate-500 sm:flex-row">
                  <span>&copy; {new Date().getFullYear()} Prompt Craft</span>
                  <span className="hidden text-slate-700 sm:inline">&middot;</span>
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="inline-flex items-center gap-1.5 transition hover:text-slate-300"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    Privacy Settings
                  </button>
                </div>

                <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-relaxed text-slate-600">
                  Provided "as is" without warranty. Results should be reviewed before use. For educational and personal use.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>

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
