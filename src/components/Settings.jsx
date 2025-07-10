import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Save, Download, Upload, Trash2 } from 'lucide-react';
import contextService from '../services/contextService';

const Settings = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    defaultTone: 'professional',
    defaultLength: 'medium',
    enableContext: true,
    enableSuggestions: true,
    autoSave: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load current settings
      const savedPreferences = contextService.getUserPreferences();
      setPreferences(prev => ({ ...prev, ...savedPreferences }));
    }
  }, [isOpen]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      // Save preferences
      contextService.updateUserPreferences(preferences);
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings. Please try again.');
    }

    setIsSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };
        localStorage.removeItem('openai-api-key');
        setMessage('Settings saved successfully! API key removed.');
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    try {
      contextService.exportHistory();
      setMessage('Data exported successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error exporting data: ' + error.message);
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      contextService.importHistory(file)
        .then(() => {
          setMessage('Data imported successfully!');
          setTimeout(() => setMessage(''), 3000);
        })
        .catch(error => {
          setMessage('Error importing data: ' + error.message);
        });
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      contextService.clearHistory();
      contextService.clearSessionContext();
      setMessage('All data cleared successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900/90 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-100">
            <SettingsIcon className="w-6 h-6 text-teal-400" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl font-bold px-2"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded mb-4 text-sm font-medium ${
            message.includes('Error') ? 'bg-red-900/60 text-red-300 border border-red-700' : 'bg-teal-900/60 text-teal-300 border border-teal-700'
          }`}>
            {message}
          </div>
        )}

        {/* User Preferences */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-teal-300">
            <User className="w-5 h-5" />
            User Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Default Tone</label>
              <select
                value={preferences.defaultTone}
                onChange={(e) => setPreferences(prev => ({ ...prev, defaultTone: e.target.value }))}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              <label className="block text-sm font-medium mb-1 text-gray-200">Default Length</label>
              <select
                value={preferences.defaultLength}
                onChange={(e) => setPreferences(prev => ({ ...prev, defaultLength: e.target.value }))}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-teal-300">Feature Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center text-gray-200">
              <input
                type="checkbox"
                checked={preferences.enableContext}
                onChange={(e) => setPreferences(prev => ({ ...prev, enableContext: e.target.checked }))}
                className="mr-2 accent-teal-500"
              />
              Enable Context Memory
            </label>
            <label className="flex items-center text-gray-200">
              <input
                type="checkbox"
                checked={preferences.enableSuggestions}
                onChange={(e) => setPreferences(prev => ({ ...prev, enableSuggestions: e.target.checked }))}
                className="mr-2 accent-teal-500"
              />
              Enable Smart Suggestions
            </label>
            <label className="flex items-center text-gray-200">
              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(e) => setPreferences(prev => ({ ...prev, autoSave: e.target.checked }))}
                className="mr-2 accent-teal-500"
              />
              Auto-save History
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-teal-300">Data Management</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="px-5 py-2 bg-teal-400/20 backdrop-blur-md border border-teal-400/40 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-400/60 hover:bg-teal-400/30 hover:border-teal-300/80 hover:shadow-teal-400/30"
            >
              <Download className="w-5 h-5" />
              Export Data
            </button>
            <label className="px-5 py-2 bg-blue-400/20 backdrop-blur-md border border-blue-400/40 text-white rounded-xl font-semibold flex items-center gap-2 cursor-pointer shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/60 hover:bg-blue-400/30 hover:border-blue-300/80 hover:shadow-blue-400/30">
              <Upload className="w-5 h-5" />
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
              className="px-5 py-2 bg-red-400/20 backdrop-blur-md border border-red-400/40 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-400/60 hover:bg-red-400/30 hover:border-red-300/80 hover:shadow-red-400/30"
            >
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-semibold border border-gray-700 flex items-center gap-2 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/40"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;