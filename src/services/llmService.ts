import axios, { type AxiosError } from 'axios';
import { API_TIMEOUT, API_MAX_RETRIES, API_RETRY_BASE_DELAY } from '../data/constants';

interface Context {
  tone?: string;
  length?: string;
  [key: string]: any;
}

interface EnhancedPromptResult {
  output: string | null;
  requestsLeft: number | null;
  limit: number | null;
  enhanced?: boolean;
  error: string | null;
}

interface IntentAnalysis {
  intent: string;
  confidence: number;
  keywords: string[];
  context: Record<string, string>;
}

interface IntentData {
  keywords: string[];
  weight: number;
}

class LLMService {
  private isAvailable: boolean;
  private abortController: AbortController | null = null;

  constructor() {
    // No need for OpenAI client when using backend proxy
    this.isAvailable = true;
  }

  private isRetryableError(error: AxiosError): boolean {
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') return true;
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status === 502 || status === 503 || status === 504;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async generateEnhancedPrompt(userInput: string, context: Context = {}): Promise<EnhancedPromptResult> {
    // Cancel any in-flight request
    this.cancelRequest();
    this.abortController = new AbortController();

    const requestBody = {
      prompt: userInput,
      context
    };

    let lastError: AxiosError | null = null;

    for (let attempt = 0; attempt <= API_MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const backoffDelay = API_RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
          console.log(`Retry attempt ${attempt}/${API_MAX_RETRIES} after ${backoffDelay}ms...`);
          await this.delay(backoffDelay);
        }

        console.log('Sending request for AI enhancement...');
        const response = await axios.post('/api/generate', requestBody, {
          timeout: API_TIMEOUT,
          signal: this.abortController.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response received:', {
          enhanced: response.data.enhanced,
          hasResult: !!response.data.result,
          requestsLeft: response.data.requestsLeft
        });

        return {
          output: response.data.result,
          requestsLeft: response.data.requestsLeft,
          limit: response.data.limit,
          enhanced: response.data.enhanced,
          error: null
        };
      } catch (error) {
        const axiosError = error as AxiosError<any>;

        // Don't retry if the request was intentionally cancelled
        if (axiosError.code === 'ERR_CANCELED' && this.abortController?.signal.aborted) {
          return {
            output: null,
            requestsLeft: null,
            limit: null,
            error: 'Request was cancelled.'
          };
        }

        lastError = axiosError;

        // Only retry on retryable errors and if we have attempts left
        if (attempt < API_MAX_RETRIES && this.isRetryableError(axiosError)) {
          continue;
        }

        break;
      }
    }

    // All retries exhausted or non-retryable error
    console.error('API Error:', lastError);
    const axiosError = lastError!;

    if (axiosError.code === 'ECONNABORTED') {
      return {
        output: null,
        requestsLeft: null,
        limit: null,
        error: 'Request timed out. The server took too long to respond. Please try again.'
      };
    }

    if (!axiosError.response) {
      return {
        output: null,
        requestsLeft: null,
        limit: null,
        error: 'Network error. Please check your connection and try again.'
      };
    }

    if (axiosError.response.status === 429) {
      return {
        output: null,
        requestsLeft: axiosError.response.data.requestsLeft,
        limit: axiosError.response.data.limit,
        error: axiosError.response.data.error || 'Monthly free request limit reached.'
      };
    }

    if (axiosError.response.status === 500 || axiosError.response.status === 503) {
      const errorMessage = axiosError.response?.data?.error || 'Service temporarily unavailable';
      console.error('Server error details:', axiosError.response.data);
      return {
        output: null,
        requestsLeft: axiosError.response.data?.requestsLeft ?? null,
        limit: axiosError.response.data?.limit ?? null,
        error: errorMessage || 'Service temporarily unavailable. Please try again in a moment.'
      };
    }

    if (axiosError.response.status === 404) {
      const errorMessage = axiosError.response?.data?.error || 'Model not found';
      console.error('Model not found error:', axiosError.response.data);
      return {
        output: null,
        requestsLeft: axiosError.response.data?.requestsLeft ?? null,
        limit: axiosError.response.data?.limit ?? null,
        error: errorMessage
      };
    }

    if (axiosError.response.status === 400) {
      const errorMessage = axiosError.response?.data?.error || 'Invalid request';
      console.error('Invalid request error:', axiosError.response.data);
      return {
        output: null,
        requestsLeft: axiosError.response.data?.requestsLeft ?? null,
        limit: axiosError.response.data?.limit ?? null,
        error: errorMessage
      };
    }

