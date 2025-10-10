import { beforeEach, describe, expect, it } from 'vitest';
import contextService from '../services/contextService';

const HISTORY_KEY = 'promptcraft-conversation-history';

beforeEach(() => {
  localStorage.clear();
  contextService.clearHistory();
  contextService.clearSessionContext();
});

describe('contextService', () => {
  it('adds history items and persists them to storage', () => {
    const item = contextService.addToHistory('input prompt', 'generated output', { intent: 'writing', confidence: 0.8 });

    expect(item).toHaveProperty('id');
    expect(item.input).toBe('input prompt');

    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].input).toBe('input prompt');
  });

  it('trims conversation history to the latest 50 entries', () => {
    for (let index = 0; index < 60; index += 1) {
      contextService.addToHistory(`prompt ${index}`, `output ${index}`);
    }

    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    expect(stored).toHaveLength(50);
    expect(stored[0].input).toBe('prompt 59');
    expect(stored[49].input).toBe('prompt 10');
  });

  it('removes a specific history item', () => {
    const first = contextService.addToHistory('first prompt', 'first output');
    const second = contextService.addToHistory('second prompt', 'second output');

    contextService.deleteHistoryItem(first.id);

    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(second.id);
  });
});
