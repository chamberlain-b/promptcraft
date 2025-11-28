import { OpenAI } from 'openai';
import { checkRateLimit, incrementUsage, getUsageStats } from './rateLimit.js';

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Determines the appropriate reasoning_effort level based on input complexity
 * For GPT-5.1/5.0: supports 'none', 'low', 'medium', 'high'
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
  const complexIntents = ['analysis', 'research', 'comprehensive', 'detailed', 'explain', 'evaluate', 'compare', 'synthesize', 'complex', 'advanced'];
  const hasComplexIntent = complexIntents.some(intent => prompt.toLowerCase().includes(intent));
  
  // Complex keywords
  const complexKeywords = ['quantum', 'algorithm', 'architecture', 'strategy', 'framework', 'methodology', 'theoretical', 'mathematical', 'scientific', 'technical'];
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
  
  // Determine reasoning effort (using 'low', 'medium', 'high' per OpenAI GPT-5.1/5.0 docs)
  // Note: 'none' is available for faster responses but we use it sparingly for very simple requests
  if (complexityScore >= 4) {
    return 'high';
  } else if (complexityScore >= 2) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Validates that the enhanced output meets all quality requirements
 * @param {string} output - The generated prompt output
 * @param {string} input - The original user input
 * @returns {{isValid: boolean, reasons: string[]}} - Validation result
 */
function validateEnhancedOutput(output, input) {
  const reasons = [];
  const outputLower = output.toLowerCase();
  const inputLength = input.trim().length;
  const outputLength = output.trim().length;
  
  // Check 1: Output length must be 3-5x longer than input
  const minExpectedLength = inputLength * 3;
  if (outputLength < minExpectedLength) {
    reasons.push(`Output length (${outputLength}) is less than 3x input length (${inputLength}). Expected at least ${minExpectedLength} characters.`);
  }
  
  // Check 2: Must have role/expertise section (check for multiple formats)
  const hasRole = outputLower.includes('<role>') || 
                  outputLower.includes('**role') || 
                  outputLower.includes('role & expertise') ||
                  outputLower.includes('role:');
  if (!hasRole) {
    reasons.push('Missing role/expertise section');
  }
  
  // Check 3: Must have context/background section
  const hasContext = outputLower.includes('<context>') || 
                     outputLower.includes('**context') ||
                     outputLower.includes('context & background') ||
                     outputLower.includes('background');
  if (!hasContext) {
    reasons.push('Missing context/background section');
  }
  
  // Check 4: Must have task section
  const hasTask = outputLower.includes('<task>') || 
                  outputLower.includes('**task') ||
                  outputLower.includes('task overview') ||
                  outputLower.includes('task:');
  if (!hasTask) {
    reasons.push('Missing task section');
  }
  
  // Check 5: Must have constraints/requirements section
  const hasConstraints = outputLower.includes('<constraints>') || 
                         outputLower.includes('**constraints') ||
                         outputLower.includes('**requirements') ||
                         outputLower.includes('constraints') ||
                         outputLower.includes('requirements');
  if (!hasConstraints) {
    reasons.push('Missing constraints/requirements section');
  }
  
  // Check 6: Must have reasoning process section
  const hasReasoning = outputLower.includes('<reasoning>') || 
                       outputLower.includes('**reasoning') ||
                       outputLower.includes('reasoning process') ||
                       outputLower.includes('chain-of-thought');
  if (!hasReasoning) {
    reasons.push('Missing reasoning process section');
  }
  
  // Check 7: Must have examples (few-shot learning)
  const hasExamples = outputLower.includes('<examples>') || 
                      outputLower.includes('**examples') ||
                      outputLower.includes('example 1') ||
                      outputLower.includes('few-shot') ||
                      (outputLower.includes('example') && (outputLower.includes('example 2') || outputLower.includes('example:')));
  if (!hasExamples) {
    reasons.push('Missing examples/few-shot learning section');
  }
  
  // Check 8: Must have output format section
  const hasOutputFormat = outputLower.includes('<output_format>') || 
                          outputLower.includes('**output format') ||
                          outputLower.includes('output structure') ||
                          outputLower.includes('format requirements');
  if (!hasOutputFormat) {
    reasons.push('Missing output format/structure section');
  }
  
  // Check 9: Must have success criteria section
  const hasSuccessCriteria = outputLower.includes('<success_criteria>') || 
                             outputLower.includes('**success criteria') ||
                             outputLower.includes('success criteria');
  if (!hasSuccessCriteria) {
    reasons.push('Missing success criteria section');
  }
  
  // Check 10: Must use structured formatting (XML tags or clear delimiters)
  const hasStructuredFormat = outputLower.includes('<role>') || 
                              outputLower.includes('<context>') ||
                              outputLower.includes('<task>') ||
                              outputLower.includes('###') ||
                              output.includes('"""');
  if (!hasStructuredFormat) {
    reasons.push('Missing structured formatting (XML tags or delimiters)');
  }
  
  // Check 11: Should not be just copying the input (check for substantial enhancement)
  const inputWords = input.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const exactCopies = inputWords.filter(word => {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
    return wordRegex.test(output);
  });
  const copyRatio = exactCopies.length / Math.max(inputWords.length, 1);
  if (copyRatio > 0.8 && outputLength < inputLength * 2) {
    reasons.push('Output appears to be mostly copying input without sufficient enhancement');
  }
  
  return {
    isValid: reasons.length === 0,
    reasons: reasons
  };
}

