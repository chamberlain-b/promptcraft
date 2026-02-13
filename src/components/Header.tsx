import { type FC } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import StatusBanner from './StatusBanner';

type HeaderProps = {
  llmStatus: 'checking' | 'enhanced' | 'error';
  onOpenSettings: () => void;
};

const Header: FC<HeaderProps> = ({ llmStatus, onOpenSettings }) => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-teal-400 via-purple-400 to-teal-400 bg-clip-text text-transparent bg-[length:200%_auto]">
        Prompt Craft
      </h1>
      <p className="text-lg text-gray-300 mb-6 max-w-lg mx-auto">
        Transform your basic ideas into professional AI prompts
      </p>
      <div className="flex items-center justify-center gap-3 mb-4" role="group" aria-label="Application status and settings">
        <StatusBanner llmStatus={llmStatus} />
        <span className="text-gray-700">|</span>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm text-gray-300 hover:text-gray-200 transition-all"
          aria-label="Open settings"
        >
          <SettingsIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Settings
        </button>
      </div>
    </header>
  );
};

export default Header;
