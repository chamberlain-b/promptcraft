import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptProvider } from '../context/PromptContext';
import AppLayout from '../components/AppLayout';
import * as llmService from '../services/llmService';

vi.mock('../services/llmService');
vi.mock('axios');

describe('Full Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full workflow: input -> select preferences -> generate -> display output', async () => {
    const user = userEvent.setup();

    const mockOutput = `<role>
You are a professional content creator.
</role>

<task>
Create a professional blog post about technology (500-1500 words).
</task>

<constraints>
• Professional tone throughout
• Word count: 500-1500 words
</constraints>

<reasoning>
1. Research the topic
2. Structure the content
3. Write engaging sections
</reasoning>

<examples>
Example 1: Professional blog structure
</examples>

<output_format>
• Introduction
• Main content
• Conclusion
</output_format>

<success_criteria>
• Professional tone
• 500-1500 words
</success_criteria>

<guidelines>
• Use professional language
• Maintain consistent tone
</guidelines>`;

    vi.mocked(llmService.default.generateEnhancedPrompt).mockResolvedValue({
      output: mockOutput,
      requestsLeft: 29,
      limit: 30,
      enhanced: true,
      error: null,
    });

    vi.mocked(llmService.default.analyzeIntent).mockResolvedValue({
      intent: 'writing',
      confidence: 0.9,
      keywords: ['blog', 'post', 'technology'],
      context: {},
    });

    render(
      <PromptProvider>
        <AppLayout />
      </PromptProvider>
    );

    // Step 1: Enter input
    const textarea = screen.getByRole('textbox', { name: /prompt input/i });
    await user.type(textarea, 'write a blog post about technology');

    // Step 2: Select tone
    const toneSelect = screen.getByLabelText(/tone/i);
    await user.selectOptions(toneSelect, 'professional');

    // Step 3: Select length
    const lengthSelect = screen.getByLabelText(/length/i);
    await user.selectOptions(lengthSelect, 'medium');

    // Step 4: Generate
    const generateButton = screen.getByRole('button', { name: /generate prompt/i });
    expect(generateButton).not.toBeDisabled();
    await user.click(generateButton);

    // Step 5: Verify API was called with correct parameters
    await waitFor(() => {
      expect(llmService.default.generateEnhancedPrompt).toHaveBeenCalledWith(
        'write a blog post about technology',
        expect.objectContaining({
          tone: 'professional',
          length: 'medium',
        })
      );
    });

    // Step 6: Verify output is displayed
    await waitFor(() => {
      expect(screen.getByText(/professional content creator/i)).toBeInTheDocument();
    });
  });

  it('should handle copy to clipboard functionality', async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
      writable: true,
    });

    vi.mocked(llmService.default.generateEnhancedPrompt).mockResolvedValue({
      output: 'Enhanced prompt output',
      requestsLeft: 29,
      limit: 30,
      enhanced: true,
      error: null,
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
    await user.type(textarea, 'test input');

    const generateButton = screen.getByRole('button', { name: /generate prompt/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Enhanced prompt output/i)).toBeInTheDocument();
    });

    try {
      // Find and click copy button
      const copyButton = screen.getByRole('button', { name: /copy/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith('Enhanced prompt output');
      });
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true,
        writable: true,
      });
    }
  });

  it('should clear all fields when clear button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <PromptProvider>
        <AppLayout />
      </PromptProvider>
    );

    const textarea = screen.getByRole('textbox', { name: /prompt input/i });
    await user.type(textarea, 'test input');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(textarea).toHaveValue('');
  });
});

