import { type FC } from 'react';
import { examples } from '../data/examples';
import { usePrompt } from '../context/PromptContext';

const ExamplesSection: FC = () => {
  const {
    actions: { useExample }
  } = usePrompt();

  return (
    <section className="surface-card p-8">
      <h3 className="text-2xl font-bold text-gray-100 mb-6 text-center">Try These Examples</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((example) => {
          const Icon = example.icon;
          return (
            <button
              key={example.title}
              type="button"
              onClick={() => useExample(example)}
              className="text-left surface-panel hover:bg-gray-700/60 transition-all hover:border-teal-400/50 group min-h-[500px] flex flex-col p-6"
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
                  <div className="bg-gray-700/40 rounded-lg p-3 flex-1 overflow-y-auto max-h-[250px]">
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">{example.output}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ExamplesSection;
