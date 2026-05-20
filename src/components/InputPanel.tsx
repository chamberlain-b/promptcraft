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
  Copy,
  AlertCircle,
  CheckCircle2,
  X,
  Clock
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
import { exportToJSON, importFromJSON, validateImportFile } from '../utils/exportImport';
import { formatRelativeTime } from '../utils/formatTime';

const InputPanel = () => {
  const {
    state: {
      input,
      output,
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
      clearHistory,
      duplicatePrompt,
      importHistory
    }
  } = usePrompt();

  const [searchQuery, setSearchQuery] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Auto-dismiss import status after 4 seconds
  useEffect(() => {
    if (importStatus) {
      if (importTimerRef.current) clearTimeout(importTimerRef.current);
      importTimerRef.current = setTimeout(() => {
        setImportStatus(null);
      }, 4000);
    }
    return () => {
      if (importTimerRef.current) clearTimeout(importTimerRef.current);
    };
  }, [importStatus]);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setInput(value);

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

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImportFile(file);
    if (!validation.valid) {
      setImportStatus({ type: 'error', message: validation.error });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      const data = await importFromJSON(file);
      importHistory(data.prompts, 'merge');
      setImportStatus({
        type: 'success',
        message: `Successfully imported ${data.prompts.length} prompts`,
      });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to import file',
      });
    }

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

  const filteredHistory = history.filter((item) =>
    item.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.output.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const wordCount = getWordCount(input);
  const showPrimaryGenerate = !!input.trim() && requestsLeft !== 0;
  const isGenerateDisabled = !input.trim() || isGenerating || requestsLeft === 0;

  return (
    <section
      aria-label="Prompt input"
      className="workbench-panel flex min-h-[36rem] flex-col p-4 sm:p-5 lg:min-h-[44rem]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="panel-kicker">Composer</p>
          <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-[-0.01em] text-white">
            <Sparkles className="w-5 h-5 text-teal-300" aria-hidden="true" />
            Your Idea
          </h3>
        </div>
        {recordingSupported && (
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`icon-text-button ${
              isListening
                ? 'border-[#ff7a68]/40 bg-[#ff7a68]/15 text-[#ffd8d2]'
                : 'border-teal-300/20 bg-teal-300/[0.07] text-teal-100 hover:border-teal-300/40'
            }`}
            title={isListening ? 'Stop recording' : 'Start voice recording'}
            aria-pressed={isListening}
            aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
          >
            {isListening ? <MicOff className="w-4 h-4" aria-hidden="true" /> : <Mic className="w-4 h-4" aria-hidden="true" />}
            <span>Voice</span>
          </button>
        )}
      </div>

      <div className="mb-4 rounded-lg border border-white/[0.08] bg-black/15 p-3">
        <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="field-label">Tone</span>
              <select
                value={currentTone}
                onChange={(event) => setCurrentTone(event.target.value)}
                className="select-field"
              >
                {TONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="field-label">Length</span>
              <select
                value={currentLength}
                onChange={(event) => setCurrentLength(event.target.value)}
                className="select-field"
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

      {contextInfo && (
        <div className="mb-4 rounded-lg border border-blue-300/20 bg-blue-300/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-blue-200" aria-hidden="true" />
            <h4 className="text-sm font-medium text-blue-100">Context Detected</h4>
          </div>
          <div className="text-sm text-blue-100/80">
            <p>Intent: <span className="font-medium capitalize">{currentIntent?.intent}</span></p>
            <p>Confidence: <span className="font-medium">{Math.round((currentIntent?.confidence ?? 0) * 100)}%</span></p>
            {contextInfo.recentHistory?.length > 0 && (
              <p>Using {contextInfo.recentHistory.length} recent interactions for context</p>
            )}
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between xl:hidden">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              showHistory
                ? 'bg-teal-300/[0.12] text-teal-100'
                : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200'
            }`}
            title={showHistory ? 'Hide history' : 'Show history'}
            aria-pressed={showHistory}
            aria-controls={historyPanelId}
            aria-expanded={showHistory}
          >
            <History className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                showHistory ? 'bg-teal-300/20 text-teal-100' : 'bg-white/[0.08] text-slate-300'
              }`}>
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {showHistory && (
        <div
          id={historyPanelId}
          className="mb-4 rounded-lg border border-white/[0.08] bg-white/[0.04] p-4 xl:hidden"
          role="region"
          aria-label="Prompt history"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-300">Recent Prompts</h4>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleImport}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors"
                title="Import history"
                aria-label="Import history"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors"
                title="Export as JSON"
                aria-label="Export history as JSON"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-2 text-red-300 hover:text-red-100 hover:bg-red-300/[0.08] rounded-lg transition-colors"
                title="Clear history"
                aria-label="Clear all history"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {importStatus && (
            <div
              role="status"
              className={`flex items-center justify-between gap-2 text-sm font-medium rounded-lg p-3 mb-3 border ${
                importStatus.type === 'success'
                  ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-100'
                  : 'bg-red-900/30 border-red-700/50 text-red-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {importStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                )}
                <span className="leading-snug">{importStatus.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setImportStatus(null)}
                className="p-1 hover:opacity-75 transition-opacity flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

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
                <div key={item.id} className="group rounded-lg border border-white/[0.06] bg-white/[0.035] p-3 transition-colors hover:border-teal-300/20 hover:bg-teal-300/[0.05]">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => loadFromHistory(item)}
                      className="min-w-0 flex-1 text-left text-sm text-slate-300 transition-colors hover:text-teal-100"
                    >
                      <p className="truncate font-medium">{item.input}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                        <span>{formatRelativeTime(item.timestamp)}</span>
                        <span className="text-slate-700">|</span>
                        <span>{getWordCount(item.input)} words</span>
                      </div>
                    </button>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleDuplicateItem(item)}
                        className="p-1.5 text-slate-400 hover:text-teal-200 hover:bg-teal-300/[0.08] rounded-lg transition-colors"
                        title="Duplicate"
                        aria-label="Duplicate prompt"
                      >
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-200 hover:bg-red-300/[0.08] rounded-lg transition-colors"
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
          className={`w-full auto-expand-textarea resize-none rounded-lg border bg-[#060a0f]/70 p-5 text-[0.95rem] leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all textarea-container custom-scrollbar ${
            validationError
              ? 'border-red-300/60 focus:ring-red-300/20 focus:border-red-200/70'
              : 'border-white/[0.09] focus:ring-teal-300/15 focus:border-teal-300/50'
          } caret-teal-300`}
          style={{ minHeight: TEXTAREA_MIN_HEIGHT, maxHeight: TEXTAREA_MAX_HEIGHT }}
          aria-label="Prompt input"
          aria-describedby={suggestions.length > 0 ? suggestionsPanelId : undefined}
          aria-invalid={!!validationError}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          {validationError && (
            <span className="text-xs text-red-200 font-medium">
              {validationError}
            </span>
          )}
          <CharacterCounter
            current={input.length}
            max={5000}
            min={10}
            className="text-xs"
          />
          <span className="text-xs text-slate-500">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div
          id={suggestionsPanelId}
          className="mt-4 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] p-4"
          role="region"
          aria-label="Smart suggestions"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-200" aria-hidden="true" />
            <h4 className="text-sm font-medium text-amber-100">Smart Suggestions</h4>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion: Suggestion, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/15 p-3 transition-colors hover:bg-white/[0.04]">
                <div className="flex min-w-0 items-center text-sm text-slate-200 mr-3">
                  <Sparkles className="w-4 h-4 mr-2 text-amber-200 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{suggestion.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-amber-200/20 bg-amber-200/[0.08] px-3 py-1.5 text-sm font-medium text-amber-100 transition-all hover:bg-amber-200/[0.13]"
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
          disabled={isGenerateDisabled}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold transition-all disabled:cursor-not-allowed ${
            showPrimaryGenerate
              ? 'bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500 text-[#06100f] shadow-[0_22px_70px_rgba(20,184,166,0.2)] hover:brightness-110 disabled:opacity-70'
              : 'border border-white/[0.08] bg-white/[0.04] text-slate-500'
          }`}
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
          disabled={!input && !output}
          className="rounded-lg border border-white/[0.09] bg-white/[0.04] px-5 py-3.5 font-medium text-slate-300 transition-all hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      {isListening && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#ff7a68]/20 bg-[#ff7a68]/10 p-2.5 text-sm text-[#ffd8d2]" role="status" aria-live="polite">
          <Volume2 className="w-4 h-4 animate-pulse" aria-hidden="true" />
          <span>Listening... speak now</span>
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
