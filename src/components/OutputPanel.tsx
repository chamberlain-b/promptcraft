import { type FC } from 'react';
import { Wand2, Sparkles, Brain, Copy } from 'lucide-react';
import { usePrompt } from '../context/PromptContext';
import LoadingSkeleton from './LoadingSkeleton';

const OutputPanel: FC = () => {
  const {
    state: { output, llmStatus, copied, isGenerating },
    actions: { copyToClipboard }
  } = usePrompt();

  return (
    <section
      aria-label="Enhanced prompt output"
      className="surface-card p-8 flex flex-col min-h-[32rem] md:min-h-card card-container"
      aria-busy={isGenerating && !output}
    >
      <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
        <Wand2 className="w-5 h-5 text-purple-400" aria-hidden="true" />
        Enhanced Prompt
      </h3>
      <div
        className="surface-panel p-4 flex-1 flex flex-col card-container"
        aria-live="polite"
      >
        {output && (
          <div
            className={`mb-3 p-2 rounded-lg border ${
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
                  <span className="text-sm text-green-300 font-semibold">✨ AI-Enhanced Prompt</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 text-red-400" aria-hidden="true" />
                  <span className="text-sm text-red-300 font-semibold">⚠️ Service Issue</span>
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
                <div className="mt-3 p-2 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <p className="text-xs text-blue-300 text-container">
                    💡 This is an enhanced prompt ready to use with ChatGPT, Claude, or other AI systems. Copy and paste it directly!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center w-full">
              {isGenerating ? (
                <div className="w-full max-w-md">
                  <LoadingSkeleton lines={6} />
                  <p className="text-sm text-gray-400 mt-4 text-center">Crafting your enhanced prompt...</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Your enhanced prompt will appear here...</p>
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
          className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" aria-hidden="true" />
          {copied ? 'Copied!' : 'Copy Prompt'}
        </button>
      </div>
    </section>
  );
};

export default OutputPanel;
