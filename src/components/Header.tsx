import { type FC } from 'react';
import { PenTool, Settings as SettingsIcon } from 'lucide-react';
import StatusBanner from './StatusBanner';

type HeaderProps = {
  llmStatus: 'checking' | 'enhanced' | 'error';
  onOpenSettings: () => void;
};

const Header: FC<HeaderProps> = ({ llmStatus, onOpenSettings }) => {
  return (
    <header className="mb-4 flex flex-col gap-4 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-center sm:justify-between lg:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/[0.08] text-teal-200 shadow-[0_0_40px_rgba(45,212,191,0.14)]">
          <PenTool className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Prompt Craft
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Turn rough intent into production-ready AI prompts.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3" role="group" aria-label="Application status and settings">
        <StatusBanner llmStatus={llmStatus} />
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
          aria-label="Open settings"
        >
          <SettingsIcon className="w-4 h-4" aria-hidden="true" />
          Settings
        </button>
      </div>
    </header>
  );
};

export default Header;