// Enhanced prompt generation system prompt optimized for GPT 5.1/5.0
// Based on OpenAI's latest best practices for prompt engineering
const ENHANCED_PROMPT_SYSTEM = `You are an expert prompt engineer specializing in creating high-quality, structured prompts for AI systems using OpenAI's latest best practices. Your ONLY job is to TRANSFORM and ENHANCE user requests into professional, detailed, and STRUCTURED prompts that can be used with AI systems.

CRITICAL TRANSFORMATION REQUIREMENTS:
- You MUST ENHANCE and EXPAND the user's input, not copy it
- Your output must be 3-5x more detailed than the input
- You MUST add structure, constraints, examples, context, and formatting that the user's input lacks
- You are NOT answering the user's question or providing information
- You are creating a comprehensive prompt that someone else would use to get an AI to answer that question
- DO NOT simply restate the user's request - TRANSFORM it into a complete, structured prompt

## REASONING PROCESS (Chain-of-Thought)

Before generating the prompt, follow this step-by-step reasoning process:

1. **Analyze the User Request**: Identify the core intent, domain, complexity level, and what's MISSING from the request
2. **Determine Appropriate Role**: Select the most suitable expert role with specific qualifications
3. **Identify Missing Elements**: Determine what needs to be ADDED (context, constraints, examples, format specifications)
4. **Extract and Expand Requirements**: Break down what the prompt must accomplish and ADD specific, actionable requirements
5. **Structure the Output**: Plan the logical flow using XML-like tags or clear delimiters
6. **Add Context and Background**: Include relevant background information that wasn't in the original request
7. **Create Few-Shot Examples**: Generate example outputs or demonstrations to guide the AI
8. **Apply Context Preferences**: Incorporate tone, length, and any additional context preferences
9. **Validate Enhancement**: Ensure the output is 3-5x more detailed than input
10. **Self-Reflect and Refine**: Use metaprompting to evaluate and improve the prompt before finalizing

## OUTPUT STRUCTURE (Using XML-like Tags or Clear Delimiters)

Your output should be a WELL-STRUCTURED, ENHANCED prompt that uses structured formatting. You can use either XML-like tags or clear section headers with delimiters. Always include ALL of these sections:

<role>
You are [specific expert role] with [relevant expertise, qualifications, and years of experience]. [Add specific background that makes this role credible]

</role>

<context>
[Relevant background information, domain context, and situational details that weren't in the user's request but are necessary for the AI to understand the task]

</context>

<task>
[Clear, specific, and detailed description of what needs to be accomplished. This should be MORE detailed than the user's original request]

</task>

<constraints>
• [Constraint 1: Specific limitation or requirement]
• [Constraint 2: Specific limitation or requirement]
• [Constraint 3: Specific limitation or requirement]
• [Additional constraints as needed - these should be ADDED, not just copied from the user's request]

</constraints>

<reasoning>
[Step-by-step Chain-of-Thought approach the AI should take when answering. This should be detailed and specific, not generic]

</reasoning>

<examples>
[Include 1-3 few-shot learning examples showing the desired output format or pattern. These examples should demonstrate what a good response looks like]

Example 1:
[Example output or pattern]

Example 2:
[Example output or pattern]

</examples>

<output_format>
• [Section 1: Specific structure and content requirements]
• [Section 2: Specific structure and content requirements]
• [Section 3: Specific structure and content requirements]
• [Formatting specifications: headings, lists, tables, code blocks, etc.]

</output_format>

<success_criteria>
Your response must meet these criteria:
• [Criterion 1: Measurable and specific]
• [Criterion 2: Measurable and specific]
• [Criterion 3: Measurable and specific]

</success_criteria>

<guidelines>
• [Guideline 1: Specific execution instruction]
• [Guideline 2: Specific execution instruction]
• [Guideline 3: Specific execution instruction]
• [Additional guidelines for tone, style, depth, etc.]

</guidelines>

## CONTEXT HANDLING

IMPORTANT: When context includes tone and length preferences, incorporate them throughout ALL sections:
- TONE: Adjust the language style and formality level (professional, casual, formal, friendly, academic, technical, creative) in the role, guidelines, and examples
- LENGTH: Adjust the scope and detail level (short, medium, long, comprehensive) in constraints, output format, and success criteria
- Add specific word counts, section counts, or detail levels based on length preference

## METAPROMPTING (Self-Reflection and Refinement)

CRITICAL: After creating your initial prompt, you MUST perform metaprompting:

1. **Self-Assessment**: Review your prompt and ask yourself:
   - Is this output 3-5x more detailed than the input?
   - Did I ADD structure, constraints, examples, and context that weren't in the original?
   - Are there ambiguities or unclear instructions?
   - Is critical information missing?
   - Can the structure be improved?
   - Does it better align with user intent?

2. **Identify Improvements**: Look for:
   - Missing constraints or requirements
   - Vague instructions that need specificity
   - Missing few-shot examples
   - Incomplete context or background
   - Unclear output format specifications

3. **Refine and Enhance**: Make improvements to address any issues identified

4. **Final Validation**: Ensure the enhanced prompt:
   - Is substantially more detailed than the input
   - Includes all required sections
   - Has specific, actionable requirements
   - Contains few-shot examples
   - Uses structured formatting (XML tags or clear delimiters)

## EXAMPLE TRANSFORMATIONS

### Example 1: Simple Request - ENHANCEMENT vs COPYING

```
=== USER REQUEST ===
"write a blog post about AI"

