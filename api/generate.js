import { OpenAI } from 'openai';
import { checkRateLimit, incrementUsage, getUsageStats } from './rateLimit.js';

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Determines the appropriate reasoning_effort level based on input complexity.
 * For GPT-5.2: supports 'none', 'low', 'medium', 'high'.
 * GPT-5.2 defaults to 'none' reasoning, so we must explicitly set effort
 * for prompt enhancement tasks which require structured reasoning.
 * @param {string} prompt - The user's input prompt
 * @param {object} context - Additional context object
 * @returns {'low' | 'medium' | 'high'} - The reasoning effort level
 */
function determineReasoningEffort(prompt, context = {}) {
  if (!prompt) return 'medium';

  const promptLength = prompt.length;
  const wordCount = prompt.split(/\s+/).length;
  const contextKeys = context ? Object.keys(context).length : 0;
  const lowerPrompt = prompt.toLowerCase();

  // Complex intents requiring high reasoning
  const complexIntents = ['analysis', 'research', 'comprehensive', 'detailed', 'explain', 'evaluate', 'compare', 'synthesize', 'complex', 'advanced', 'architect', 'design', 'optimize'];
  const hasComplexIntent = complexIntents.some(intent => lowerPrompt.includes(intent));

  // Domain-specific complexity indicators
  const complexKeywords = ['quantum', 'algorithm', 'architecture', 'strategy', 'framework', 'methodology', 'theoretical', 'mathematical', 'scientific', 'technical', 'distributed', 'concurrent', 'cryptograph', 'machine learning', 'neural'];
  const hasComplexKeywords = complexKeywords.some(keyword => lowerPrompt.includes(keyword));

  // Multi-step or structured request indicators
  const structuredIndicators = ['step by step', 'multiple', 'compare and contrast', 'pros and cons', 'trade-offs', 'end to end', 'full stack'];
  const hasStructuredRequest = structuredIndicators.some(indicator => lowerPrompt.includes(indicator));

  // Length preference escalation
  const lengthPref = context?.length || 'medium';
  const isLongForm = lengthPref === 'long' || lengthPref === 'comprehensive';

  // Scoring system - calibrated for GPT-5.2 where default is 'none'
  // Prompt enhancement is inherently a reasoning task, so baseline is 'medium'
  let complexityScore = 2; // baseline for prompt enhancement work

  // Length-based scoring
  if (promptLength > 500 || wordCount > 100) {
    complexityScore += 2;
  } else if (promptLength > 200 || wordCount > 50) {
    complexityScore += 1;
  }

  // Context richness scoring
  if (contextKeys > 3) {
    complexityScore += 1;
  }

  // Intent-based scoring
  if (hasComplexIntent) {
    complexityScore += 2;
  }

  // Keyword-based scoring
  if (hasComplexKeywords) {
    complexityScore += 1;
  }

  // Structured request scoring
  if (hasStructuredRequest) {
    complexityScore += 1;
  }

  // Long-form output requires more reasoning to structure properly
  if (isLongForm) {
    complexityScore += 1;
  }

  // GPT-5.2 reasoning effort mapping
  // Since prompt enhancement always needs reasoning, 'none' is never appropriate
  if (complexityScore >= 5) {
    return 'high';
  } else if (complexityScore >= 3) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Validates that the enhanced output meets all quality requirements
 * @param {string} output - The generated prompt output
 * @param {string} input - The original user input
 * @param {object} context - Optional context with tone/length preferences
 * @returns {{isValid: boolean, reasons: string[]}} - Validation result
 */
function validateEnhancedOutput(output, input, context = {}) {
  const reasons = [];
  const outputLower = output.toLowerCase();
  const inputLength = input.trim().length;
  const outputLength = output.trim().length;
  
  // Check 1: Output must be substantially longer than input
  // GPT-5.2 is less verbose by default; 2x is the minimum threshold
  // to confirm genuine enhancement vs. copy/restate
  const minExpectedLength = inputLength * 2;
  if (outputLength < minExpectedLength) {
    reasons.push(`Output length (${outputLength}) is less than 2x input length (${inputLength}). Expected at least ${minExpectedLength} characters.`);
  }
  
  // Check 2: Must have role/expertise section (check for multiple formats - XML or Markdown)
  const hasRole = outputLower.includes('<role>') ||
                  outputLower.includes('</role>') ||
                  outputLower.includes('**role') ||
                  outputLower.includes('role & expertise') ||
                  outputLower.includes('role:') ||
                  outputLower.includes('## role') ||
                  outputLower.includes('# role');
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
                         outputLower.includes('<guidelines>') ||
                         outputLower.includes('guidelines:') ||
                         (outputLower.includes('constraints') && outputLower.includes('•'));
  
  // Check 6: Must have reasoning process section
  const hasReasoning = outputLower.includes('<reasoning>') ||
                       outputLower.includes('</reasoning>') ||
                       outputLower.includes('**reasoning') ||
                       outputLower.includes('reasoning process') ||
                       outputLower.includes('chain-of-thought') ||
                       outputLower.includes('chain of thought') ||
                       outputLower.includes('## reasoning');
  
  // Check 7: Must have examples (few-shot learning) - more flexible check
  const hasExamples = outputLower.includes('<examples>') ||
                      outputLower.includes('</examples>') ||
                      outputLower.includes('**examples') ||
                      outputLower.includes('examples & few-shot') ||
                      outputLower.includes('few-shot learning') ||
                      outputLower.includes('example 1') ||
                      outputLower.includes('example:') ||
                      (outputLower.includes('example') && (outputLower.includes('example 2') || outputLower.includes('example 3') || outputLower.includes('pattern')));
  
  // Check 8: Must have output format section
  const hasOutputFormat = outputLower.includes('<output_format>') ||
                          outputLower.includes('</output_format>') ||
                          outputLower.includes('**output format') ||
                          outputLower.includes('output format & structure') ||
                          outputLower.includes('output structure') ||
                          outputLower.includes('format requirements') ||
                          outputLower.includes('## output format');
  
  // Check 9: Must have success criteria section
  const hasSuccessCriteria = outputLower.includes('<success_criteria>') ||
                             outputLower.includes('</success_criteria>') ||
                             outputLower.includes('**success criteria') ||
                             outputLower.includes('success criteria') ||
                             outputLower.includes('## success criteria');

  // Check 10: Must use structured formatting (XML tags OR Markdown headers) - more flexible
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

  // Require core sections but allow flexibility in supporting sections
  if (!hasContext && !hasConstraints && !hasReasoning && !hasExamples && !hasOutputFormat && !hasSuccessCriteria) {
    reasons.push('Missing supporting sections (context, constraints, reasoning, examples, or format guidance)');
  }
  
  // Check 11: Should not be just copying the input (check for substantial enhancement)
  const inputWords = input.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const exactCopies = inputWords.filter(word => {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
    return wordRegex.test(output);
  });
  const copyRatio = exactCopies.length / Math.max(inputWords.length, 1);
  if (copyRatio > 0.85 && outputLength < inputLength * 1.5) {
    reasons.push('Output appears to be mostly copying input without sufficient enhancement');
  }
  
  // Check 12: If context has tone/length, verify they're being used
  if (context && context.tone) {
    const tone = context.tone.toLowerCase();
    // Check if tone is mentioned or applied in the output
    const toneMentioned = outputLower.includes(tone) || 
                          (tone === 'professional' && (outputLower.includes('professional') || outputLower.includes('business'))) ||
                          (tone === 'casual' && (outputLower.includes('casual') || outputLower.includes('conversational') || outputLower.includes('friendly'))) ||
                          (tone === 'formal' && (outputLower.includes('formal') || outputLower.includes('formal'))) ||
                          (tone === 'academic' && (outputLower.includes('academic') || outputLower.includes('scholarly') || outputLower.includes('research'))) ||
                          (tone === 'technical' && (outputLower.includes('technical') || outputLower.includes('technical')));
    if (!toneMentioned) {
      reasons.push(`Tone preference (${context.tone}) is not being applied in the enhanced prompt`);
    }
  }
  
  if (context && context.length) {
    const length = context.length.toLowerCase();
    // Check if length is mentioned or applied (word counts, section counts, etc.)
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
    reasons: reasons
  };
}

// Enhanced prompt generation system prompt optimized for GPT-5.2
// Uses CTCO framework (Context → Task → Constraints → Output) per OpenAI's GPT-5.2 best practices
// Key changes from GPT-5.1: stripped personality padding, explicit negative constraints,
// structured XML scaffolding, reduced verbosity instructions, plan-then-execute pattern
const ENHANCED_PROMPT_SYSTEM = `<context>
You are a prompt transformation engine. You receive raw user requests and output structured, enhanced prompts formatted for AI consumption. You do not answer questions or provide information directly. You only produce prompt artifacts.

Input: A user's raw request plus optional preferences (tone, length).
Output: A structured prompt using XML tags that an AI system will execute.
</context>

<task>
Transform the user's request into a complete, structured prompt. Expand the request by adding: an appropriate expert role, relevant background context, explicit constraints, a step-by-step reasoning process, 1-3 few-shot examples, output format specifications, and measurable success criteria.
</task>

<constraints>
- Do not answer the user's question. Do not provide the information they requested. Only produce the enhanced prompt structure.
- Do not copy or restate the user's input verbatim as your output. Every section must add substance beyond the original request.
- Do not include filler phrases, meta-commentary about your process, or preamble. Output only the structured prompt.
- Do not use both XML and Markdown formats in the same output. Use XML tags exclusively.
- Output must contain substantially more detail than the input: added context, constraints, examples, and structure that were not present in the original.
- All constraints in the output must be specific and measurable (word counts, section counts, format requirements), not vague ("be thorough").
- Few-shot examples are required. Include 1-3 examples demonstrating the desired output pattern.

TONE HANDLING (apply across all sections):
- professional: formal language, industry terminology, business-appropriate
- casual: conversational, contractions, relatable analogies
- formal: precise, structured, no contractions, elevated vocabulary
- friendly: warm, inclusive, encouraging, accessible
- academic: scholarly, citation-aware, methodologically rigorous
- technical: specification-oriented, precise terminology, implementation-focused
- creative: expressive, metaphorical, narrative-driven

LENGTH HANDLING (calibrate section depth and word targets):
- short: 200-500 word output target, 2-3 sections, concise examples, minimal background
- medium: 500-1500 word output target, 3-5 sections, moderate examples, relevant background
- long: 1500-3000 word output target, 5-7 sections, detailed examples, comprehensive background
- comprehensive: 3000+ word output target, 7+ sections, extensive examples, thorough background
</constraints>

<output>
Produce the enhanced prompt using exactly this XML structure. Every tag is required:

<role>
[Domain expert with specific qualifications, experience level, and relevant specialization. Match the persona to the requested tone.]
</role>

<context>
[Background information, domain context, audience description, and situational details. Add information the user did not provide but that is necessary for quality output. Adjust depth based on length preference.]
</context>

<task>
[Expanded, specific task description. Break down what the user wants into clear deliverables. More detailed than the original request.]
</task>

<constraints>
[Bulleted list of specific, measurable constraints. Include word counts, format requirements, technical limits, scope boundaries. Add constraints the user did not specify but that improve output quality.]
</constraints>

<reasoning>
[Numbered step-by-step reasoning process the AI should follow. Domain-specific, not generic. Each step should reference concrete actions.]
</reasoning>

<examples>
[1-3 few-shot examples showing the desired output pattern, format, or style. Examples must demonstrate the requested tone and match the expected quality level.]
</examples>

<output_format>
[Specific structural requirements: sections with word count ranges, formatting rules (headings, lists, code blocks), ordering requirements.]
</output_format>

<success_criteria>
[Bulleted list of measurable criteria. Each criterion must be verifiable by reading the output. Include length targets, required elements, quality thresholds.]
</success_criteria>

<guidelines>
[Execution instructions: style rules, what to emphasize, what to avoid, domain-specific best practices. Apply tone preference here.]
</guidelines>

VALIDATION (verify before output):
- All 9 XML sections present and substantive
- Constraints are specific and measurable
- Examples are included
- Tone and length preferences are applied across sections
- Output adds substantial structure beyond the original input
</output>`;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check rate limit
  const rateLimitStatus = checkRateLimit(req);

  if (rateLimitStatus.isLimited) {
    return res.status(429).json({
      error: 'Monthly free request limit reached. Limit resets at the beginning of next month.',
      requestsLeft: 0,
      limit: rateLimitStatus.limit,
      resetAt: rateLimitStatus.resetAt
    });
  }

  try {
    const { prompt, context } = req.body;
    console.log('User input received:', prompt);
    console.log('Environment API Key:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
    
    if (!prompt) {
      throw new Error('No prompt provided in request body.');
    }

    let result;
    let useOpenAI = false;

    // Determine API key from environment or request header
    const headerApiKeyRaw = Array.isArray(req.headers['x-api-key']) ? req.headers['x-api-key'][0] : req.headers['x-api-key'];
    const headerApiKey = typeof headerApiKeyRaw === 'string' ? headerApiKeyRaw.trim() : undefined;

    const effectiveApiKey = process.env.OPENAI_API_KEY || headerApiKey;
    const apiKeySource = process.env.OPENAI_API_KEY ? 'environment' : headerApiKey ? 'header' : null;
    console.log('Effective API Key available:', effectiveApiKey ? 'Yes' : 'No');
    console.log('API Key source:', apiKeySource || 'none');
    console.log('API Key format check:', effectiveApiKey ? (effectiveApiKey.startsWith('sk-') ? 'Valid format (starts with sk-)' : 'Warning: API key does not start with sk-') : 'No key');

    if (apiKeySource === 'header' && (!effectiveApiKey || !effectiveApiKey.startsWith('sk-'))) {
      const invalidKeyError = new Error('Invalid API key format provided in X-API-Key header.');
      invalidKeyError.status = 400;
      throw invalidKeyError;
    }
    
    if (effectiveApiKey) {
      // Validate API key format
      if (!effectiveApiKey.startsWith('sk-')) {
        console.warn('API key format warning: Expected key to start with "sk-"');
      }
      
      // Initialize OpenAI with the available API key
      const openaiInstance = new OpenAI({ apiKey: effectiveApiKey });
      useOpenAI = true;
      console.log('Using OpenAI API for enhancement');
      
      try {
        // Determine reasoning effort based on complexity
        const reasoningEffort = determineReasoningEffort(prompt, context);
        console.log(`Determined reasoning effort: ${reasoningEffort} for prompt length: ${prompt.length}`);
        
        // Build user message using CTCO framework optimized for GPT-5.2
        // GPT-5.2 favors explicit, architectural prompting over conversational nuance
        const tone = context?.tone || 'professional';
        const length = context?.length || 'medium';

        const lengthSpec = {
          short: '200-500 word output target, 2-3 sections, concise examples',
          medium: '500-1500 word output target, 3-5 sections, moderate examples',
          long: '1500-3000 word output target, 5-7 sections, detailed examples',
          comprehensive: '3000+ word output target, 7+ sections, extensive examples'
        }[length] || '500-1500 word output target, 3-5 sections, moderate examples';

        let userMessage = `<request>
${prompt}
</request>

<preferences>
tone: ${tone}
length: ${length}
length_spec: ${lengthSpec}
</preferences>

Transform the request above into a structured prompt. Apply tone "${tone}" across all sections. Calibrate depth and word targets to "${length}" (${lengthSpec}). Output only the 9 required XML sections: role, context, task, constraints, reasoning, examples, output_format, success_criteria, guidelines.`;

        console.log('Attempting OpenAI API call with model: gpt-5.2');
        console.log('API Config:', {
          model: 'gpt-5.2',
          reasoning_effort: reasoningEffort,
          max_tokens: 3000,
          temperature: 0.4,
          system_message_length: ENHANCED_PROMPT_SYSTEM.length,
          user_message_length: userMessage.length
        });

        let completion;
        // GPT-5.2 config: lower temperature for disciplined output,
        // higher max_tokens since the model is more token-efficient,
        // reasoning_effort explicitly set (GPT-5.2 defaults to 'none')
        const apiConfig = {
          model: 'gpt-5.2',
          messages: [
            { role: 'system', content: ENHANCED_PROMPT_SYSTEM },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 3000,
          temperature: 0.4,
          reasoning_effort: reasoningEffort
        };

        // Model fallback chain: gpt-5.2 → gpt-5.1 → gpt-5.0 → gpt-4o
        const fallbackChain = [
          { model: 'gpt-5.2', supportsReasoning: true },
          { model: 'gpt-5.1', supportsReasoning: true },
          { model: 'gpt-5.0', supportsReasoning: true },
          { model: 'gpt-5.0', supportsReasoning: false },
          { model: 'gpt-4o', supportsReasoning: false }
        ];

        let lastError = null;
        for (const fallback of fallbackChain) {
          try {
            const config = {
              model: fallback.model,
              messages: apiConfig.messages,
              max_tokens: apiConfig.max_tokens,
              temperature: apiConfig.temperature
            };
            if (fallback.supportsReasoning) {
              config.reasoning_effort = reasoningEffort;
            }
            console.log(`Trying model: ${fallback.model} (reasoning: ${fallback.supportsReasoning})`);
            completion = await openaiInstance.chat.completions.create(config);
            console.log(`${fallback.model} call successful`);
            lastError = null;
            break;
          } catch (err) {
            console.log(`${fallback.model} failed: ${err.message}`);
            lastError = err;
          }
        }
        if (lastError) {
          console.error('All model fallbacks failed.');
          throw lastError;
        }
        
        result = completion.choices[0].message.content;
        console.log('OpenAI API call successful');
        
        // Comprehensive validation: Check if output is properly enhanced and structured
        const validationResult = validateEnhancedOutput(result, prompt, context);
        
        if (!validationResult.isValid) {
          console.log('Result validation failed:', validationResult.reasons);
          console.log('Retrying with explicit correction instructions');

          // GPT-5.2 retry: explicit negative constraints listing exactly what failed
          const retryMessage = `<validation_failures>
${validationResult.reasons.map(r => `- ${r}`).join('\n')}
</validation_failures>

<request>
${prompt}
</request>

<preferences>
tone: ${tone}
length: ${length}
length_spec: ${lengthSpec}
</preferences>

Your previous output failed validation. Fix the issues listed above. Output all 9 required XML sections: role, context, task, constraints, reasoning, examples, output_format, success_criteria, guidelines. Do not include preamble or commentary. Apply tone "${tone}" and length "${length}" throughout.`;

          // Retry with high reasoning effort through fallback chain
          const retryFallbacks = [
            { model: 'gpt-5.2', supportsReasoning: true },
            { model: 'gpt-5.1', supportsReasoning: true },
            { model: 'gpt-5.0', supportsReasoning: false },
            { model: 'gpt-4o', supportsReasoning: false }
          ];

          let retryError = null;
          for (const fb of retryFallbacks) {
            try {
              const retryConfig = {
                model: fb.model,
                messages: [
                  { role: 'system', content: ENHANCED_PROMPT_SYSTEM },
                  { role: 'user', content: retryMessage }
                ],
                max_tokens: 3000,
                temperature: 0.3
              };
              if (fb.supportsReasoning) {
                retryConfig.reasoning_effort = 'high';
              }
              console.log(`Retry with model: ${fb.model}`);
              const retryCompletion = await openaiInstance.chat.completions.create(retryConfig);
              result = retryCompletion.choices[0].message.content;
              console.log(`Retry successful with ${fb.model}`);
              retryError = null;
              break;
            } catch (err) {
              console.log(`Retry ${fb.model} failed: ${err.message}`);
              retryError = err;
            }
          }
          if (retryError) {
            console.error('All retry fallbacks failed.');
            // Keep the original result rather than throwing
          }
        }
      } catch (openaiError) {
        // Extract detailed error information
        const errorDetails = {
          message: openaiError.message,
          status: openaiError.status,
          code: openaiError.code,
          type: openaiError.type,
          response: openaiError.response?.data,
          statusText: openaiError.response?.statusText
        };
        
        console.error('OpenAI API Error Details:', errorDetails);
        
        // Check for specific error types
        let errorMessage = openaiError.message || 'Unknown error';
        let errorStatus = openaiError.status || 500;
        
        // Handle model not found errors
        if (errorDetails.code === 'model_not_found' || 
            errorDetails.message?.includes('model_not_found') ||
            errorDetails.message?.includes('does not exist') ||
            errorDetails.message?.includes('not found')) {
          errorMessage = `Model gpt-5.2/gpt-5.1 is not available. Please check your OpenAI account has access to these models. Original error: ${errorMessage}`;
          errorStatus = 404;
        }
        // Handle authentication errors
        else if (errorDetails.status === 401 || errorDetails.code === 'invalid_api_key') {
          errorMessage = 'Invalid API key. Please check your OPENAI_API_KEY environment variable or X-API-Key header.';
          errorStatus = 401;
        }
        // Handle rate limit errors
        else if (errorDetails.status === 429 || errorDetails.code === 'rate_limit_exceeded') {
          errorMessage = 'Rate limit exceeded. Please try again later.';
          errorStatus = 429;
        }
        // Handle invalid request errors
        else if (errorDetails.status === 400 || errorDetails.code === 'invalid_request_error') {
          errorMessage = `Invalid request: ${errorMessage}. This might indicate an issue with the API parameters.`;
          errorStatus = 400;
        }
        
        // Create error object with details
        const enhancedError = new Error(errorMessage);
        enhancedError.status = errorStatus;
        enhancedError.details = errorDetails;
        throw enhancedError;
      }
    } else {
      // No API key available, return error instead of local fallback
      throw new Error('AI enhancement service is not available. Provide OPENAI_API_KEY env or X-API-Key header.');
    }

    console.log('Final enhancement method used: OpenAI AI');

    // Increment usage counter
    incrementUsage(req);
    const stats = getUsageStats(req);

    res.json({
      result: result,
      requestsLeft: stats.remaining,
      limit: stats.limit,
      enhanced: true // Always true since we only use AI now
    });
  } catch (err) {
    console.error('Error in /api/generate:', err.stack || err);
    console.error('Error details:', {
      message: err.message,
      status: err.status,
      code: err.code,
      details: err.details
    });

    // Get current usage stats for error response
    const stats = getUsageStats(req);

    // Determine appropriate status code
    const statusCode = err.status || 503;
    
    // Return detailed error information for debugging
    const errorResponse = {
      error: err.message || 'AI enhancement service is temporarily unavailable. Please try again in a few moments.',
      requestsLeft: stats.remaining,
      limit: stats.limit,
      enhanced: false
    };

    // Include error details in development mode
    if (process.env.NODE_ENV !== 'production' && err.details) {
      errorResponse.errorDetails = err.details;
    }

    res.status(statusCode).json(errorResponse);
  }
}