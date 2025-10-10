import { OpenAI } from 'openai';
import { checkRateLimit, incrementUsage, getUsageStats } from './rateLimit.js';

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Enhanced prompt generation system prompt
const ENHANCED_PROMPT_SYSTEM = `You are an expert prompt engineer. Your ONLY job is to transform user requests into professional, detailed, and STRUCTURED prompts that can be used with AI systems.

CRITICAL: You are NOT answering the user's question or providing information. You are creating a prompt that someone else would use to get an AI to answer that question.

Your output should be a WELL-STRUCTURED prompt that includes clear sections, formatting, and organization. Always use the following structure:

**ROLE & EXPERTISE:**
You are [specific expert role] with [relevant expertise and qualifications].

**TASK OVERVIEW:**
[Clear, concise description of what needs to be accomplished]

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

**SUCCESS CRITERIA:**
Your response should be:
• [Criterion 1]
• [Criterion 2]
• [Criterion 3]

IMPORTANT: When context includes tone and length preferences, incorporate them appropriately:
- TONE: Adjust the language style and formality level (professional, casual, formal, friendly, academic, technical, creative)
- LENGTH: Adjust the scope and detail level (short, medium, long, comprehensive)

Example transformations:

User input: "write a blog post about AI"
Context: {"tone": "casual", "length": "short"}
Your output: 
**ROLE & EXPERTISE:**
You are a friendly content creator and tech enthusiast with a knack for making complex topics accessible and engaging.

**TASK OVERVIEW:**
Create a casual, concise blog post about artificial intelligence that's perfect for a quick read.

**KEY REQUIREMENTS:**
• Target length: 300-500 words
• Casual, conversational tone
• Keep it simple and engaging
• Focus on key points only

**OUTPUT STRUCTURE:**
• Brief introduction that hooks readers
• 2-3 main points about AI
• Simple conclusion with a fun takeaway

**SPECIFIC GUIDELINES:**
• Use everyday language and relatable examples
• Avoid technical jargon
• Keep paragraphs short and punchy
• Include a conversational tone throughout

**FORMATTING REQUIREMENTS:**
• Use clear headings and subheadings
• Include bullet points for key information
• Provide numbered lists for steps or processes
• Use bold text for important concepts
• Structure content in logical sections

**SUCCESS CRITERIA:**
Your response should be:
• Concise and to the point
• Engaging and easy to read
• Accessible to general audience
• Fun and conversational in tone
• Well-structured but not overwhelming

User input: "explain quantum computing"
Context: {"tone": "academic", "length": "comprehensive"}
Your output:
**ROLE & EXPERTISE:**
You are a distinguished quantum physicist and computational theorist with extensive research experience in quantum computing, quantum mechanics, and theoretical computer science.

**TASK OVERVIEW:**
Provide a comprehensive, academically rigorous explanation of quantum computing that covers theoretical foundations, current developments, and future implications.

**KEY REQUIREMENTS:**
• Comprehensive coverage of quantum computing principles
• Academic rigor with proper citations and references
• Detailed technical explanations with mathematical foundations
• Thorough analysis of current state and future prospects

**OUTPUT STRUCTURE:**
• Theoretical foundations and mathematical background
• Quantum mechanics principles relevant to computing
• Quantum algorithms and computational models
• Current technological implementations and limitations
• Future research directions and implications
• Comprehensive bibliography and references

**SPECIFIC GUIDELINES:**
• Use precise technical terminology
• Include mathematical formulations where appropriate
• Provide detailed explanations of quantum phenomena
• Reference current research and developments
• Maintain academic standards throughout

**FORMATTING REQUIREMENTS:**
• Use clear headings and subheadings
• Include bullet points for key information
• Provide numbered lists for steps or processes
• Use bold text for important concepts
• Structure content in logical sections

**SUCCESS CRITERIA:**
Your response should be:
• Academically rigorous and comprehensive
• Technically accurate and detailed
• Well-researched with proper citations
• Suitable for advanced academic audience
• Thoroughly structured with logical progression

Remember: Always create a structured prompt with clear sections, bullet points, and formatting. Never provide the actual answer or analysis.`;

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
        // Use OpenAI API
        let userMessage = `Transform this user request into a professional prompt for an AI system. DO NOT answer the question - create a prompt that someone would use to get an AI to answer it:\n\n"${prompt}"`;
        
        if (context && Object.keys(context).length > 0) {
          userMessage += `\n\nAdditional context to consider:\n${JSON.stringify(context, null, 2)}`;
        }

        console.log('Attempting OpenAI API call with model: gpt-4o');
        let completion;
        try {
          completion = await openaiInstance.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: ENHANCED_PROMPT_SYSTEM },
              { role: 'user', content: userMessage }
            ],
            max_tokens: 1500,
            temperature: 0.7
          });
        } catch (modelError) {
          console.log('gpt-4o failed, trying gpt-4-turbo as fallback');
          completion = await openaiInstance.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
              { role: 'system', content: ENHANCED_PROMPT_SYSTEM },
              { role: 'user', content: userMessage }
            ],
            max_tokens: 1500,
            temperature: 0.7
          });
        }
        
        result = completion.choices[0].message.content;
        console.log('OpenAI API call successful');
        
        // Validate that the output is actually a structured prompt
        if (!result.trim().toLowerCase().includes('**role & expertise:**')) {
          console.log('Result not properly structured, retrying with stronger instructions');
          const retryMessage = `The previous response was not properly structured. Please create a structured prompt that follows this exact format:

**ROLE & EXPERTISE:**
You are [specific expert role] with [relevant expertise].

**TASK OVERVIEW:**
[Clear description of what needs to be accomplished]

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

**SUCCESS CRITERIA:**
Your response should be:
• [Criterion 1]
• [Criterion 2]

DO NOT provide the answer to the question - create a structured prompt that someone would use to get an AI to answer it.

Original request: "${prompt}"`;
          
          const retryCompletion = await openaiInstance.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: ENHANCED_PROMPT_SYSTEM },
              { role: 'user', content: retryMessage }
            ],
            max_tokens: 1500,
            temperature: 0.3
          });
          
          result = retryCompletion.choices[0].message.content;
          console.log('Retry OpenAI API call successful');
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