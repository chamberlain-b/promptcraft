import { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface HistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: string;
}

export interface Suggestion {
  type: string;
  text: string;
  icon: string;
}

export interface ExampleItem {
  title: string;
  input: string;
  output: string;
  icon: LucideIcon;
  tone?: string;
  length?: string;
}

export interface CurrentIntent {
  intent: string;
  confidence: number;
  keywords: string[];
  context: Record<string, unknown>;
}

export interface PromptState {
  input: string;
  output: string;
  isGenerating: boolean;
  copied: boolean;
  isListening: boolean;
  recordingSupported: boolean;
  history: HistoryItem[];
  showHistory: boolean;
  suggestions: Suggestion[];
  showSettings: boolean;
  currentIntent: CurrentIntent | null;
  contextInfo: (Record<string, unknown> & { recentHistory?: HistoryItem[] }) | null;
  llmStatus: 'checking' | 'enhanced' | 'error';
  requestsLeft: number | null;
  requestLimit: number | null;
  currentTone: string;
  currentLength: string;
}

export interface PromptActions {
  setShowHistory: (value: boolean) => void;
  setShowSettings: (value: boolean) => void;
  setCurrentTone: (value: string) => void;
  setCurrentLength: (value: string) => void;
  setInput: (value: string) => void;
  setOutput: (value: string) => void;
  applySuggestion: (suggestion: Suggestion) => void;
  toggleVoiceRecording: () => void;
  generatePrompt: () => Promise<void> | void;
  copyToClipboard: () => Promise<void> | void;
  useExample: (example: ExampleItem) => void;
  clearAll: () => void;
  loadFromHistory: (item: HistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  exportHistory: () => void;
  clearHistory: () => void;
  setIsListening: (value: boolean) => void;
  setHistory: (items: HistoryItem[]) => void;
  checkLlmStatus: () => void;
}

export interface PromptContextValue {
  state: PromptState;
  actions: PromptActions;
}

export declare const PromptProvider: ({ children }: { children: ReactNode }) => JSX.Element;

export declare const usePrompt: () => PromptContextValue;

declare const promptContext: unknown;

export default promptContext;
