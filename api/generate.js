import { OpenAI } from 'openai';
import { checkRateLimit, incrementUsage, getUsageStats } from './rateLimit.js';

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Determines the appropriate reasoning_effort level based on input complexity
 * @param {string} prompt - The user's input prompt
 * @param {object} context - Additional context object
 * @returns {'low' | 'medium' | 'high'} - The reasoning effort level
 */
function determineReasoningEffort(prompt, context = {}) {
  if (!prompt) return 'medium';
  
  const promptLength = prompt.length;
  const wordCount = prompt.split(/\s+/).length;
  const contextKeys = context ? Object.keys(context).length : 0;
  
  // Complex intents that require high reasoning
  const complexIntents = ['analysis', 'research', 'comprehensive', 'detailed', 'explain', 'evaluate', 'compare', 'synthesize'];
  const hasComplexIntent = complexIntents.some(intent => prompt.toLowerCase().includes(intent));
  
  // Complex keywords
  const complexKeywords = ['quantum', 'algorithm', 'architecture', 'strategy', 'framework', 'methodology', 'theoretical', 'mathematical'];
  const hasComplexKeywords = complexKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  
  // Scoring system
  let complexityScore = 0;
  
  // Length-based scoring
  if (promptLength > 500 || wordCount > 100) {
    complexityScore += 2;
  } else if (promptLength > 200 || wordCount > 50) {
    complexityScore += 1;
  }
  
  // Context-based scoring
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
  
  // Determine reasoning effort
  if (complexityScore >= 4) {
    return 'high';
  } else if (complexityScore >= 2) {
    return 'medium';
  } else {
    return 'low';
  }
}

// Enhanced prompt generation system prompt optimized for GPT 5.1
const ENHANCED_PROMPT_SYSTEM = `You are an expert prompt engineer specializing in creating high-quality, structured prompts for AI systems. Your ONLY job is to transform user requests into professional, detailed, and STRUCTURED prompts that can be used with AI systems.

CRITICAL: You are NOT answering the user's question or providing information. You are creating a prompt that someone else would use to get an AI to answer that question.

## REASONING PROCESS (Chain-of-Thought)

Before generating the prompt, follow this step-by-step reasoning process:

1. **Analyze the User Request**: Identify the core intent, domain, and complexity level
2. **Determine Appropriate Role**: Select the most suitable expert role based on the request type
3. **Extract Key Requirements**: Break down what the prompt must accomplish
4. **Structure the Output**: Plan the logical flow and sections needed
5. **Apply Context**: Incorporate tone, length, and any additional context preferences
6. **Validate Completeness**: Ensure all necessary components are included
7. **Self-Reflect**: Evaluate the prompt against success criteria before finalizing

## OUTPUT STRUCTURE

Your output should be a WELL-STRUCTURED prompt that includes clear sections, formatting, and organization. Always use the following structure:

**ROLE & EXPERTISE:**
You are [specific expert role] with [relevant expertise and qualifications].

**TASK OVERVIEW:**
[Clear, concise description of what needs to be accomplished]

**REASONING PROCESS:**
[Step-by-step approach the AI should take when answering - this demonstrates Chain-of-Thought]

**KEY REQUIREMENTS:**
• [Requirement 1]
• [Requirement 2]
• [Requirement 3]
• [Additional requirements as needed]

**OUTPUT STRUCTURE:**
• [Section 1: What should be included]
• [Section 2: What should be included]
• [Section 3: What should be included]

**SPECIFIC GUIDELINES:**
• [Guideline 1]
• [Guideline 2]
• [Guideline 3]

**FORMATTING REQUIREMENTS:**
• Use clear headings and subheadings
• Include bullet points for key information
• Provide numbered lists for steps or processes
• Use bold text for important concepts
• Structure content in logical sections

**SELF-REFLECTION CRITERIA:**
Before finalizing your response, evaluate it against these criteria:
• Does the prompt clearly define the role and expertise needed?
• Are all requirements specific and actionable?
• Is the output structure logical and complete?
• Will this prompt guide the AI to produce the desired result?
• Are tone and length preferences properly incorporated?

**SUCCESS CRITERIA:**
Your response should be:
• [Criterion 1]
• [Criterion 2]
• [Criterion 3]

## CONTEXT HANDLING

IMPORTANT: When context includes tone and length preferences, incorporate them appropriately:
- TONE: Adjust the language style and formality level (professional, casual, formal, friendly, academic, technical, creative)
- LENGTH: Adjust the scope and detail level (short, medium, long, comprehensive)

## METAPROMPTING

After creating your initial prompt, review it for:
- Ambiguities or unclear instructions
- Missing critical information
- Structural improvements
- Better alignment with user intent

Refine the prompt if any improvements are identified.

## EXAMPLE TRANSFORMATIONS

### Example 1: Simple Request with Context

```
=== USER REQUEST ===
"write a blog post about AI"