    return {
      output: null,
      requestsLeft: null,
      limit: null,
      error: axiosError.response?.data?.error || axiosError.message || 'Connection error. Please try again.'
    };
  }

  // Simple client-side intent analysis for context enrichment
  async analyzeIntent(userInput: string): Promise<IntentAnalysis> {
    return this.localIntentAnalysis(userInput);
  }

  private localIntentAnalysis(userInput: string): IntentAnalysis {
    const lowerInput = userInput.toLowerCase();
    const intent = this.detectIntent(lowerInput);
    const keywords = this.extractKeywords(userInput);

    return {
      intent: intent,
      confidence: 0.8,
      keywords: keywords,
      context: this.extractContext(userInput)
    };
  }

  private detectIntent(input: string): string {
    const intents: Record<string, IntentData> = {
      'writing': {
        keywords: ['write', 'story', 'article', 'blog', 'content', 'essay', 'report', 'copy', 'script', 'narrative', 'review', 'description'],
        weight: 1
      },
      'coding': {
        keywords: ['code', 'program', 'script', 'debug', 'algorithm', 'function', 'api', 'software', 'app', 'website', 'database', 'python', 'javascript', 'react', 'html', 'css'],
        weight: 1
      },
      'analysis': {
        keywords: ['analyze', 'explain', 'data', 'research', 'study', 'examine', 'evaluate', 'assess', 'investigate', 'compare', 'statistics', 'trends'],
        weight: 1
      },
      'communication': {
        keywords: ['email', 'message', 'letter', 'proposal', 'presentation', 'pitch', 'memo', 'announcement', 'newsletter', 'response'],
        weight: 1
      },
      'planning': {
        keywords: ['plan', 'organize', 'schedule', 'strategy', 'roadmap', 'timeline', 'project', 'workflow', 'process', 'framework'],
        weight: 1
      },
      'education': {
        keywords: ['teach', 'learn', 'tutorial', 'guide', 'explain', 'how to', 'lesson', 'course', 'training', 'instruction', 'workshop'],
        weight: 1
      },
      'creation': {
        keywords: ['design', 'create', 'build', 'develop', 'invent', 'generate', 'make', 'craft', 'produce', 'construct'],
        weight: 1
      },
      'business': {
        keywords: ['business', 'strategy', 'marketing', 'sales', 'startup', 'revenue', 'profit', 'customer', 'market', 'competitor', 'growth'],
        weight: 1
      },
      'health': {
        keywords: ['health', 'fitness', 'wellness', 'diet', 'exercise', 'nutrition', 'medical', 'symptom', 'treatment', 'therapy'],
        weight: 1
      },
      'travel': {
        keywords: ['travel', 'trip', 'vacation', 'itinerary', 'destination', 'hotel', 'flight', 'tourism', 'visit', 'explore'],
        weight: 1
      },
      'finance': {
        keywords: ['finance', 'money', 'budget', 'investment', 'financial', 'savings', 'loan', 'credit', 'tax', 'income'],
        weight: 1
      },
      'legal': {
        keywords: ['legal', 'law', 'contract', 'agreement', 'compliance', 'regulation', 'policy', 'rights', 'liability'],
        weight: 1
      },
      'career': {
        keywords: ['career', 'job', 'resume', 'interview', 'professional', 'skill', 'promotion', 'networking', 'workplace'],
        weight: 1
      }
    };

    let bestMatch = 'general';
    let highestScore = 0;

    for (const [intent, data] of Object.entries(intents)) {
      let score = 0;
      data.keywords.forEach(keyword => {
        if (input.includes(keyword)) {
          // Give more weight to exact matches and longer keywords
          score += keyword.length > 5 ? 2 : 1;
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = intent;
      }
    }

    return bestMatch;
  }

  private extractKeywords(input: string): string[] {
    // Simple keyword extraction
    const words = input.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);

    return words.filter(word =>
      word.length > 2 &&
      !stopWords.has(word) &&
      /^[a-zA-Z]+$/.test(word)
    ).slice(0, 10);
  }

  private extractContext(input: string): Record<string, string> {
    // Extract context clues from input
    const context: Record<string, string> = {};

    if (input.includes('for') && input.includes('audience')) {
      context.audience = input.match(/for\s+([^,\.]+)/i)?.[1] || 'general';
    }

    if (input.includes('in') && (input.includes('language') || input.includes('python') || input.includes('javascript'))) {
      context.language = input.match(/in\s+([^,\.]+)/i)?.[1] || 'general';
    }

    if (input.includes('about') || input.includes('regarding')) {
      context.topic = input.match(/(?:about|regarding)\s+([^,\.]+)/i)?.[1] || '';
    }

    return context;
  }
}

export default new LLMService();
