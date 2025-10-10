import { useEffect, useRef, type ChangeEvent } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { usePrompt } from '../context/PromptContext';
import type { HistoryItem, Suggestion } from '../context/PromptContext';
import {
  LENGTH_OPTIONS,
  TEXTAREA_MAX_HEIGHT,
  TEXTAREA_MIN_HEIGHT,
  TONE_OPTIONS
} from '../data/constants';

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
      clearHistory
    }
  } = usePrompt();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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
    setInput(event.target.value);
  };

  const handleGenerate = () => {
    generatePrompt();
  };

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
                onClick={exportHistory}
                className="p-1 text-gray-400 hover:text-gray-300"
                title="Export history"
              >
                <Download className="w-3 h-3" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={clearHistory}
                className="p-1 text-red-400 hover:text-red-300"
                title="Clear history"
              >
                <Trash2 className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No history yet</p>
            ) : (
              history.map((item: HistoryItem) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-2">
                  <button
                    type="button"
                    onClick={() => loadFromHistory(item)}
                    className="text-left flex-1 text-gray-300 text-sm hover:text-teal-300 transition-colors"
                  >
                    <p className="truncate">{item.input}</p>
                    <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-1 text-red-400 hover:text-red-300 ml-2"
                    aria-label="Delete history item"
                  >
                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="relative flex-1 card-container">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Type your basic idea here... (e.g., 'write a story about space travel', 'analyze sales data', 'create a meal plan')"
          className="w-full auto-expand-textarea bg-gray-800/50 border border-gray-600/50 rounded-2xl p-6 text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/70 focus:border-teal-400 caret-teal-400 transition-all textarea-container custom-scrollbar"
          style={{ minHeight: TEXTAREA_MIN_HEIGHT, maxHeight: TEXTAREA_MAX_HEIGHT }}
          aria-label="Prompt input"
          aria-describedby={suggestions.length > 0 ? suggestionsPanelId : undefined}
        />
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
    </section>
  );
};

export default InputPanel;
