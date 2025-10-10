import { describe, expect, it, vi, afterEach } from 'vitest';
import axios from 'axios';
import llmService from '../services/llmService';

vi.mock('axios');

const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn> };

afterEach(() => {
  vi.clearAllMocks();
});

describe('llmService', () => {
  it('detects writing intent from user input', () => {
    const analysis = llmService.localIntentAnalysis('Write a detailed article about accessibility best practices.');
    expect(analysis.intent).toBe('writing');
    expect(analysis.keywords).toContain('accessibility');
  });

  it('extracts concise keyword list without stop words', () => {
    const keywords = llmService.extractKeywords('Analyze the quarterly revenue and profit growth for the business');
    expect(keywords).toEqual(expect.arrayContaining(['analyze', 'quarterly', 'revenue', 'profit', 'growth', 'business']));
    expect(keywords).not.toContain('the');
  });

  it('returns enhanced prompt payload on success', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: {
        result: 'Enhanced prompt',
        requestsLeft: 5,
        limit: 30,
        enhanced: true
      }
    });

    const result = await llmService.generateEnhancedPrompt('draft an email', {});

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/generate',
      { prompt: 'draft an email', context: {} },
      expect.objectContaining({ timeout: 30000 })
    );
    expect(result).toMatchObject({
      output: 'Enhanced prompt',
      requestsLeft: 5,
      limit: 30,
      enhanced: true,
      error: null
    });
  });

  it('surfaces rate limit data on 429 response', async () => {
    mockedAxios.post = vi.fn().mockRejectedValue({
      response: {
        status: 429,
        data: {
          requestsLeft: 0,
          limit: 30,
          error: 'Monthly limit reached'
        }
      }
    });

    const result = await llmService.generateEnhancedPrompt('draft an email', {});

    expect(result).toMatchObject({
      output: null,
      requestsLeft: 0,
      limit: 30,
      error: 'Monthly limit reached'
    });
  });
});
