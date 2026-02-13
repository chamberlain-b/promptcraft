import { v4 as uuidv4 } from 'uuid';

interface Metadata {
  intent?: string;
  confidence?: number;
  keywords?: string[];
  context?: Record<string, any>;
  [key: string]: any;
}

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: string;
  metadata: Metadata;
}

interface ContextSummary {
  input: string;
  output: string;
  intent?: string;
  timestamp: string;
}

interface IntentContextSummary {
  input: string;
  output: string;
  timestamp: string;
}

interface KeywordCount {
  keyword: string;
  count: number;
}

interface FullContextSummary {
  totalInteractions: number;
  recentInteractions: number;
  intentDistribution: Record<string, number>;
  commonKeywords: KeywordCount[];
  lastInteraction?: string;
}

interface EnhancedContext {
  userPreferences: Record<string, any>;
  sessionContext: Record<string, any>;
  recentHistory: ContextSummary[];
  intentHistory: IntentContextSummary[];
  summary: FullContextSummary;
  continuation?: boolean;
  previousOutput?: string;
  similarRequests?: SimilarRequest[];
}

interface SimilarRequest extends HistoryItem {
  similarity: number;
}

interface ExportData {
  conversationHistory: HistoryItem[];
  userPreferences: Record<string, any>;
  sessionContext: Record<string, any>;
  exportDate: string;
  version: string;
}

class ContextService {
  private conversationHistory: HistoryItem[];
  private userPreferences: Record<string, any>;
  private sessionContext: Record<string, any>;

  constructor() {
    this.conversationHistory = [];
    this.userPreferences = {};
    this.sessionContext = {};
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const savedHistory = localStorage.getItem('promptcraft-conversation-history');
      const savedPreferences = localStorage.getItem('promptcraft-user-preferences');
      const savedSession = localStorage.getItem('promptcraft-session-context');

      if (savedHistory) {
        this.conversationHistory = JSON.parse(savedHistory);
      }
      if (savedPreferences) {
        this.userPreferences = JSON.parse(savedPreferences);
      }
      if (savedSession) {
        this.sessionContext = JSON.parse(savedSession);
      }
    } catch (error) {
      console.error('Error loading context from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('promptcraft-conversation-history', JSON.stringify(this.conversationHistory));
      localStorage.setItem('promptcraft-user-preferences', JSON.stringify(this.userPreferences));
      localStorage.setItem('promptcraft-session-context', JSON.stringify(this.sessionContext));
    } catch (error) {
      console.error('Error saving context to storage:', error);
    }
  }

  addToHistory(input: string, output: string, metadata: Metadata = {}): HistoryItem {
    const historyItem: HistoryItem = {
      id: uuidv4(),
      input,
      output,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: metadata.intent || 'general',
        confidence: metadata.confidence || 0.8,
        keywords: metadata.keywords || [],
        context: metadata.context || {},
        ...metadata
      }
    };

    this.conversationHistory.unshift(historyItem);

    // Keep only last 50 items to prevent storage bloat
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(0, 50);
    }

    this.saveToStorage();
    return historyItem;
  }

  getRecentContext(limit: number = 5): ContextSummary[] {
    return this.conversationHistory.slice(0, limit).map(item => ({
      input: item.input,
      output: item.output,
      intent: item.metadata.intent,
      timestamp: item.timestamp
    }));
  }

  getContextForIntent(intent: string, limit: number = 3): IntentContextSummary[] {
    return this.conversationHistory
      .filter(item => item.metadata.intent === intent)
      .slice(0, limit)
      .map(item => ({
        input: item.input,
        output: item.output,
        timestamp: item.timestamp
      }));
  }

  updateUserPreferences(preferences: Record<string, any>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    this.saveToStorage();
  }

  getUserPreferences(): Record<string, any> {
    return this.userPreferences;
  }

  updateSessionContext(context: Record<string, any>): void {
    this.sessionContext = { ...this.sessionContext, ...context };
    this.saveToStorage();
  }

  getSessionContext(): Record<string, any> {
    return this.sessionContext;
  }

  clearSessionContext(): void {
    this.sessionContext = {};
    this.saveToStorage();
  }

  clearHistory(): void {
    this.conversationHistory = [];
    this.saveToStorage();
  }

  deleteHistoryItem(id: string): void {
    this.conversationHistory = this.conversationHistory.filter(item => item.id !== id);
    this.saveToStorage();
  }

  getContextSummary(): FullContextSummary {
    const recentItems = this.conversationHistory.slice(0, 10);
    const intentCounts: Record<string, number> = {};
    const commonKeywords = new Map<string, number>();

    recentItems.forEach(item => {
      // Count intents
      const intent = item.metadata.intent || 'general';
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;

      // Count keywords
      item.metadata.keywords?.forEach(keyword => {
        commonKeywords.set(keyword, (commonKeywords.get(keyword) || 0) + 1);
      });
    });

    const topKeywords = Array.from(commonKeywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));

    return {
      totalInteractions: this.conversationHistory.length,
      recentInteractions: recentItems.length,
      intentDistribution: intentCounts,
      commonKeywords: topKeywords,
      lastInteraction: this.conversationHistory[0]?.timestamp
    };
  }

  getEnhancedContext(userInput: string, intent: string): EnhancedContext {
    const context: EnhancedContext = {
      userPreferences: this.userPreferences,
      sessionContext: this.sessionContext,
      recentHistory: this.getRecentContext(3),
      intentHistory: this.getContextForIntent(intent, 2),
      summary: this.getContextSummary()
    };

    // Add relevant context based on user input
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('continue') || lowerInput.includes('follow up')) {
      context.continuation = true;
      context.previousOutput = this.conversationHistory[0]?.output;
    }

    if (lowerInput.includes('similar') || lowerInput.includes('like')) {
      context.similarRequests = this.findSimilarRequests(userInput);
    }

    return context;
  }

  private findSimilarRequests(userInput: string, limit: number = 3): SimilarRequest[] {
    const inputWords = userInput.toLowerCase().split(/\s+/).filter(word => word.length > 3);

    return this.conversationHistory
      .map(item => ({
        ...item,
        similarity: this.calculateSimilarity(inputWords, item.input.toLowerCase().split(/\s+/))
      }))
      .filter(item => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  private calculateSimilarity(words1: string[], words2: string[]): number {
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  exportHistory(): void {
    const exportData: ExportData = {
      conversationHistory: this.conversationHistory,
      userPreferences: this.userPreferences,
      sessionContext: this.sessionContext,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptcraft-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importHistory(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as ExportData;

          if (data.conversationHistory && Array.isArray(data.conversationHistory)) {
            // Validate each item has required string fields
            const valid = data.conversationHistory.every(
              (item) => typeof item.id === 'string' && typeof item.input === 'string' && typeof item.output === 'string'
            );
            if (valid) {
              this.conversationHistory = data.conversationHistory.slice(0, 50);
            }
          }
          if (data.userPreferences && typeof data.userPreferences === 'object' && !Array.isArray(data.userPreferences)) {
            this.userPreferences = data.userPreferences;
          }
          if (data.sessionContext && typeof data.sessionContext === 'object' && !Array.isArray(data.sessionContext)) {
            this.sessionContext = data.sessionContext;
          }

          this.saveToStorage();
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

export default new ContextService();
