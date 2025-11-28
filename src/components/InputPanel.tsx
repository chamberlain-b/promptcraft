import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  Sparkles,
  Brain,
  History,
  Mic,
  MicOff,
  Volume2,
  Download,
  Trash2,
  Lightbulb,
  Plus,
  RefreshCw,
  Upload,
  Copy
} from 'lucide-react';
import { usePrompt } from '../context/PromptContext';
import type { HistoryItem, Suggestion } from '../context/PromptContext.d';
import {
  LENGTH_OPTIONS,
  TEXTAREA_MAX_HEIGHT,
  TEXTAREA_MIN_HEIGHT,
  TONE_OPTIONS
} from '../data/constants';
import CharacterCounter from './CharacterCounter';
import SearchBar from './SearchBar';
import EmptyState from './EmptyState';
import ConfirmDialog from './ConfirmDialog';
import { validatePromptInput, getWordCount } from '../utils/validation';
import { exportToJSON, exportToCSV, importFromJSON, validateImportFile } from '../utils/exportImport';

const InputPanel = () => {
  const {
    state: {
      input,
      isGenerating,
      showHistory,
      history,
      suggestions,
      isListening,
      recordingSupported,
      currentTone,
      currentLength,
      requestsLeft,
      contextInfo,
      currentIntent
    },
    actions: {
      setShowHistory,
      setCurrentTone,
      setCurrentLength,
      setInput,
      applySuggestion,
      toggleVoiceRecording,
      generatePrompt,
      clearAll,
      loadFromHistory,
      deleteHistoryItem,
      exportHistory,
      clearHistory,
      duplicatePrompt,
      importHistory
    }
  } = usePrompt();

  const [searchQuery, setSearchQuery] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const historyPanelId = 'prompt-history-panel';
  const suggestionsPanelId = 'smart-suggestions-panel';

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, TEXTAREA_MIN_HEIGHT),
      TEXTAREA_MAX_HEIGHT
    );
    textarea.style.height = `${nextHeight}px`;
  }, [input]);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setInput(value);
    
    // Clear validation error when user starts typing
    if (validationError && value.length > 0) {
      setValidationError('');
    }
  };

  const handleGenerate = () => {
    const validation = validatePromptInput(input);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid input');
      return;
    }
    setValidationError('');
    generatePrompt();
  };

  const handleExportJSON = () => {
    exportToJSON(history);
  };

  const handleExportCSV = () => {
    exportToCSV(history);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImportFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const data = await importFromJSON(file);
      importHistory(data.prompts, 'merge');
      alert(`Successfully imported ${data.prompts.length} prompts`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to import file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearHistory = () => {
    setShowClearDialog(true);
  };

  const confirmClearHistory = () => {
    clearHistory();
    setShowClearDialog(false);
  };

  const handleDeleteItem = (id: string) => {
    setDeleteItemId(id);
  };

  const confirmDeleteItem = () => {
    if (deleteItemId) {
      deleteHistoryItem(deleteItemId);
      setDeleteItemId(null);
    }
  };

  const handleDuplicateItem = (item: HistoryItem) => {
    duplicatePrompt(item);
  };

  // Filter history based on search query
  const filteredHistory = history.filter((item) =>
    item.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.output.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const wordCount = getWordCount(input);

  return (
    <section
      aria-label="Prompt input"
      className="surface-card p-8 flex flex-col min-h-[32rem] md:min-h-card card-container"
    >
      <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-teal-400" aria-hidden="true" />
        Your Idea
      </h3>

      <div className="mb-4 surface-panel p-3">
        <div className="flex flex-col sm:flex-row sm:flex-nowrap sm:items-center gap-2 sm:gap-x-4">
          <span className="text-base font-bold text-gray-300 whitespace-nowrap">Output Style:</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-4">
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200 whitespace-nowrap">Tone</span>
              <select
                value={currentTone}
                onChange={(event) => setCurrentTone(event.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all min-w-0"
              >
                {TONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200 whitespace-nowrap">Length</span>
              <select
                value={currentLength}
                onChange={(event) => setCurrentLength(event.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all min-w-0"
              >
                {LENGTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {contextInfo && (
        <div className="mb-4 surface-panel--strong p-4 border border-blue-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <h4 className="text-sm font-medium text-blue-300">Context Detected</h4>
          </div>
          <div className="text-sm text-blue-200">
            <p>Intent: <span className="font-medium">{currentIntent?.intent}</span></p>
            <p>Confidence: <span className="font-medium">{Math.round((currentIntent?.confidence ?? 0) * 100)}%</span></p>
            {contextInfo.recentHistory?.length > 0 && (
              <p>Using {contextInfo.recentHistory.length} recent interactions for context</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-all ${
              showHistory
                ? 'bg-teal-500/30 text-teal-300'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
            }`}
            title={showHistory ? 'Hide history' : 'Show history'}
            aria-pressed={showHistory}
            aria-controls={historyPanelId}
            aria-expanded={showHistory}
          >
            <History className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {recordingSupported && (
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2 rounded-lg transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
            }`}
            title={isListening ? 'Stop recording' : 'Start voice recording'}
            aria-pressed={isListening}
            aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Mic className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {showHistory && (
        <div
          id={historyPanelId}
          className="mb-4 surface-panel p-4"
          role="region"
          aria-label="Prompt history"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">Recent Prompts</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleImport}
                className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
                title="Import history"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
                title="Export as JSON"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {history.length > 0 && (
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search history..."
              className="mb-3"
            />
          )}

          <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
            {history.length === 0 ? (
              <EmptyState
                icon={History}
                title="No History Yet"
                description="Your prompt history will appear here"
              />
            ) : filteredHistory.length === 0 ? (
              <EmptyState
                icon={History}
                title="No Results"
                description="No prompts match your search"
              />
            ) : (
              filteredHistory.map((item: HistoryItem) => (
                <div key={item.id} className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => loadFromHistory(item)}
                      className="text-left flex-1 text-gray-300 text-sm hover:text-primary-300 transition-colors"
                    >
                      <p className="truncate font-medium">{item.input}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.timestamp).toLocaleString()} • {getWordCount(item.input)} words
                      </p>
                    </button>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateItem(item)}
                        className="p-1.5 text-gray-400 hover:text-primary-300 hover:bg-primary-900/20 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                        aria-label="Delete history item"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Import history file"
      />

      <div className="relative flex-1 card-container">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Type your basic idea here... (e.g., 'write a story about space travel', 'analyze sales data', 'create a meal plan')"
          className={`w-full auto-expand-textarea bg-gray-800/50 border rounded-2xl p-6 text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 transition-all textarea-container custom-scrollbar ${
            validationError
              ? 'border-error-500 focus:ring-error-400/70 focus:border-error-400'
              : 'border-gray-600/50 focus:ring-primary-400/70 focus:border-primary-400'
          } caret-primary-400`}
          style={{ minHeight: TEXTAREA_MIN_HEIGHT, maxHeight: TEXTAREA_MAX_HEIGHT }}
          aria-label="Prompt input"
          aria-describedby={suggestions.length > 0 ? suggestionsPanelId : undefined}
          aria-invalid={!!validationError}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          {validationError && (
            <span className="text-xs text-error-400 font-medium">
              {validationError}
            </span>
          )}
          <CharacterCounter
            current={input.length}
            max={5000}
            min={10}
            className="text-xs"
          />
          <span className="text-xs text-gray-400">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div
          id={suggestionsPanelId}
          className="mt-4 surface-panel p-4"
          role="region"
          aria-label="Smart suggestions"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-400" aria-hidden="true" />
            <h4 className="text-sm font-medium text-gray-300">Smart Suggestions</h4>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion: Suggestion, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center text-sm text-gray-300">
                  <Sparkles className="w-4 h-4 mr-2 text-teal-400" aria-hidden="true" />
                  <span>{suggestion.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="flex items-center gap-1 px-3 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg text-sm transition-all"
                >
                  <Plus className="w-3 h-3" aria-hidden="true" />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!input.trim() || isGenerating || requestsLeft === 0}
          className="flex-1 bg-gradient-to-r from-teal-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-teal-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Generate Prompt
            </>
          )}
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl transition-all"
        >
          Clear
        </button>
      </div>

      {isListening && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-400" role="status" aria-live="polite">
          <Volume2 className="w-4 h-4 animate-pulse" aria-hidden="true" />
          Listening... speak now
        </div>
      )}

      <ConfirmDialog
        isOpen={showClearDialog}
        title="Clear History?"
        message="Are you sure you want to clear all history? This action cannot be undone."
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmClearHistory}
        onCancel={() => setShowClearDialog(false)}
      />

      <ConfirmDialog
        isOpen={deleteItemId !== null}
        title="Delete Prompt?"
        message="Are you sure you want to delete this prompt from history?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeleteItemId(null)}
      />
    </section>
  );
};

export default InputPanel;
