import { v4 as uuidv4 } from 'uuid';

class ContextService {
  constructor() {
    this.conversationHistory = [];
    this.userPreferences = {};
    this.sessionContext = {};
    this.loadFromStorage();
  }

  loadFromStorage() {
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

  saveToStorage() {
    try {
      localStorage.setItem('promptcraft-conversation-history', JSON.stringify(this.conversationHistory));
      localStorage.setItem('promptcraft-user-preferences', JSON.stringify(this.userPreferences));
      localStorage.setItem('promptcraft-session-context', JSON.stringify(this.sessionContext));
    } catch (error) {
      console.error('Error saving context to storage:', error);
    }
  }

  addToHistory(input, output, metadata = {}) {
    const historyItem = {
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

  getRecentContext(limit = 5) {
    return this.conversationHistory.slice(0, limit).map(item => ({
      input: item.input,
      output: item.output,
      intent: item.metadata.intent,
      timestamp: item.timestamp
    }));
  }

  getContextForIntent(intent, limit = 3) {
    return this.conversationHistory
      .filter(item => item.metadata.intent === intent)
      .slice(0, limit)
      .map(item => ({
        input: item.input,
        output: item.output,
        timestamp: item.timestamp
      }));
  }

  updateUserPreferences(preferences) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    this.saveToStorage();
  }

  getUserPreferences() {
    return this.userPreferences;
  }

  updateSessionContext(context) {
    this.sessionContext = { ...this.sessionContext, ...context };
    this.saveToStorage();
  }

  getSessionContext() {
    return this.sessionContext;
  }

  clearSessionContext() {
    this.sessionContext = {};
    this.saveToStorage();
  }

  clearHistory() {
    this.conversationHistory = [];
    this.saveToStorage();
  }

  deleteHistoryItem(id) {
    this.conversationHistory = this.conversationHistory.filter(item => item.id !== id);
    this.saveToStorage();
  }

  getContextSummary() {
    const recentItems = this.conversationHistory.slice(0, 10);
    const intentCounts = {};
    const commonKeywords = new Map();
    
    recentItems.forEach(item => {
      // Count intents
      const intent = item.metadata.intent;
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
      
      // Count keywords
      item.metadata.keywords.forEach(keyword => {
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

  getEnhancedContext(userInput, intent) {
    const context = {
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

  findSimilarRequests(userInput, limit = 3) {
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

  calculateSimilarity(words1, words2) {
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  exportHistory() {
    const exportData = {
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

  importHistory(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.conversationHistory) {
            this.conversationHistory = data.conversationHistory;
          }
          if (data.userPreferences) {
            this.userPreferences = data.userPreferences;
          }
          if (data.sessionContext) {
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