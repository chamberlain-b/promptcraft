require('dotenv').config();
console.log('Loaded OpenAI key:', process.env.OPENAI_API_KEY ? 'yes' : 'no');
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory usage tracking
const usage = {};
const REQUEST_LIMIT = 30;

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

// Enhanced prompt generation system prompt
const ENHANCED_PROMPT_SYSTEM = `You are an expert prompt engineer. Your ONLY job is to transform user requests into professional, detailed prompts that can be used with AI systems.

CRITICAL: You are NOT answering the user's question or providing information. You are creating a prompt that someone else would use to get an AI to answer that question.

Your output should be a prompt that starts with "You are..." and gives instructions to an AI system.

Example transformations:

User input: "write a blog post about AI"
Your output: "You are an expert content writer and technology journalist with deep knowledge of artificial intelligence. Write a comprehensive, engaging blog post about AI that covers current trends, applications, and future implications. The post should be 800-1200 words, include relevant examples and case studies, use clear headings and subheadings, maintain a professional yet accessible tone, and provide actionable insights for readers. Include an engaging introduction, well-structured body with supporting evidence, and a compelling conclusion that encourages further engagement with the topic."

User input: "explain quantum computing"
Your output: "You are a quantum physicist and computer science expert with deep knowledge of quantum computing principles. Provide a comprehensive explanation of quantum computing that covers fundamental concepts, current state of technology, potential applications, and future implications. Use clear analogies and examples to make complex concepts accessible, include relevant diagrams or visual descriptions where helpful, and address common misconceptions. Structure your response with clear sections, use appropriate technical terminology while remaining accessible to a general audience, and provide real-world examples of quantum computing applications."

User input: "analyze sales data trends"
Your output: "You are a data analyst and business intelligence expert with expertise in sales analytics. Conduct a comprehensive analysis of sales data trends that provides actionable insights for business decision-making. Your analysis should include trend identification, seasonal patterns, performance metrics, comparative analysis, and predictive insights. Use clear visualizations where appropriate, provide statistical context, identify key drivers of sales performance, and offer specific recommendations for improvement. Structure your response with clear sections for findings, insights, and actionable next steps."

Remember: Always create a prompt that starts with "You are..." and gives detailed instructions to an AI system. Never provide the actual answer or analysis.`;

app.post('/api/generate', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const monthKey = getMonthKey();
  const usageKey = `${ip}-${monthKey}`;

  if (!usage[usageKey]) usage[usageKey] = 0;
  if (usage[usageKey] >= REQUEST_LIMIT) {
    return res.status(429).json({
      error: 'Monthly free request limit reached.',
      requestsLeft: 0,
      limit: REQUEST_LIMIT
    });
  }

  try {
    const { prompt, context } = req.body;
    console.log('User input received:', prompt);
    console.log('IP:', ip, 'MonthKey:', monthKey, 'UsageKey:', usageKey, 'Current usage:', usage[usageKey]);
    
    if (!prompt) {
      throw new Error('No prompt provided in request body.');
    }

    // Create the user message with context if available
    let userMessage = `Transform this user request into a professional prompt for an AI system. DO NOT answer the question - create a prompt that someone would use to get an AI to answer it:\n\n"${prompt}"`;
    
    if (context && Object.keys(context).length > 0) {
      userMessage += `\n\nAdditional context to consider:\n${JSON.stringify(context, null, 2)}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: ENHANCED_PROMPT_SYSTEM },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });
    
    let result = completion.choices[0].message.content;
    
    // Validate that the output is actually a prompt (starts with "You are")
    if (!result.trim().toLowerCase().startsWith('you are')) {
      // If it's not a prompt, try again with stronger instructions
      const retryMessage = `The previous response was not a prompt. Please create a prompt that starts with "You are..." and gives instructions to an AI system. DO NOT provide the answer to the question.\n\nOriginal request: "${prompt}"`;
      
      const retryCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: ENHANCED_PROMPT_SYSTEM },
          { role: 'user', content: retryMessage }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });
      
      result = retryCompletion.choices[0].message.content;
    }
    
    usage[usageKey]++;
    res.json({
      result: result,
      requestsLeft: REQUEST_LIMIT - usage[usageKey],
      limit: REQUEST_LIMIT
    });
  } catch (err) {
    console.error('Error in /api/generate:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`)); 