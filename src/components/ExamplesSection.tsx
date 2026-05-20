import { type FC, type KeyboardEvent, useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react';
import { examples } from '../data/examples';
import { usePrompt } from '../context/PromptContext';

const ExamplesSection: FC = () => {
  const {
    actions: { useExample }
  } = usePrompt();

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCardExpansion = (title: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const handleUseExample = (example: typeof examples[0]) => {
    useExample(example);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="examples" className="mt-5 scroll-mt-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="panel-kicker">Presets</p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.01em] text-white">Try These Examples</h3>
        </div>
        <p className="text-sm text-slate-500">Load a workflow starter into the editor.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {examples.map((example) => {
          const Icon = example.icon;
          const isExpanded = expandedCards.has(example.title);
          const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleUseExample(example);
            }
          };
          return (
            <article
              key={example.title}
              role="button"
              tabIndex={0}
              aria-label={`Use ${example.title} example`}
              onClick={() => handleUseExample(example)}
              onKeyDown={handleCardKeyDown}
              className="group flex min-h-[20rem] cursor-pointer flex-col rounded-lg border border-white/[0.08] bg-white/[0.035] p-4 text-left transition-all hover:border-teal-300/30 hover:bg-teal-300/[0.045] hover:shadow-[0_18px_80px_rgba(20,184,166,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-white/[0.08] bg-white/[0.05] p-2.5 text-teal-200 transition group-hover:border-teal-300/25 group-hover:bg-teal-300/[0.08]">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-100 transition-colors group-hover:text-white">{example.title}</h4>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600 opacity-0 transition-colors group-hover:text-teal-300 group-hover:opacity-100" aria-hidden="true" />
              </div>

              <div className="flex items-center gap-2 mb-4">
                {example.tone && (
                  <span className="rounded-md border border-teal-300/15 bg-teal-300/[0.06] px-2 py-0.5 text-xs text-teal-100">
                    {example.tone}
                  </span>
                )}
                {example.length && (
                  <span className="rounded-md border border-amber-300/15 bg-amber-300/[0.06] px-2 py-0.5 text-xs text-amber-100">
                    {example.length}
                  </span>
                )}
              </div>

              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase text-slate-600">Input</p>
                  <p className="rounded-lg border border-white/[0.06] bg-black/15 p-3 text-sm text-slate-200">{example.input}</p>
                </div>
                <div className="flex-1 flex flex-col">
                  <p className="mb-1.5 text-xs font-medium uppercase text-slate-600">Enhanced</p>
                  <div
                    className={`relative flex-1 rounded-lg border border-white/[0.06] bg-black/15 p-3 ${
                      isExpanded ? 'max-h-none overflow-y-auto custom-scrollbar' : 'max-h-40 overflow-hidden'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">{example.output}</p>
                    {!isExpanded && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1318] to-transparent" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleCardExpansion(example.title);
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-200 transition-colors hover:text-white"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                        Expand
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ExamplesSection;
