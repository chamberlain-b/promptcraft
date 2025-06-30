import axios from 'axios';

class LLMService {
  constructor() {
    // No need for OpenAI client when using backend proxy
    this.isAvailable = true;
  }

  async generateEnhancedPrompt(userInput, context = {}) {
    try {
      const response = await axios.post('/api/generate', {
        prompt: userInput,
        context
      });
      return {
        output: response.data.result,
        requestsLeft: response.data.requestsLeft,
        limit: response.data.limit,
        error: null
      };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return {
          output: null,
          requestsLeft: error.response.data.requestsLeft,
          limit: error.response.data.limit,
          error: error.response.data.error || 'Monthly free request limit reached.'
        };
      }
      return {
        output: null,
        requestsLeft: null,
        limit: null,
        error: error.message || 'An error occurred.'
      };
    }
  }

  // Dummy intent analysis (can be improved or proxied via backend if needed)
  async analyzeIntent(userInput) {
    // ... keep your existing local intent analysis or proxy if needed ...
    return this.localIntentAnalysis(userInput);
  }

  localEnhancement(userInput, context = {}) {
    // Enhanced local prompt generation logic
    const lowerInput = userInput.toLowerCase();
    
    // Extract key information from input
    const intent = this.detectIntent(lowerInput);
    const requirements = this.extractRequirements(userInput);
    const constraints = this.generateConstraints(intent, requirements);
    const format = this.generateFormat(intent, requirements);
    
    return this.buildPrompt(userInput, intent, requirements, constraints, format, context);
  }

  localIntentAnalysis(userInput) {
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

  detectIntent(input) {
    const intents = {
      'writing': ['write', 'story', 'article', 'blog', 'content', 'essay', 'report'],
      'coding': ['code', 'program', 'script', 'debug', 'algorithm', 'function', 'api'],
      'analysis': ['analyze', 'explain', 'data', 'research', 'study', 'examine'],
      'communication': ['email', 'message', 'letter', 'proposal', 'presentation'],
      'planning': ['plan', 'organize', 'schedule', 'strategy', 'roadmap'],
      'education': ['teach', 'learn', 'tutorial', 'guide', 'explain', 'how to'],
      'creation': ['design', 'create', 'build', 'develop', 'invent'],
      'business': ['business', 'strategy', 'marketing', 'sales', 'startup'],
      'health': ['health', 'fitness', 'wellness', 'diet', 'exercise'],
      'travel': ['travel', 'trip', 'vacation', 'itinerary', 'destination'],
      'finance': ['finance', 'money', 'budget', 'investment', 'financial'],
      'legal': ['legal', 'law', 'contract', 'agreement', 'compliance'],
      'career': ['career', 'job', 'resume', 'interview', 'professional']
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        return intent;
      }
    }
    return 'general';
  }

  extractKeywords(input) {
    // Simple keyword extraction
    const words = input.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    return words.filter(word => 
      word.length > 2 && 
      !stopWords.has(word) && 
      /^[a-zA-Z]+$/.test(word)
    ).slice(0, 10);
  }

  extractContext(input) {
    // Extract context clues from input
    const context = {};
    
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

  extractRequirements(input) {
    const requirements = {};
    const lowerInput = input.toLowerCase();
    
    // Extract length requirements
    const lengthMatch = input.match(/(\d+)\s*(words?|pages?|lines?|paragraphs?)/i);
    if (lengthMatch) {
      requirements.length = {
        amount: parseInt(lengthMatch[1]),
        unit: lengthMatch[2]
      };
    }
    
    // Extract tone requirements
    const tones = ['professional', 'casual', 'formal', 'friendly', 'academic', 'technical', 'creative'];
    const foundTone = tones.find(tone => lowerInput.includes(tone));
    if (foundTone) {
      requirements.tone = foundTone;
    }
    
    // Extract format requirements
    const formats = ['bullet points', 'table', 'chart', 'list', 'paragraph', 'step-by-step'];
    const foundFormat = formats.find(format => lowerInput.includes(format));
    if (foundFormat) {
      requirements.format = foundFormat;
    }
    
    return requirements;
  }

  generateConstraints(intent, requirements) {
    const constraints = [];
    
    switch (intent) {
      case 'writing':
        if (!requirements.length) constraints.push('• Target length: 500-800 words');
        if (!requirements.tone) constraints.push('• Tone: Professional yet engaging');
        constraints.push('• Include engaging introduction and conclusion');
        constraints.push('• Use clear structure with headings');
        break;
      case 'coding':
        constraints.push('• Include comprehensive error handling');
        constraints.push('• Follow best practices and coding standards');
        constraints.push('• Provide detailed comments and documentation');
        constraints.push('• Include usage examples');
        break;
      case 'analysis':
        constraints.push('• Provide data-driven insights');
        constraints.push('• Include relevant statistics and trends');
        constraints.push('• Offer actionable recommendations');
        constraints.push('• Consider multiple perspectives');
        break;
      case 'planning':
        constraints.push('• Include specific timeframes');
        constraints.push('• Prioritize tasks by importance');
        constraints.push('• Consider resource constraints');
        constraints.push('• Provide actionable next steps');
        break;
      default:
        constraints.push('• Provide comprehensive, well-researched information');
        constraints.push('• Use clear, professional language');
        constraints.push('• Include relevant context and background');
        constraints.push('• Ensure accuracy and reliability');
    }
    
    return constraints;
  }

  generateFormat(intent, requirements) {
    if (requirements.format) {
      return `• Use ${requirements.format} format`;
    }
    
    switch (intent) {
      case 'writing':
        return '• Use clear headings and subheadings\n• Include engaging introduction and conclusion\n• Use paragraphs for readability\n• Incorporate relevant examples';
      case 'coding':
        return '• Provide complete, runnable code\n• Include detailed comments\n• Add usage examples\n• Explain the logic and approach';
      case 'analysis':
        return '• Use bullet points for key findings\n• Include numbered lists for steps\n• Provide clear section headers\n• Use tables or charts where appropriate';
      case 'planning':
        return '• Use checkboxes for actionable items\n• Include time estimates\n• Organize by priority levels\n• Provide clear deadlines';
      default:
        return '• Use clear, organized structure\n• Include relevant examples\n• Provide actionable insights\n• Use appropriate formatting for readability';
    }
  }

  buildPrompt(userInput, intent, requirements, constraints, format, context) {
    const role = this.getRole(intent);
    const contextInfo = this.getContextInfo(context);
    
    let prompt = `You are an expert ${role}. ${contextInfo}

**TASK:**
${userInput}

**REQUIREMENTS:**
${constraints.join('\n')}

**OUTPUT FORMAT:**
${format}

**ADDITIONAL GUIDELINES:**
• Provide comprehensive, well-researched information
• Use clear, professional language
• Include relevant context and background information
• Ensure accuracy and reliability of information
• Consider the user's level of expertise
• Provide actionable insights and next steps
• Format the response for easy reading and implementation

**SUCCESS CRITERIA:**
Your response should be:
• Comprehensive and thorough in addressing the request
• Well-structured with clear organization
• Actionable with specific next steps
• Professional yet accessible in tone
• Accurate and up-to-date with current information
• Practical and implementable

Please provide a detailed, structured response that addresses all aspects of the request.`;

    return prompt;
  }

  getRole(intent) {
    const roles = {
      'writing': 'content writer and storyteller',
      'coding': 'software engineer and technical mentor',
      'analysis': 'data analyst and research specialist',
      'communication': 'professional communication expert',
      'planning': 'productivity consultant and project manager',
      'education': 'experienced educator and subject matter expert',
      'creation': 'creative professional and design expert',
      'business': 'business strategist and consultant',
      'health': 'health and wellness expert',
      'travel': 'travel planner and destination expert',
      'finance': 'financial advisor and budgeting expert',
      'legal': 'legal consultant and document specialist',
      'career': 'career coach and professional development expert',
      'general': 'expert consultant and problem solver'
    };
    
    return roles[intent] || roles.general;
  }

  getContextInfo(context) {
    if (!context || Object.keys(context).length === 0) {
      return 'You are providing comprehensive, well-researched solutions to the user\'s request.';
    }
    
    let contextInfo = 'You are providing comprehensive, well-researched solutions with the following context: ';
    const contextParts = [];
    
    if (context.audience) contextParts.push(`target audience: ${context.audience}`);
    if (context.language) contextParts.push(`programming language: ${context.language}`);
    if (context.topic) contextParts.push(`topic focus: ${context.topic}`);
    
    return contextInfo + contextParts.join(', ') + '.';
  }
}

export default new LLMService(); 