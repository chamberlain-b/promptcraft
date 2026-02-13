import { type FC, useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, User, Save, Download, Upload, Trash2, X } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import contextService from '../services/contextService';

interface UserPreferences {
  defaultTone: string;
  defaultLength: string;
  enableContext: boolean;
  enableSuggestions: boolean;
  autoSave: boolean;
}

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToggleSwitch: FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string; description?: string }> = ({
  checked,
  onChange,
  label,
  description,
}) => (
  <label className="flex items-center justify-between py-2 cursor-pointer group">
    <div className="flex-1 mr-4">
      <span className="text-sm font-medium text-gray-200 group-hover:text-gray-100 transition-colors">{label}</span>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        checked ? 'bg-teal-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
);

const Settings: FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultTone: 'professional',
    defaultLength: 'medium',
    enableContext: true,
    enableSuggestions: true,
    autoSave: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const savedPreferences = contextService.getUserPreferences();
    setPreferences((prev) => ({ ...prev, ...savedPreferences }));

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const dialogNode = dialogRef.current;
    const focusable = dialogNode ? Array.from(dialogNode.querySelectorAll<HTMLElement>(focusableSelector)) : [];
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab' && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      contextService.updateUserPreferences(preferences);
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings. Please try again.');
    }

    setIsSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExportData = () => {
    try {
      contextService.exportHistory();
      setMessage('Data exported successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage('Error exporting data: ' + errorMessage);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      contextService.importHistory(file)
        .then(() => {
          setMessage('Data imported successfully!');
          setTimeout(() => setMessage(''), 3000);
        })
        .catch(error => {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setMessage('Error importing data: ' + errorMessage);
        });
    }
  };

  const handleClearData = () => {
    setIsConfirmDialogOpen(true);
  };

  const confirmClearData = () => {
    contextService.clearHistory();
    contextService.clearSessionContext();
    setMessage('All data cleared successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700/80 shadow-2xl custom-scrollbar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-heading"
        aria-describedby="settings-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700/50 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 id="settings-heading" className="text-xl font-bold flex items-center gap-2 text-gray-100">
              <SettingsIcon className="w-5 h-5 text-teal-400" aria-hidden="true" />
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p id="settings-description" className="sr-only">
          Update personalization options, manage data, and configure how Prompt Craft behaves.
        </p>

        <div className="px-6 py-4 space-y-6">
          {message && (
            <div
              role="status"
              className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                message.includes('Error')
                  ? 'bg-red-900/40 text-red-300 border border-red-700/50'
                  : 'bg-teal-900/40 text-teal-300 border border-teal-700/50'
              }`}
            >
              {message}
            </div>
          )}

          {/* User Preferences */}
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-teal-300">
              <User className="w-4 h-4" aria-hidden="true" />
              User Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-200">Default Tone</label>
                <select
                  value={preferences.defaultTone}
                  onChange={(e) => setPreferences(prev => ({ ...prev, defaultTone: e.target.value }))}
                  className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                  <option value="academic">Academic</option>
                  <option value="technical">Technical</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-200">Default Length</label>
                <select
                  value={preferences.defaultLength}
                  onChange={(e) => setPreferences(prev => ({ ...prev, defaultLength: e.target.value }))}
                  className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div>
            <h3 className="text-base font-semibold mb-2 text-teal-300">Feature Settings</h3>
            <div className="space-y-1 bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
              <ToggleSwitch
                checked={preferences.enableContext}
                onChange={(checked) => setPreferences(prev => ({ ...prev, enableContext: checked }))}
                label="Context Memory"
                description="Use past interactions to improve results"
              />
              <ToggleSwitch
                checked={preferences.enableSuggestions}
                onChange={(checked) => setPreferences(prev => ({ ...prev, enableSuggestions: checked }))}
                label="Smart Suggestions"
                description="Show intelligent prompt improvement tips"
              />
              <ToggleSwitch
                checked={preferences.autoSave}
                onChange={(checked) => setPreferences(prev => ({ ...prev, autoSave: checked }))}
                label="Auto-save History"
                description="Automatically save generated prompts"
              />
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-teal-300">Data Management</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportData}
                className="px-4 py-2.5 bg-teal-400/20 backdrop-blur-md border border-teal-400/40 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-400/60 hover:bg-teal-400/30 hover:border-teal-300/80"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Export Data
              </button>
              <label className="px-4 py-2.5 bg-blue-400/20 backdrop-blur-md border border-blue-400/40 text-white rounded-xl font-medium text-sm flex items-center gap-2 cursor-pointer shadow-lg transition-all focus-within:ring-2 focus-within:ring-blue-400/60 hover:bg-blue-400/30 hover:border-blue-300/80">
                <Upload className="w-4 h-4" aria-hidden="true" />
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleClearData}
                aria-label="Reset all saved data"
                className="px-4 py-2.5 bg-red-400/20 backdrop-blur-md border border-red-400/40 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-400/60 hover:bg-red-400/30 hover:border-red-300/80"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Reset All Data
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Action Buttons */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700/50 px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-medium border border-gray-700 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/40"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          title="Reset all data?"
          message="This will permanently delete your history, preferences, and session context. This action cannot be undone."
          confirmLabel="Reset data"
          confirmVariant="danger"
          onConfirm={confirmClearData}
          onCancel={() => setIsConfirmDialogOpen(false)}
        />
      </div>
    </div>
  );
};

export default Settings;
