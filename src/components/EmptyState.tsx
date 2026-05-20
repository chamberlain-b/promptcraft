import { type FC, type ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

const EmptyState: FC<EmptyStateProps> = ({ icon: Icon, title, description, action, children }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="px-6 py-2.5 bg-teal-400 hover:bg-teal-300 text-[#06100f] rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-teal-300/40 focus:ring-offset-2 focus:ring-offset-[#080c10]"
        >
          {action.label}
        </button>
      )}
      {children}
    </div>
  );
};

export default EmptyState;
