import { type FC, useMemo, useState } from 'react';
import {
  BookOpen,
  Clock3,
  FileText,
  History,
  Lightbulb,
  LockKeyhole,
  PenLine,
  Search,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { usePrompt } from '../context/PromptContext';
import { getWordCount } from '../utils/validation';
import { formatRelativeTime } from '../utils/formatTime';

const WorkflowRail: FC = () => {
  const {
    state: { history, showHistory },
    actions: { loadFromHistory, setShowHistory, setShowSettings }
  } = usePrompt();
  const [query, setQuery] = useState('');

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return history.slice(0, 5);

    return history
      .filter((item) =>
        item.input.toLowerCase().includes(normalizedQuery) ||
        item.output.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5);
  }, [history, query]);

  const handleExamplesClick = () => {
    document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="hidden xl:flex xl:flex-col xl:w-[18rem] xl:shrink-0 border-r border-white/[0.07] bg-[#080d12]/85 min-h-screen sticky top-0">
      <div className="px-5 py-6 space-y-6">
        <section aria-label="Workflow">
          <p className="rail-label">Workflow</p>
          <div className="space-y-1.5">
            <button type="button" className="rail-nav-item rail-nav-item--active">
              <PenLine className="w-4 h-4" aria-hidden="true" />
              Craft Prompt
            </button>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="rail-nav-item"
              aria-pressed={showHistory}
            >
              <History className="w-4 h-4" aria-hidden="true" />
              History
            </button>
            <button type="button" onClick={handleExamplesClick} className="rail-nav-item">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Examples
            </button>
            <button type="button" className="rail-nav-item">
              <Lightbulb className="w-4 h-4" aria-hidden="true" />
              Smart Suggestions
            </button>
          </div>
        </section>

        <section aria-label="Recent history" className="pt-5 border-t border-white/[0.07]">
          <div className="flex items-center justify-between gap-3">
            <p className="rail-label">History</p>
            <span className="text-[0.68rem] text-slate-500">{history.length} saved</span>
          </div>

          <label className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.035] px-3 py-2 text-sm text-slate-300 focus-within:border-teal-300/60 focus-within:ring-2 focus-within:ring-teal-300/10">
            <Search className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span className="sr-only">Search history</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search history..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </label>

          <div className="mt-4 space-y-2">
            {filteredHistory.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/[0.09] px-3 py-4 text-sm text-slate-500">
                No saved prompts yet.
              </div>
            ) : (
              filteredHistory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => loadFromHistory(item)}
                  className="group w-full rounded-lg border border-transparent px-3 py-2.5 text-left text-sm text-slate-300 transition hover:border-teal-300/25 hover:bg-teal-300/[0.06]"
                >
                  <span className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-teal-300" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-200 group-hover:text-white">{item.input}</span>
                      <span className="mt-1 flex items-center gap-2 text-[0.68rem] text-slate-500">
                        <Clock3 className="h-3 w-3" aria-hidden="true" />
                        {formatRelativeTime(item.timestamp)}
                        <span>{getWordCount(item.input)} words</span>
                      </span>
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/[0.08] text-teal-200">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Privacy First</h2>
              <p className="text-xs text-slate-500">Clear controls for stored data.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="mt-4 inline-flex w-full items-center justify-between rounded-lg border border-white/[0.09] bg-black/15 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-300/35 hover:bg-teal-300/[0.06]"
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-300" aria-hidden="true" />
              Privacy Settings
            </span>
            <Settings className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </button>
        </section>
      </div>

      <div className="mt-auto px-5 py-5 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          Prompt Craft
        </span>
      </div>
    </aside>
  );
};

export default WorkflowRail;