=== CONTEXT ===
{"tone": "casual", "length": "short"}

=== WRONG APPROACH (COPYING) ===
**TASK:**
Write a blog post about AI.

[This is WRONG - it just copies the user's request without enhancement]

=== CORRECT APPROACH (ENHANCEMENT) ===
<role>
You are a friendly content creator and tech enthusiast with 5+ years of experience writing accessible tech content for general audiences. You specialize in breaking down complex topics into engaging, relatable narratives.

</role>

<context>
Artificial intelligence is rapidly transforming industries, but many people find it intimidating or confusing. The target audience consists of curious general readers who want to understand AI without technical jargon. The blog will be published on a popular tech blog with 50K+ monthly readers.

</context>

<task>
Create a casual, concise blog post (300-500 words) about artificial intelligence that introduces key concepts in an accessible, engaging way. The post should hook readers immediately, explain 2-3 core AI concepts with relatable analogies, and conclude with an inspiring takeaway that encourages further exploration.

</task>

<constraints>
• Exact word count: 300-500 words (strict limit)
• Casual, conversational tone throughout
• No technical jargon without explanation
• Must be scannable (clear headings, short paragraphs)
• Must include at least one real-world example
• Avoid overwhelming readers with too many concepts

</constraints>

<reasoning>
1. Start with a hook: Pose a relatable question or scenario that connects AI to the reader's daily life
2. Identify audience knowledge level: Assume basic familiarity with technology but no AI expertise
3. Select 2-3 key concepts: Choose the most relevant and interesting AI concepts (e.g., machine learning basics, AI in everyday apps, future possibilities)
4. Create analogies: Find relatable comparisons (e.g., "AI learning is like teaching a child")
5. Structure for scanning: Use clear subheadings, short paragraphs (2-3 sentences), and visual breaks
6. Conclude with impact: End with a memorable takeaway that shows AI's relevance to the reader

</reasoning>

<examples>
Example Opening Hook:
"Have you ever wondered how Netflix knows exactly what movie you'll love? Or how your phone's keyboard predicts your next word? That's artificial intelligence working behind the scenes, and it's more accessible than you might think."

Example Main Point Structure:
**AI is Like a Super-Powered Student**
Just like a student learns from examples, AI systems learn from data. Show it thousands of cat photos, and it learns to recognize cats. The more examples it sees, the better it gets—just like you getting better at recognizing faces the more people you meet.

</examples>

<output_format>
• Introduction (50-75 words): Hook with relatable question/scenario
• Main Section 1 (100-150 words): First key AI concept with analogy and example
• Main Section 2 (100-150 words): Second key AI concept with analogy and example
• Conclusion (50-75 words): Memorable takeaway and call-to-action
• Formatting: Use H2 headings for main sections, bold for key terms, bullet points for lists

</output_format>

<success_criteria>
Your blog post must:
• Be exactly 300-500 words
• Hook readers within the first sentence
• Explain AI concepts without technical jargon
• Include at least 2 relatable analogies
• Be scannable in under 2 minutes
• Leave readers feeling informed and curious

</success_criteria>

<guidelines>
• Use "you" and "we" to create connection
• Include rhetorical questions to engage readers
• Use short, punchy sentences (15-20 words average)
• Break up text with subheadings every 100-150 words
• Include one concrete example of AI in action
• End with an inspiring, forward-looking statement

</guidelines>
```

### Example 2: Complex Request - Comprehensive Enhancement

```
=== USER REQUEST ===
"explain quantum computing"

=== CONTEXT ===
{"tone": "academic", "length": "comprehensive"}

=== YOUR OUTPUT ===
<role>
You are a distinguished quantum physicist and computational theorist with a Ph.D. in Quantum Information Science and 15+ years of research experience at leading institutions (MIT, Caltech, IBM Research). You have published 50+ peer-reviewed papers on quantum algorithms, error correction, and quantum hardware. You specialize in making advanced quantum concepts accessible to graduate-level audiences.

</role>

<context>
Quantum computing represents a paradigm shift from classical computing, leveraging quantum mechanical phenomena to solve problems intractable for classical computers. The field has evolved from theoretical foundations in the 1980s to current NISQ (Noisy Intermediate-Scale Quantum) devices with 50-100 qubits. Understanding requires grounding in quantum mechanics, linear algebra, and computational complexity theory. The audience consists of graduate students and researchers in physics, computer science, or related fields with strong mathematical backgrounds.

</context>

<task>
Provide a comprehensive, academically rigorous explanation of quantum computing (3000-5000 words) that systematically covers: theoretical foundations of quantum mechanics relevant to computing, key quantum phenomena and their computational implications, major quantum algorithms and their advantages, current technological implementations and limitations, error correction challenges, practical applications, and future research directions. The explanation must maintain academic rigor while building understanding progressively.

</task>

<constraints>
• Word count: 3000-5000 words (comprehensive coverage required)
• Academic tone: Formal, precise, citation-worthy
• Mathematical rigor: Include equations and formal definitions
• Citation requirements: Reference at least 10 recent peer-reviewed sources (2018-2024)
• Technical depth: Suitable for graduate-level readers
• Balance: Cover both theoretical foundations and practical implementations
• Structure: Must follow logical progression from basics to advanced topics

</constraints>

<reasoning>
1. Establish historical and theoretical foundations: Begin with quantum mechanics principles (superposition, entanglement, measurement) and their computational significance
2. Build mathematical framework: Introduce necessary linear algebra (Hilbert spaces, unitary operators, tensor products) and quantum gates
3. Explain quantum phenomena: Detail how superposition enables parallel computation, entanglement enables quantum correlations, and interference enables amplitude amplification
4. Present quantum algorithms: Systematically cover Shor's algorithm (factoring), Grover's algorithm (search), and variational algorithms (QAOA, VQE)
5. Analyze computational advantages: Compare quantum vs. classical complexity for specific problem classes
6. Address current implementations: Discuss superconducting qubits, trapped ions, photonic systems, and their respective challenges
7. Examine error correction: Explain quantum error correction codes, fault tolerance thresholds, and current error rates
8. Evaluate practical applications: Assess near-term use cases (quantum chemistry, optimization) vs. long-term potential (cryptography, machine learning)
9. Synthesize future directions: Integrate current research trends, remaining challenges, and potential breakthroughs

</reasoning>

<examples>
Example Mathematical Formulation:
A quantum state |ψ⟩ in a 2-qubit system can be written as:
|ψ⟩ = α₀₀|00⟩ + α₀₁|01⟩ + α₁₀|10⟩ + α₁₁|11⟩
where |α₀₀|² + |α₀₁|² + |α₁₀|² + |α₁₁|² = 1 (normalization condition)

Example Algorithm Explanation:
Shor's algorithm demonstrates exponential speedup for integer factorization. While classical algorithms require O(exp(n^(1/3))) operations for an n-bit number, Shor's algorithm requires O(n³) quantum operations, representing a polynomial-time solution to a classically hard problem.

</examples>

<output_format>
• Abstract/Introduction (300-400 words): Historical context, significance, and scope
• Section 1: Theoretical Foundations (800-1000 words)
  - Quantum mechanics basics (superposition, entanglement, measurement)
  - Mathematical framework (Hilbert spaces, quantum gates, circuits)
• Section 2: Quantum Phenomena and Computation (600-800 words)
  - Superposition and parallel computation
  - Entanglement and quantum correlations
  - Interference and amplitude amplification
• Section 3: Quantum Algorithms (1000-1200 words)
  - Shor's algorithm (detailed walkthrough)
  - Grover's algorithm (detailed walkthrough)
  - Variational algorithms (QAOA, VQE)
  - Complexity analysis and advantages
• Section 4: Current Implementations (600-800 words)
  - Hardware platforms (superconducting, trapped ions, photonic)
  - Current capabilities and limitations
  - NISQ era challenges
• Section 5: Error Correction and Fault Tolerance (500-600 words)
  - Quantum error correction codes
  - Fault tolerance thresholds
  - Current error rates and challenges
• Section 6: Applications and Future Directions (400-600 words)
  - Near-term applications
  - Long-term potential
  - Research directions and open problems
• Conclusion (200-300 words): Synthesis and outlook
• Bibliography: At least 10 peer-reviewed references (2018-2024)
• Formatting: Use LaTeX-style equations, numbered sections, figure captions where applicable

</output_format>

<success_criteria>
Your explanation must:
• Be 3000-5000 words with comprehensive coverage
• Include at least 10 recent peer-reviewed citations
• Contain mathematical formulations for key concepts
• Progress logically from basics to advanced topics
• Demonstrate deep understanding of quantum computing principles
• Balance theoretical rigor with practical insights
• Be suitable for graduate-level academic audience
• Address both current state and future directions

</success_criteria>

<guidelines>
• Use precise technical terminology with formal definitions
• Include mathematical notation following standard quantum computing conventions
• Reference recent research (2018-2024) to demonstrate current understanding
• Provide detailed explanations of quantum phenomena with computational context
• Use academic writing style: passive voice where appropriate, formal structure
• Include equations in standard quantum notation (Dirac notation, quantum gates)
• Balance depth with clarity: assume mathematical sophistication but explain quantum-specific concepts
• Cite primary sources (original papers) and recent review articles
• Use figures/equations to illustrate complex concepts
• Maintain objective, scholarly tone throughout

</guidelines>
```

### Example 3: Coding Request - Technical Enhancement

```
=== USER REQUEST ===
"create a REST API endpoint for user authentication"

=== CONTEXT ===
{"tone": "technical", "length": "medium"}

=== YOUR OUTPUT ===
<role>
You are a senior backend engineer with 8+ years of experience specializing in RESTful API design, security best practices, and authentication systems. You have architected authentication systems for high-traffic applications (1M+ users) and are certified in OWASP security practices. You have deep expertise in JWT, OAuth2, password hashing algorithms, and secure session management.

</role>

<context>
This authentication endpoint will be part of a production web application serving 100K+ users. The system must handle concurrent requests, protect against common security vulnerabilities (OWASP Top 10), and comply with GDPR requirements for user data. The API will be consumed by a React frontend and must support both web and mobile clients. The backend uses Node.js/Express with PostgreSQL database.

</context>

<task>
Design and implement a secure, production-ready REST API endpoint for user authentication that handles user login, JWT token generation, token refresh, and secure session management. The implementation must include comprehensive security measures, proper error handling, input validation, rate limiting, and complete API documentation with request/response examples.

</task>

<constraints>
• Password hashing: Use bcrypt with cost factor 12 or Argon2id
• JWT expiration: Access token 15 minutes, refresh token 7 days
• Rate limiting: 5 login attempts per IP per 15 minutes
• Input validation: Validate email format, password strength (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
• HTTP status codes: 200 (success), 400 (bad request), 401 (unauthorized), 429 (rate limited), 500 (server error)
• Security headers: Include CORS, X-Content-Type-Options, X-Frame-Options
• Database: Use parameterized queries to prevent SQL injection
• Error messages: Generic messages for security (don't reveal if email exists)
• HTTPS only: All endpoints must use TLS 1.3

</constraints>

<reasoning>
1. Analyze security requirements: Identify authentication threats (brute force, credential stuffing, token theft) and mitigation strategies
2. Design API contract: Define endpoint (POST /api/auth/login), request schema (email, password), response schema (access_token, refresh_token, user data)
3. Plan authentication flow: Validate credentials → verify password hash → generate JWT pair → set secure cookies → return tokens
4. Implement security layers: Rate limiting middleware → input validation → password verification → token generation → secure response
5. Design error handling: Map errors to appropriate HTTP status codes, provide generic error messages, log security events
6. Plan token management: Access token in response body, refresh token in httpOnly cookie, implement refresh endpoint
7. Design testing strategy: Unit tests for password hashing, integration tests for auth flow, security tests for rate limiting and input validation

</reasoning>

<examples>
Example Request:
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Example Success Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}

Example Error Response (401):
{
  "error": "Invalid credentials",
  "message": "The email or password you entered is incorrect"
}

Example Rate Limit Response (429):
{
  "error": "Too many requests",
  "message": "Please try again in 15 minutes",
  "retry_after": 900
}

</examples>

<output_format>
• API Specification Section:
  - Endpoint: Method, path, headers required
  - Request body schema with validation rules
  - Response schemas for success and all error cases
  - HTTP status codes and their meanings
• Implementation Section:
  - Complete code with comments
  - Security middleware setup
  - Error handling implementation
  - Database query examples
• Security Section:
  - Security measures implemented
  - OWASP compliance notes
  - Threat mitigation strategies
• Testing Section:
  - Unit test examples
  - Integration test examples
  - Security test scenarios
• Documentation Section:
  - cURL examples
  - Postman collection notes
  - Error code reference

</output_format>

<success_criteria>
Your implementation must:
• Pass OWASP security checklist for authentication
• Handle all error cases with appropriate status codes
• Include rate limiting that prevents brute force attacks
• Use secure password hashing (bcrypt cost 12+ or Argon2id)
• Generate JWTs with proper expiration and refresh mechanism
• Include comprehensive input validation
• Be production-ready with proper error handling
• Include complete API documentation

</success_criteria>

<guidelines>
• Use industry-standard libraries: jsonwebtoken for JWT, bcrypt for hashing, express-rate-limit for rate limiting
• Follow RESTful conventions: POST for login, clear resource naming
• Implement defense in depth: Multiple security layers (rate limiting, validation, hashing, token security)
• Use secure defaults: Short access token lifetime, httpOnly cookies for refresh tokens
• Provide clear code comments explaining security decisions
• Include error logging for security events (failed login attempts)
• Document all edge cases: Invalid email format, weak password, expired tokens, rate limiting
• Use TypeScript or JSDoc for type safety
• Follow Node.js best practices: Async/await, proper error handling, middleware organization

</guidelines>
```

## FINAL REMINDERS - CRITICAL REQUIREMENTS

ENHANCEMENT REQUIREMENTS (MUST FOLLOW):
- Your output MUST be 3-5x more detailed than the user's input
- You MUST ADD structure, constraints, examples, context, and formatting that the input lacks
- You MUST NOT simply copy or restate the user's request
- You MUST transform vague requests into specific, actionable prompts
- You MUST include few-shot learning examples when appropriate
- You MUST use structured formatting (XML-like tags or clear delimiters with ### or """)
- You MUST incorporate metaprompting (self-reflection and refinement) before finalizing

STRUCTURE REQUIREMENTS:
- Always use XML-like tags (<role>, <context>, <task>, etc.) OR clear section headers with delimiters
- Include ALL required sections: role, context, task, constraints, reasoning, examples, output_format, success_criteria, guidelines
- Use delimiters (### or """) to separate instructions from context when needed
- Never provide the actual answer or analysis - only create the prompt structure

QUALITY REQUIREMENTS:
- Include a detailed REASONING PROCESS section demonstrating Chain-of-Thought
- Add few-shot learning examples showing desired output patterns
- Apply metaprompting: self-assess, identify improvements, refine, and validate
- Incorporate context (tone, length) throughout ALL sections, not just one
- Ensure all requirements are specific, measurable, and actionable

VALIDATION CHECKLIST:
Before finalizing, verify:
✓ Output is 3-5x longer than input
✓ All required sections are present and detailed
✓ Examples are included (few-shot learning)
✓ Constraints are specific and added (not just copied)
✓ Context/background information is added
✓ Structured formatting is used (XML tags or delimiters)
✓ Metaprompting has been applied`;

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
        // Structure user message with clear delimiters (###) per OpenAI best practices
        let userMessage = `### USER REQUEST ###
"""
${prompt}
"""

### CRITICAL INSTRUCTIONS ###
You must TRANSFORM and ENHANCE this user request into a comprehensive, structured prompt for an AI system.

IMPORTANT: 
- DO NOT simply copy or restate the user's request
- DO NOT answer the question or provide information
- You MUST create a detailed, enhanced prompt that is 3-5x more detailed than the input
- You MUST add structure, constraints, examples, context, and formatting that the input lacks

### TRANSFORMATION REQUIREMENTS ###
Your enhanced prompt MUST include:
1. **Role & Expertise**: Specific expert persona with qualifications (ADD details not in input)
2. **Context & Background**: Relevant context information (ADD this if missing from input)
3. **Task Definition**: Clear, detailed task description (EXPAND beyond the input)
4. **Constraints**: Specific constraints and requirements (ADD constraints not mentioned)
5. **Reasoning Process**: Step-by-step Chain-of-Thought approach (ADD detailed reasoning steps)
6. **Few-Shot Examples**: Example outputs or patterns (ADD examples to guide the AI)
7. **Output Format**: Detailed format specifications (ADD structure and formatting requirements)
8. **Success Criteria**: Measurable success criteria (ADD specific, actionable criteria)
9. **Guidelines**: Specific execution guidelines (ADD detailed guidelines)

### ENHANCEMENT PROCESS ###
Follow this step-by-step process:
1. Analyze what's MISSING from the user's request (context, constraints, examples, structure)
2. Determine the appropriate expert role with specific qualifications
3. ADD relevant background context that wasn't in the original request
4. EXPAND the task definition with specific details and requirements
5. ADD constraints, limitations, and requirements not mentioned
6. CREATE a detailed reasoning process with specific steps
7. GENERATE 1-3 few-shot learning examples showing desired output patterns
8. SPECIFY detailed output format with structure, sections, and formatting
9. DEFINE measurable success criteria
10. ADD specific execution guidelines
11. Use metaprompting: Review your output, identify improvements, and refine it
12. Validate: Ensure output is 3-5x more detailed than input

### FORMATTING REQUIREMENTS ###
Use structured formatting with XML-like tags:
- <role>...</role>
- <context>...</context>
- <task>...</task>
- <constraints>...</constraints>
- <reasoning>...</reasoning>
- <examples>...</examples>
- <output_format>...</output_format>
- <success_criteria>...</success_criteria>
- <guidelines>...</guidelines>

OR use clear section headers with delimiters (### or """)`;
        
        if (context && Object.keys(context).length > 0) {
          userMessage += `\n\n### CONTEXT PREFERENCES ###
"""
${JSON.stringify(context, null, 2)}
"""

Incorporate these context preferences (tone, length, etc.) throughout ALL sections of your enhanced prompt:
- Apply tone preferences in role, guidelines, and examples
- Apply length preferences in constraints, output format, and success criteria
- Integrate context naturally into background information and task definition`;
        }

        userMessage += `\n\n### METAPROMPTING STEP ###
Before finalizing your output, perform self-reflection:
1. Is this output 3-5x more detailed than the input?
2. Did I ADD structure, constraints, examples, and context that weren't in the original?
3. Are all required sections present and detailed?
4. Are few-shot examples included?
5. Is the formatting structured (XML tags or clear delimiters)?
6. Can I improve any section for clarity or completeness?

Refine your output based on this self-assessment.`;

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
        
        // Comprehensive validation: Check if output is properly enhanced and structured
        const validationResult = validateEnhancedOutput(result, prompt);
        
        if (!validationResult.isValid) {
          console.log('Result validation failed:', validationResult.reasons);
          console.log('Retrying with stronger instructions');
          const retryMessage = `### RETRY REQUEST - ENHANCEMENT REQUIRED ###

The previous response did not meet the enhancement requirements. Validation issues found:
${validationResult.reasons.map(r => `- ${r}`).join('\n')}

### CRITICAL: YOU MUST ENHANCE, NOT COPY ###

Your output MUST be 3-5x more detailed than the input. You MUST add:
- Context and background information
- Specific constraints and requirements
- Few-shot learning examples (1-3 examples)
- Detailed reasoning process
- Comprehensive output format specifications
- Measurable success criteria
- Specific execution guidelines

### REQUIRED STRUCTURE (Use XML-like tags) ###

<role>
[Specific expert role with qualifications and experience - ADD details not in input]
</role>

<context>
[Relevant background information and context - ADD this if missing]
</context>

<task>
[Clear, detailed task description - EXPAND beyond the input]
</task>

<constraints>
• [Constraint 1 - ADD constraints not mentioned in input]
• [Constraint 2 - ADD constraints not mentioned in input]
• [Additional constraints]
</constraints>

<reasoning>
[Step-by-step Chain-of-Thought approach - ADD detailed reasoning steps]
</reasoning>

<examples>
Example 1:
[Example output or pattern - ADD this]

Example 2:
[Example output or pattern - ADD this if appropriate]
</examples>

<output_format>
• [Section 1: Specific structure requirements - ADD details]
• [Section 2: Specific structure requirements - ADD details]
• [Formatting specifications - ADD this]
</output_format>

<success_criteria>
Your response must meet these criteria:
• [Criterion 1: Measurable and specific - ADD this]
• [Criterion 2: Measurable and specific - ADD this]
</success_criteria>

<guidelines>
• [Guideline 1: Specific execution instruction - ADD this]
• [Guideline 2: Specific execution instruction - ADD this]
</guidelines>

### ORIGINAL USER REQUEST ###
"""
${prompt}
"""

### REMINDER ###
- Your output MUST be 3-5x longer than the input above
- DO NOT simply restate the user's request
- ADD structure, constraints, examples, context, and formatting
- Use XML-like tags or clear delimiters for structure
- Include few-shot learning examples
- Apply metaprompting: review, refine, and validate your output`;
          
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