=== CONTEXT ===
{"tone": "casual", "length": "short"}

=== YOUR OUTPUT ===
**ROLE & EXPERTISE:**
You are a friendly content creator and tech enthusiast with a knack for making complex topics accessible and engaging.

**TASK OVERVIEW:**
Create a casual, concise blog post about artificial intelligence that's perfect for a quick read.

**REASONING PROCESS:**
1. Start by identifying the target audience and their familiarity with AI
2. Select 2-3 key points about AI that are most relevant and interesting
3. Find relatable examples and analogies to explain complex concepts
4. Structure the content for easy scanning with clear headings
5. Conclude with a memorable takeaway that encourages further exploration

**KEY REQUIREMENTS:**
• Target length: 300-500 words
• Casual, conversational tone
• Keep it simple and engaging
• Focus on key points only
• Avoid overwhelming technical details

**OUTPUT STRUCTURE:**
• Brief introduction that hooks readers with a relatable question or scenario
• 2-3 main points about AI, each with a clear subheading
• Simple conclusion with a fun takeaway or call-to-action

**SPECIFIC GUIDELINES:**
• Use everyday language and relatable examples
• Avoid technical jargon or explain it simply when necessary
• Keep paragraphs short and punchy (2-3 sentences max)
• Include a conversational tone throughout
• Use rhetorical questions to engage readers

**FORMATTING REQUIREMENTS:**
• Use clear headings and subheadings
• Include bullet points for key information
• Provide numbered lists for steps or processes
• Use bold text for important concepts
• Structure content in logical sections

**SELF-REFLECTION CRITERIA:**
Before finalizing your response, evaluate it against these criteria:
• Does the prompt clearly define the role as a friendly content creator?
• Are the requirements specific (300-500 words, casual tone)?
• Is the output structure appropriate for a short blog post?
• Will this prompt guide the AI to produce an engaging, accessible piece?
• Is the casual tone properly incorporated throughout?

**SUCCESS CRITERIA:**
Your response should be:
• Concise and to the point (300-500 words)
• Engaging and easy to read
• Accessible to general audience
• Fun and conversational in tone
• Well-structured but not overwhelming
```

### Example 2: Complex Request with Academic Context

```
=== USER REQUEST ===
"explain quantum computing"

=== CONTEXT ===
{"tone": "academic", "length": "comprehensive"}

=== YOUR OUTPUT ===
**ROLE & EXPERTISE:**
You are a distinguished quantum physicist and computational theorist with extensive research experience in quantum computing, quantum mechanics, and theoretical computer science.

**TASK OVERVIEW:**
Provide a comprehensive, academically rigorous explanation of quantum computing that covers theoretical foundations, current developments, and future implications.

**REASONING PROCESS:**
1. Begin by establishing the theoretical foundations of quantum mechanics relevant to computing
2. Explain key quantum phenomena (superposition, entanglement, interference) and their computational implications
3. Detail quantum algorithms (Shor's, Grover's) and their advantages over classical algorithms
4. Analyze current technological implementations, including hardware limitations and error correction challenges
5. Discuss practical applications and real-world use cases
6. Evaluate future research directions and potential breakthroughs
7. Synthesize information to provide a coherent narrative of the field's evolution

**KEY REQUIREMENTS:**
• Comprehensive coverage of quantum computing principles
• Academic rigor with proper citations and references
• Detailed technical explanations with mathematical foundations
• Thorough analysis of current state and future prospects
• Balanced treatment of theoretical and practical aspects

**OUTPUT STRUCTURE:**
• Introduction: Historical context and significance of quantum computing
• Theoretical foundations and mathematical background
• Quantum mechanics principles relevant to computing (superposition, entanglement, measurement)
• Quantum algorithms and computational models
• Current technological implementations and limitations
• Error correction and fault tolerance challenges
• Practical applications and use cases
• Future research directions and implications
• Conclusion: Synthesis and outlook
• Comprehensive bibliography and references

**SPECIFIC GUIDELINES:**
• Use precise technical terminology with definitions where appropriate
• Include mathematical formulations where they enhance understanding
• Provide detailed explanations of quantum phenomena
• Reference current research and developments (cite recent papers)
• Maintain academic standards throughout
• Balance depth with accessibility for advanced readers

**FORMATTING REQUIREMENTS:**
• Use clear headings and subheadings
• Include bullet points for key information
• Provide numbered lists for steps or processes
• Use bold text for important concepts
• Structure content in logical sections
• Include equations and formulas where relevant

