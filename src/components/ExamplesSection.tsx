import { type FC, type KeyboardEvent, useState } from 'react';
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

  return (
    <section className="surface-card p-8">
      <h3 className="text-2xl font-bold text-gray-100 mb-6 text-center">Try These Examples</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((example) => {
          const Icon = example.icon;
          const isExpanded = expandedCards.has(example.title);
          const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              useExample(example);
            }
          };
          return (
            <article
              key={example.title}
              role="button"
              tabIndex={0}
              onClick={() => useExample(example)}
              onKeyDown={handleCardKeyDown}
              className="text-left surface-panel hover:bg-gray-700/60 transition-all hover:border-teal-400/50 group min-h-[360px] md:min-h-[420px] lg:min-h-[440px] flex flex-col p-6 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-teal-500/30 to-purple-500/30 rounded-lg group-hover:from-teal-500/50 group-hover:to-purple-500/50 transition-all text-teal-300">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h4 className="text-lg font-semibold text-gray-100">{example.title}</h4>
              </div>
              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Input:</p>
                  <p className="text-gray-200 text-sm bg-gray-700/40 rounded-lg p-3">{example.input}</p>
                </div>
                <div className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-400 mb-2">Enhanced:</p>
                  <div
                    className={`bg-gray-700/40 rounded-lg p-3 flex-1 relative ${
                      isExpanded ? 'max-h-none overflow-y-auto' : 'max-h-40 overflow-hidden'
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
                    className="mt-3 inline-flex items-center text-sm text-teal-300 hover:text-teal-200 font-medium"
                  >
                    {isExpanded ? 'Show less' : 'Expand'}
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
