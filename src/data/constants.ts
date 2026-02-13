// App-wide constants

export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'academic', label: 'Academic' },
  { value: 'technical', label: 'Technical' },
  { value: 'creative', label: 'Creative' }
];

export const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
  { value: 'comprehensive', label: 'Comprehensive' }
];

export const TEXTAREA_MIN_HEIGHT = 220;
export const TEXTAREA_MAX_HEIGHT = 600;
export const CARD_MIN_HEIGHT = 800;
export const HISTORY_LIMIT = 10;
export const SILENCE_TIMEOUT = 5000; // milliseconds
export const REQUEST_LIMIT = 30;
export const API_TIMEOUT = 30000; // 30 seconds for API calls
export const API_MAX_RETRIES = 2; // retry up to 2 times on timeout/network errors
export const API_RETRY_BASE_DELAY = 1000; // 1 second base delay for exponential backoff
export const GENERATION_TIMEOUT = 60000; // 60 seconds overall timeout for prompt generation
export const FILE_READ_TIMEOUT = 10000; // 10 seconds for file read operations
export const CLIPBOARD_TIMEOUT = 5000; // 5 seconds for clipboard operations
