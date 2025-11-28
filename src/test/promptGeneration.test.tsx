import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptProvider } from '../context/PromptContext';
import AppLayout from '../components/AppLayout';
import * as llmService from '../services/llmService';

// Mock the LLM service
vi.mock('../services/llmService', () => ({
  default: {
    generateEnhancedPrompt: vi.fn(),
    analyzeIntent: vi.fn(),
  },
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Prompt Generation with Tone/Length Preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate prompt with professional tone and medium length', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    const mockEnhancedPrompt = `<role>
You are a professional content strategist with 10+ years of experience.
</role>

<task>
Create a professional blog post about AI (500-1500 words).
</task>`;

    vi.mocked(llmService.default.generateEnhancedPrompt).mockResolvedValue({
      output: mockEnhancedPrompt,
      requestsLeft: 29,
      limit: 30,
      enhanced: true,
      error: null,
    });

    vi.mocked(llmService.default.analyzeIntent).mockResolvedValue({
      intent: 'writing',
      confidence: 0.8,
      keywords: ['blog', 'post'],
      context: {},
    });

    render(
      <PromptProvider>
        <AppLayout />
      </PromptProvider>
    );

    // Find input textarea
    const textarea = screen.getByRole('textbox', { name: /prompt input/i });
    await user.type(textarea, 'write a blog post about AI');

    // Set tone to professional
    const toneSelect = screen.getByLabelText(/tone/i);
    await user.selectOptions(toneSelect, 'professional');

    // Set length to medium
    const lengthSelect = screen.getByLabelText(/length/i);
    await user.selectOptions(lengthSelect, 'medium');

    // Click generate button
    const generateButton = screen.getByRole('button', { name: /generate prompt/i });
    await user.click(generateButton);

    // Wait for generation to complete
    await waitFor(() => {
      expect(llmService.default.generateEnhancedPrompt).toHaveBeenCalledWith(
        'write a blog post about AI',
        expect.objectContaining({
          tone: 'professional',
          length: 'medium',
        })
      );
    });
  });

  it('should generate prompt with casual tone and short length', async () => {
    const user = userEvent.setup();

    vi.mocked(llmService.default.generateEnhancedPrompt).mockResolvedValue({
      output: 'Enhanced prompt with casual tone',
      requestsLeft: 29,
      limit: 30,
      enhanced: true,
      error: null,
    });

    vi.mocked(llmService.default.analyzeIntent).mockResolvedValue({
      intent: 'writing',
      confidence: 0.8,
      keywords: ['story'],
      context: {},
    });

    render(
      <PromptProvider>
        <AppLayout />
      </PromptProvider>
    );

    const textarea = screen.getByRole('textbox', { name: /prompt input/i });
    await user.type(textarea, 'write a fun story');

    const toneSelect = screen.getByLabelText(/tone/i);
    await user.selectOptions(toneSelect, 'casual');

    const lengthSelect = screen.getByLabelText(/length/i);
    await user.selectOptions(lengthSelect, 'short');

    const generateButton = screen.getByRole('button', { name: /generate prompt/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(llmService.default.generateEnhancedPrompt).toHaveBeenCalledWith(
        'write a fun story',
        expect.objectContaining({
          tone: 'casual',
          length: 'short',
        })
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    vi.mocked(llmService.default.generateEnhancedPrompt).mockResolvedValue({
      output: null,
      requestsLeft: 0,
      limit: 30,
      enhanced: false,
      error: 'API service temporarily unavailable',
    });

    vi.mocked(llmService.default.analyzeIntent).mockResolvedValue({
      intent: 'general',
      confidence: 0.5,
      keywords: [],
      context: {},
    });

    render(
      <PromptProvider>
        <AppLayout />
      </PromptProvider>
    );

    const textarea = screen.getByRole('textbox', { name: /prompt input/i });
    await user.type(textarea, 'test prompt');

    const generateButton = screen.getByRole('button', { name: /generate prompt/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/⚠️/)).toBeInTheDocument();
    });
  });
});