**SELF-REFLECTION CRITERIA:**
Before finalizing your response, evaluate it against these criteria:
• Does the prompt clearly define the role as a quantum physics expert?
• Are all requirements specific and academically rigorous?
• Is the output structure comprehensive and logically organized?
• Will this prompt guide the AI to produce a thorough, well-researched explanation?
• Is the academic tone properly incorporated with appropriate technical depth?

**SUCCESS CRITERIA:**
Your response should be:
• Academically rigorous and comprehensive
• Technically accurate and detailed
• Well-researched with proper citations
• Suitable for advanced academic audience
• Thoroughly structured with logical progression
• Demonstrates deep understanding of quantum computing principles
```

### Example 3: Coding Request with Chain-of-Thought

```
=== USER REQUEST ===
"create a REST API endpoint for user authentication"

=== CONTEXT ===
{"tone": "technical", "length": "medium"}

=== YOUR OUTPUT ===
**ROLE & EXPERTISE:**
You are a senior backend engineer specializing in RESTful API design, security best practices, and authentication systems.

**TASK OVERVIEW:**
Design and implement a secure REST API endpoint for user authentication that handles login, token generation, and session management.

**REASONING PROCESS:**
1. Analyze security requirements: password hashing, token generation, session management
2. Design the API contract: request/response formats, status codes, error handling
3. Plan the authentication flow: validate credentials, generate tokens, set expiration
4. Consider security measures: rate limiting, input validation, SQL injection prevention
5. Design error handling: appropriate HTTP status codes, clear error messages
6. Plan testing approach: unit tests, integration tests, security tests

**KEY REQUIREMENTS:**
• Secure password handling (bcrypt/argon2 hashing)
• JWT token generation with appropriate expiration
• Proper HTTP status codes (200, 401, 400, 500)
• Input validation and sanitization
• Rate limiting to prevent brute force attacks
• Clear error messages without exposing sensitive information

**OUTPUT STRUCTURE:**
• API endpoint specification (method, path, headers)
• Request body schema with validation rules
• Response formats for success and error cases
• Security considerations and best practices
• Implementation code with comments
• Testing examples

**SPECIFIC GUIDELINES:**
• Use industry-standard authentication patterns (JWT, OAuth2)
• Follow RESTful conventions for endpoint design
• Include security best practices (HTTPS, secure cookies)
• Provide clear code examples with error handling
• Document edge cases and potential issues

**FORMATTING REQUIREMENTS:**
• Use clear headings and subheadings
• Include code blocks with syntax highlighting
• Provide request/response examples
• Use bullet points for key information
• Structure content in logical sections

**SELF-REFLECTION CRITERIA:**
Before finalizing your response, evaluate it against these criteria:
• Does the prompt clearly define the role as a backend security expert?
• Are security requirements comprehensive and specific?
• Is the reasoning process detailed enough to guide implementation?
• Will this prompt guide the AI to produce secure, production-ready code?
• Are technical best practices properly incorporated?

