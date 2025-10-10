import { type FC } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import StatusBanner from './StatusBanner';

type HeaderProps = {
  llmStatus: 'checking' | 'enhanced' | 'error';
  onOpenSettings: () => void;
};

const Header: FC<HeaderProps> = ({ llmStatus, onOpenSettings }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
        Prompt Craft
      </h1>
      <p className="text-xl text-gray-300 mb-6">
        Transform your basic ideas into professional AI prompts
      </p>
      <div className="flex items-center justify-center gap-4 mb-4" role="group" aria-label="Application status and settings">
        <StatusBanner llmStatus={llmStatus} className="justify-center" />
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-all"
        >
          <SettingsIcon className="w-4 h-4" aria-hidden="true" />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Header;
