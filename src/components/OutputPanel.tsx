import { type FC } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, FileText, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
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
      className="workbench-panel flex min-h-[36rem] flex-col p-4 sm:p-5 lg:min-h-[44rem]"
      aria-busy={isGenerating && !output}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="panel-kicker">Output</p>
          <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-[-0.01em] text-white">
            <Wand2 className="w-5 h-5 text-amber-200" aria-hidden="true" />
            Enhanced Prompt
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {output && (
            <div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-400 sm:flex">
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{outputWordCount} {outputWordCount === 1 ? 'word' : 'words'}</span>
            </div>
          )}
          <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
            output && llmStatus === 'enhanced'
              ? 'border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100'
              : llmStatus === 'error'
              ? 'border-red-300/20 bg-red-300/[0.07] text-red-100'
              : 'border-white/[0.08] bg-white/[0.04] text-slate-400'
          }`}>
            {output && llmStatus === 'enhanced' ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : llmStatus === 'error' ? (
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {output && llmStatus === 'enhanced' ? 'Ready' : llmStatus === 'error' ? 'Review' : 'Waiting'}
          </div>
        </div>
      </div>
      <div
        className="flex flex-1 flex-col rounded-lg border border-white/[0.08] bg-[#05080d]/75 p-4 card-container"
        aria-live="polite"
      >
        {output && (
          <div
            className={`mb-3 rounded-lg border px-3 py-2.5 ${
              llmStatus === 'enhanced'
                ? 'bg-emerald-300/[0.06] border-emerald-300/20'
                : 'bg-red-300/[0.07] border-red-300/20'
            }`}
            role={llmStatus === 'error' ? 'alert' : 'status'}
          >
            <div className="flex items-center gap-2">
              {llmStatus === 'enhanced' ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" aria-hidden="true" />
                  <span className="text-sm text-emerald-100 font-medium">AI-Enhanced Prompt</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-200" aria-hidden="true" />
                  <span className="text-sm text-red-100 font-medium">Service Issue</span>
                </>
              )}
            </div>
          </div>
        )}
        <div className="min-h-[400px] flex-1 overflow-y-auto custom-scrollbar">
          {output ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                <pre className="text-container font-mono text-[0.92rem] leading-7 text-slate-200">{output}</pre>
                {llmStatus === 'enhanced' && (
                  <div className="mt-4 rounded-lg border border-blue-300/15 bg-blue-300/[0.05] p-3">
                    <p className="text-container text-xs text-blue-100/80">
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
                    <RefreshCw className="w-5 h-5 text-teal-300 animate-spin" aria-hidden="true" />
                    <span className="text-sm font-medium text-teal-100">Crafting your enhanced prompt...</span>
                  </div>
                  <LoadingSkeleton lines={6} />
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035]">
                    <Wand2 className="w-7 h-7 text-slate-500" aria-hidden="true" />
                  </div>
                  <p className="text-slate-300 text-sm">Your enhanced prompt will appear here</p>
                  <p className="text-slate-500 text-xs mt-1">Enter an idea and click Generate</p>
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
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-all disabled:cursor-not-allowed ${
            copied
              ? 'bg-emerald-300/[0.12] border border-emerald-300/30 text-emerald-100'
              : output
              ? 'bg-[#ff7a68] hover:brightness-110 text-[#190604]'
              : 'border border-white/[0.08] bg-white/[0.04] text-slate-500'
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
          className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.04] px-6 py-3 font-medium text-slate-200 transition-all hover:border-white/[0.16] hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
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
