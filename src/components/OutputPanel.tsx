import { type FC } from 'react';
import { Wand2, Sparkles, Copy, Check, RefreshCw, AlertTriangle, FileText } from 'lucide-react';
import { usePrompt } from '../context/PromptContext';
import { getWordCount } from '../utils/validation';
import LoadingSkeleton from './LoadingSkeleton';

const OutputPanel: FC = () => {
  const {
    state: { output, llmStatus, copied, isGenerating, input },
    actions: { copyToClipboard, generatePrompt }
  } = usePrompt();

  const outputWordCount = output ? getWordCount(output) : 0;

  return (
    <section
      aria-label="Enhanced prompt output"
      className="surface-card p-8 flex flex-col min-h-[32rem] md:min-h-card card-container"
      aria-busy={isGenerating && !output}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-400" aria-hidden="true" />
          Enhanced Prompt
        </h3>
        {output && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{outputWordCount} {outputWordCount === 1 ? 'word' : 'words'}</span>
          </div>
        )}
      </div>
      <div
        className="surface-panel p-4 flex-1 flex flex-col card-container"
        aria-live="polite"
      >
        {output && (
          <div
            className={`mb-3 p-2.5 rounded-lg border ${
              llmStatus === 'enhanced'
                ? 'bg-green-900/20 border-green-600/30'
                : 'bg-red-900/20 border-red-600/30'
            }`}
            role={llmStatus === 'error' ? 'alert' : 'status'}
          >
            <div className="flex items-center gap-2">
              {llmStatus === 'enhanced' ? (
                <>
                  <Sparkles className="w-4 h-4 text-green-400" aria-hidden="true" />
                  <span className="text-sm text-green-300 font-medium">AI-Enhanced Prompt</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" aria-hidden="true" />
                  <span className="text-sm text-red-300 font-medium">Service Issue</span>
                </>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 min-h-[400px] overflow-y-auto custom-scrollbar">
          {output ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                <pre className="text-gray-200 leading-relaxed text-container">{output}</pre>
                {llmStatus === 'enhanced' && (
                  <div className="mt-3 p-2.5 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <p className="text-xs text-blue-300 text-container">
                      This is an enhanced prompt ready to use with ChatGPT, Claude, or other AI systems. Copy and paste it directly!
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center w-full">
              {isGenerating ? (
                <div className="w-full max-w-md">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" aria-hidden="true" />
                    <span className="text-sm font-medium text-purple-300">Crafting your enhanced prompt...</span>
                  </div>
                  <LoadingSkeleton lines={6} />
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-700/30 border border-gray-600/30 flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="w-7 h-7 text-gray-500" aria-hidden="true" />
                  </div>
                  <p className="text-gray-400 text-sm">Your enhanced prompt will appear here</p>
                  <p className="text-gray-500 text-xs mt-1">Enter an idea and click Generate</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!output}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            copied
              ? 'bg-green-600/30 border border-green-500/40 text-green-300'
              : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" aria-hidden="true" />
              Copy Prompt
            </>
          )}
        </button>
        {llmStatus === 'error' && output && input.trim() && (
          <button
            type="button"
            onClick={generatePrompt}
            disabled={isGenerating}
            className="px-6 py-3 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
            Retry
          </button>
        )}
      </div>
    </section>
  );
};

export default OutputPanel;
