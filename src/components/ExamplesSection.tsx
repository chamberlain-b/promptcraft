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
    <section className="surface-card p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-100 mb-2">Try These Examples</h3>
        <p className="text-sm text-gray-400">Click any example to load it into the editor</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className="text-left surface-panel hover:bg-gray-700/60 transition-all hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-900/10 group min-h-[360px] md:min-h-[420px] lg:min-h-[440px] flex flex-col p-6 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-r from-teal-500/30 to-purple-500/30 rounded-xl group-hover:from-teal-500/50 group-hover:to-purple-500/50 transition-all text-teal-300">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-100 group-hover:text-teal-200 transition-colors">{example.title}</h4>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-teal-400 transition-colors opacity-0 group-hover:opacity-100" aria-hidden="true" />
              </div>

              <div className="flex items-center gap-2 mb-4">
                {example.tone && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">
                    {example.tone}
                  </span>
                )}
                {example.length && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">
                    {example.length}
                  </span>
                )}
              </div>

              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Input</p>
                  <p className="text-gray-200 text-sm bg-gray-700/40 rounded-lg p-3 border border-gray-600/20">{example.input}</p>
                </div>
                <div className="flex-1 flex flex-col">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Enhanced</p>
                  <div
                    className={`bg-gray-700/40 rounded-lg p-3 flex-1 relative border border-gray-600/20 ${
                      isExpanded ? 'max-h-none overflow-y-auto custom-scrollbar' : 'max-h-40 overflow-hidden'
                    }`}
                  >
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">{example.output}</p>
                    {!isExpanded && (
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-800/90 to-transparent pointer-events-none" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleCardExpansion(example.title);
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-sm text-teal-300 hover:text-teal-200 font-medium transition-colors"
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
