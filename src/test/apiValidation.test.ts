import { describe, it, expect } from 'vitest';

// Import the validation function from generate.js
// Since it's not exported, we'll test the logic here
describe('API Output Validation', () => {
  const validateEnhancedOutput = (output: string, input: string, context: any = {}) => {
    const reasons: string[] = [];
    const outputLower = output.toLowerCase();
    const inputLength = input.trim().length;
    const outputLength = output.trim().length;

    // Check 1: Output length must be 3-5x longer than input
    const minExpectedLength = inputLength * 3;
    if (outputLength < minExpectedLength) {
      reasons.push(`Output length (${outputLength}) is less than 3x input length (${inputLength}). Expected at least ${minExpectedLength} characters.`);
    }

    // Check 2: Must have role/expertise section
    const hasRole = outputLower.includes('<role>') ||
                    outputLower.includes('</role>') ||
                    outputLower.includes('**role') ||
                    outputLower.includes('role & expertise') ||
                    outputLower.includes('role:') ||
                    outputLower.includes('## role');
    if (!hasRole) {
      reasons.push('Missing role/expertise section');
    }

    // Check 3: Must have context/background section
    const hasContext = outputLower.includes('<context>') ||
                       outputLower.includes('</context>') ||
                       outputLower.includes('**context') ||
                       outputLower.includes('context & background') ||
                       outputLower.includes('context:') ||
                       outputLower.includes('## context') ||
                       outputLower.includes('background');
    if (!hasContext) {
      reasons.push('Missing context/background section');
    }

    // Check 4: Must have task section
    const hasTask = outputLower.includes('<task>') ||
                    outputLower.includes('</task>') ||
                    outputLower.includes('**task') ||
                    outputLower.includes('task overview') ||
                    outputLower.includes('task & objective') ||
                    outputLower.includes('task:') ||
                    outputLower.includes('## task');
    if (!hasTask) {
      reasons.push('Missing task section');
    }

    // Check 5: Must have constraints/requirements section
    const hasConstraints = outputLower.includes('<constraints>') ||
                           outputLower.includes('</constraints>') ||
                           outputLower.includes('**constraints') ||
                           outputLower.includes('**requirements') ||
                           outputLower.includes('constraints & requirements') ||
                           outputLower.includes('constraints:') ||
                           outputLower.includes('requirements:') ||
                           outputLower.includes('## constraints') ||
                           (outputLower.includes('constraints') && outputLower.includes('•'));
    if (!hasConstraints) {
      reasons.push('Missing constraints/requirements section');
    }

    // Check 6: Must have reasoning process section
    const hasReasoning = outputLower.includes('<reasoning>') ||
                         outputLower.includes('</reasoning>') ||
                         outputLower.includes('**reasoning') ||
                         outputLower.includes('reasoning process') ||
                         outputLower.includes('chain-of-thought') ||
                         outputLower.includes('chain of thought') ||
                         outputLower.includes('## reasoning');
    if (!hasReasoning) {
      reasons.push('Missing reasoning process section');
    }

    // Check 7: Must have examples (few-shot learning)
    const hasExamples = outputLower.includes('<examples>') ||
                        outputLower.includes('</examples>') ||
                        outputLower.includes('**examples') ||
                        outputLower.includes('examples & few-shot') ||
                        outputLower.includes('few-shot learning') ||
                        outputLower.includes('example 1') ||
                        outputLower.includes('example:') ||
                        (outputLower.includes('example') && (outputLower.includes('example 2') || outputLower.includes('example 3') || outputLower.includes('pattern')));
    if (!hasExamples) {
      reasons.push('Missing examples/few-shot learning section');
    }

    // Check 8: Must have output format section
    const hasOutputFormat = outputLower.includes('<output_format>') ||
                            outputLower.includes('</output_format>') ||
                            outputLower.includes('**output format') ||
                            outputLower.includes('output format & structure') ||
                            outputLower.includes('output structure') ||
                            outputLower.includes('format requirements') ||
                            outputLower.includes('## output format');
    if (!hasOutputFormat) {
      reasons.push('Missing output format/structure section');
    }

    // Check 9: Must have success criteria section
    const hasSuccessCriteria = outputLower.includes('<success_criteria>') ||
                               outputLower.includes('</success_criteria>') ||
                               outputLower.includes('**success criteria') ||
                               outputLower.includes('success criteria') ||
                               outputLower.includes('## success criteria');
    if (!hasSuccessCriteria) {
      reasons.push('Missing success criteria section');
    }

    // Check 10: Must use structured formatting
    const hasStructuredFormat = outputLower.includes('<role>') ||
                                outputLower.includes('</role>') ||
                                outputLower.includes('<context>') ||
                                outputLower.includes('</context>') ||
                                outputLower.includes('<task>') ||
                                outputLower.includes('</task>') ||
                                outputLower.includes('**role') ||
                                outputLower.includes('**context') ||
                                outputLower.includes('**task') ||
                                outputLower.includes('## role') ||
                                outputLower.includes('## context') ||
                                outputLower.includes('## task') ||
                                outputLower.includes('###') ||
                                output.includes('"""');
    if (!hasStructuredFormat) {
      reasons.push('Missing structured formatting (XML tags or Markdown headers)');
    }

    // Check 11: If context has tone/length, verify they're being used
    if (context && context.tone) {
      const tone = context.tone.toLowerCase();
      const toneMentioned = outputLower.includes(tone) ||
                            (tone === 'professional' && (outputLower.includes('professional') || outputLower.includes('business'))) ||
                            (tone === 'casual' && (outputLower.includes('casual') || outputLower.includes('conversational') || outputLower.includes('friendly'))) ||
                            (tone === 'formal' && outputLower.includes('formal')) ||
                            (tone === 'academic' && (outputLower.includes('academic') || outputLower.includes('scholarly') || outputLower.includes('research'))) ||
                            (tone === 'technical' && outputLower.includes('technical'));
      if (!toneMentioned) {
        reasons.push(`Tone preference (${context.tone}) is not being applied in the enhanced prompt`);
      }
    }

    if (context && context.length) {
      const length = context.length.toLowerCase();
      const lengthMentioned = outputLower.includes(length) ||
                              (length === 'short' && (outputLower.includes('200') || outputLower.includes('300') || outputLower.includes('500') || outputLower.includes('brief'))) ||
                              (length === 'medium' && (outputLower.includes('500') || outputLower.includes('1000') || outputLower.includes('1500') || outputLower.includes('moderate'))) ||
                              (length === 'long' && (outputLower.includes('1500') || outputLower.includes('2000') || outputLower.includes('3000') || outputLower.includes('detailed'))) ||
                              (length === 'comprehensive' && (outputLower.includes('3000') || outputLower.includes('comprehensive') || outputLower.includes('thorough') || outputLower.includes('extensive')));
      if (!lengthMentioned) {
        reasons.push(`Length preference (${context.length}) is not being applied in the enhanced prompt`);
      }
    }

    return {
      isValid: reasons.length === 0,
      reasons: reasons,
    };
  };

  it('should validate a properly formatted XML prompt', () => {
    const input = 'write a blog post';
    const output = `<role>
You are a professional content writer.
</role>

<context>
Blog posts need engaging content.
</context>

<task>
Create a professional blog post (500-1500 words).
</task>

<constraints>
• Word count: 500-1500
• Professional tone
</constraints>

<reasoning>
1. Analyze the topic
2. Structure the content
</reasoning>

<examples>
Example 1: Blog post structure
</examples>

<output_format>
• Introduction
• Body
• Conclusion
</output_format>

<success_criteria>
• Engaging content
• Clear structure
</success_criteria>

<guidelines>
• Use professional language
• Include examples
</guidelines>`;

    const result = validateEnhancedOutput(output, input, { tone: 'professional', length: 'medium' });
    expect(result.isValid).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('should validate a properly formatted Markdown prompt', () => {
    const input = 'explain quantum computing';
    const output = `**ROLE & EXPERTISE:**
You are a quantum physicist.

**CONTEXT & BACKGROUND:**
Quantum computing is a new field.

**TASK & OBJECTIVE:**
Explain quantum computing comprehensively (3000+ words).

**CONSTRAINTS & REQUIREMENTS:**
• Comprehensive coverage
• Academic tone

**REASONING PROCESS:**
1. Start with basics
2. Build complexity

**EXAMPLES & FEW-SHOT LEARNING:**
Example 1: Basic quantum concepts

**OUTPUT FORMAT & STRUCTURE:**
• Introduction
• Main content
• Conclusion

**SUCCESS CRITERIA:**
• Accurate information
• Clear explanations

**GUIDELINES & BEST PRACTICES:**
• Use academic language
• Include equations`;

    const result = validateEnhancedOutput(output, input, { tone: 'academic', length: 'comprehensive' });
    expect(result.isValid).toBe(true);
  });

  it('should reject output that is too short', () => {
    const input = 'write a long detailed article about space exploration with many sections and comprehensive coverage';
    const output = 'Write about space.';

    const result = validateEnhancedOutput(output, input);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some(r => r.includes('Output length'))).toBe(true);
  });

  it('should reject output missing required sections', () => {
    const input = 'test';
    const output = 'This is just some text without structure.';

    const result = validateEnhancedOutput(output, input);
    expect(result.isValid).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('should validate tone preference is applied', () => {
    const input = 'write a story';
    const output = `<role>
You are a casual storyteller.
</role>

<task>
Create a casual, friendly story (200-500 words).
</task>

<guidelines>
• Use casual, conversational tone
• Keep it friendly and engaging
</guidelines>`;

    const result = validateEnhancedOutput(output, input, { tone: 'casual', length: 'short' });
    expect(result.isValid).toBe(true);
  });

  it('should reject output that ignores tone preference', () => {
    const input = 'write a story';
    const output = `<role>
You are a writer.
</role>

<task>
Write a story.
</task>`;

    const result = validateEnhancedOutput(output, input, { tone: 'professional' });
    expect(result.isValid).toBe(false);
    expect(result.reasons.some(r => r.includes('Tone preference'))).toBe(true);
  });

  it('should validate length preference is applied', () => {
    const input = 'explain AI';
    const output = `<role>
You are an AI expert.
</role>

<task>
Provide a comprehensive explanation of AI (3000+ words).
</task>

<constraints>
• Word count: 3000+ words
• Comprehensive coverage required
</constraints>`;

    const result = validateEnhancedOutput(output, input, { length: 'comprehensive' });
    expect(result.isValid).toBe(true);
  });

  it('should reject output that ignores length preference', () => {
    const input = 'explain AI';
    const output = `<role>
You are an expert.
</role>

<task>
Explain AI.
</task>`;

    const result = validateEnhancedOutput(output, input, { length: 'comprehensive' });
    expect(result.isValid).toBe(false);
    expect(result.reasons.some(r => r.includes('Length preference'))).toBe(true);
  });
});