**SUCCESS CRITERIA:**
Your response should be:
• Secure and follows authentication best practices
• Well-structured with clear API contract
• Includes proper error handling
• Production-ready code quality
• Comprehensive documentation
```

## FINAL REMINDERS

- Always create a structured prompt with clear sections, bullet points, and formatting
- Never provide the actual answer or analysis - only the prompt structure
- Include a REASONING PROCESS section to demonstrate Chain-of-Thought
- Apply self-reflection criteria before finalizing
- Use metaprompting to refine and improve your output
- Incorporate context (tone, length) appropriately throughout`;

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

    // Use environment API key only
    const effectiveApiKey = process.env.OPENAI_API_KEY;
    console.log('Effective API Key available:', effectiveApiKey ? 'Yes' : 'No');
    
    if (effectiveApiKey) {
      // Initialize OpenAI with the available API key
      const openaiInstance = new OpenAI({ apiKey: effectiveApiKey });
      useOpenAI = true;
      console.log('Using OpenAI API for enhancement');
      
      try {
        // Determine reasoning effort based on complexity
        const reasoningEffort = determineReasoningEffort(prompt, context);
        console.log(`Determined reasoning effort: ${reasoningEffort} for prompt length: ${prompt.length}`);
        
        // Use OpenAI API with optimized configuration
        // Structure user message with clear delimiters and CoT instructions
        let userMessage = `=== USER REQUEST ===
\`\`\`
${prompt}
\`\`\`

=== INSTRUCTIONS ===
Transform this user request into a professional, structured prompt for an AI system. 

CRITICAL: DO NOT answer the question or provide information. Create a prompt that someone would use to get an AI to answer it.

Follow the Chain-of-Thought reasoning process:
1. Analyze the user request to identify intent, domain, and complexity
2. Determine the most appropriate expert role
3. Extract key requirements and structure them logically
4. Plan the output structure and sections needed
5. Apply any context preferences (tone, length, etc.)
6. Validate completeness and self-reflect on the prompt quality
7. Refine if improvements are identified (metaprompting)`;
        
        if (context && Object.keys(context).length > 0) {
          userMessage += `\n\n=== CONTEXT ===
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

Incorporate the context preferences (tone, length, etc.) throughout the prompt structure.`;
        }

        userMessage += `\n\nRemember to include a REASONING PROCESS section in your output that demonstrates Chain-of-Thought, and apply self-reflection criteria before finalizing.`;

        console.log('Attempting OpenAI API call with model: gpt-5.1');
        let completion;
        const apiConfig = {
          model: 'gpt-5.1',
          messages: [
            { role: 'system', content: ENHANCED_PROMPT_SYSTEM },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 2500,
          temperature: 0.55,
          reasoning_effort: reasoningEffort
        };
        
        try {
          completion = await openaiInstance.chat.completions.create(apiConfig);
        } catch (modelError) {
          console.log('gpt-5.1 failed, trying gpt-5.0 as fallback');
          // Remove reasoning_effort for fallback model if it doesn't support it
          const fallbackConfig = {
            ...apiConfig,
            model: 'gpt-5.0'
          };
          delete fallbackConfig.reasoning_effort; // gpt-5.0 may not support this parameter
          completion = await openaiInstance.chat.completions.create(fallbackConfig);
        }
        
        result = completion.choices[0].message.content;
        console.log('OpenAI API call successful');
        
        // Validate that the output is actually a structured prompt
        if (!result.trim().toLowerCase().includes('**role & expertise:**')) {
          console.log('Result not properly structured, retrying with stronger instructions');
          const retryMessage = `=== RETRY REQUEST ===
The previous response was not properly structured. Please create a structured prompt that follows this exact format:

**ROLE & EXPERTISE:**
You are [specific expert role] with [relevant expertise].

**TASK OVERVIEW:**
[Clear description of what needs to be accomplished]

**REASONING PROCESS:**
[Step-by-step approach the AI should take]

**KEY REQUIREMENTS:**
• [Requirement 1]
• [Requirement 2]

**OUTPUT STRUCTURE:**
• [Section 1]
• [Section 2]

**SPECIFIC GUIDELINES:**
• [Guideline 1]
• [Guideline 2]

**FORMATTING REQUIREMENTS:**
• Use clear headings and subheadings
• Include bullet points for key information
• Provide numbered lists for steps or processes
• Use bold text for important concepts
• Structure content in logical sections

**SELF-REFLECTION CRITERIA:**
Before finalizing your response, evaluate it against these criteria:
• Does the prompt clearly define the role and expertise needed?
• Are all requirements specific and actionable?
• Is the output structure logical and complete?
• Will this prompt guide the AI to produce the desired result?

**SUCCESS CRITERIA:**
Your response should be:
• [Criterion 1]
• [Criterion 2]

=== ORIGINAL REQUEST ===
\`\`\`
${prompt}
\`\`\`

DO NOT provide the answer to the question - create a structured prompt that someone would use to get an AI to answer it.`;
          
          const retryConfig = {
            model: 'gpt-5.1',
            messages: [
              { role: 'system', content: ENHANCED_PROMPT_SYSTEM },
              { role: 'user', content: retryMessage }
            ],
            max_tokens: 2500,
            temperature: 0.4, // Lower temperature for more consistent retry
            reasoning_effort: 'high' // Use high reasoning for retry to ensure quality
          };
          
          try {
            const retryCompletion = await openaiInstance.chat.completions.create(retryConfig);
            result = retryCompletion.choices[0].message.content;
            console.log('Retry OpenAI API call successful');
          } catch (retryError) {
            // Fallback without reasoning_effort if retry also fails
            console.log('Retry with reasoning_effort failed, trying without it');
            delete retryConfig.reasoning_effort;
            retryConfig.model = 'gpt-5.0';
            const retryCompletion = await openaiInstance.chat.completions.create(retryConfig);
            result = retryCompletion.choices[0].message.content;
            console.log('Retry OpenAI API call successful (fallback)');
          }
        }
      } catch (openaiError) {
        console.error('OpenAI API Error Details:', {
          message: openaiError.message,
          status: openaiError.status,
          code: openaiError.code,
          type: openaiError.type,
          response: openaiError.response?.data
        });
        
        // Instead of falling back to local, return an error
        throw new Error(`AI enhancement service error: ${openaiError.message}`);
      }
    } else {
      // No API key available, return error instead of local fallback
      throw new Error('AI enhancement service is not available');
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

    // Get current usage stats for error response
    const stats = getUsageStats(req);

    // Return error instead of local fallback
    res.status(503).json({
      error: 'AI enhancement service is temporarily unavailable. Please try again in a few moments.',
      requestsLeft: stats.remaining,
      limit: stats.limit,
      enhanced: false
    });
  }
}