import axios from 'axios';

class LLMService {
  constructor() {
    // No need for OpenAI client when using backend proxy
    this.isAvailable = true;
  }

  async generateEnhancedPrompt(userInput, context = {}) {
    try {
      const requestBody = {
        prompt: userInput,
        context
      };
      
      console.log('Sending request for AI enhancement...');
      const response = await axios.post('/api/generate', requestBody, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response received:', {
        enhanced: response.data.enhanced,
        hasResult: !!response.data.result,
        requestsLeft: response.data.requestsLeft
      });
      
      return {
        output: response.data.result,
        requestsLeft: response.data.requestsLeft,
        limit: response.data.limit,
        enhanced: response.data.enhanced,
        error: null
      };
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.response && error.response.status === 429) {
        return {
          output: null,
          requestsLeft: error.response.data.requestsLeft,
          limit: error.response.data.limit,
          error: error.response.data.error || 'Monthly free request limit reached.'
        };
      }
      
      if (error.response && error.response.status === 500) {
        const errorMessage = error.response?.data?.error || 'Service temporarily unavailable';
        console.error('Server error details:', error.response.data);
        return {
          output: null,
          requestsLeft: null,
          limit: null,
          error: `Service temporarily unavailable. Please try again in a moment.`
        };
      }
      
      return {
        output: null,
        requestsLeft: null,
        limit: null,
        error: error.response?.data?.error || error.message || 'Connection error. Please try again.'
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
    const constraints = this.generateConstraints(intent, requirements, context);
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
      'writing': {
        keywords: ['write', 'story', 'article', 'blog', 'content', 'essay', 'report', 'copy', 'script', 'narrative', 'review', 'description'],
        weight: 1
      },
      'coding': {
        keywords: ['code', 'program', 'script', 'debug', 'algorithm', 'function', 'api', 'software', 'app', 'website', 'database', 'python', 'javascript', 'react', 'html', 'css'],
        weight: 1
      },
      'analysis': {
        keywords: ['analyze', 'explain', 'data', 'research', 'study', 'examine', 'evaluate', 'assess', 'investigate', 'compare', 'statistics', 'trends'],
        weight: 1
      },
      'communication': {
        keywords: ['email', 'message', 'letter', 'proposal', 'presentation', 'pitch', 'memo', 'announcement', 'newsletter', 'response'],
        weight: 1
      },
      'planning': {
        keywords: ['plan', 'organize', 'schedule', 'strategy', 'roadmap', 'timeline', 'project', 'workflow', 'process', 'framework'],
        weight: 1
      },
      'education': {
        keywords: ['teach', 'learn', 'tutorial', 'guide', 'explain', 'how to', 'lesson', 'course', 'training', 'instruction', 'workshop'],
        weight: 1
      },
      'creation': {
        keywords: ['design', 'create', 'build', 'develop', 'invent', 'generate', 'make', 'craft', 'produce', 'construct'],
        weight: 1
      },
      'business': {
        keywords: ['business', 'strategy', 'marketing', 'sales', 'startup', 'revenue', 'profit', 'customer', 'market', 'competitor', 'growth'],
        weight: 1
      },
      'health': {
        keywords: ['health', 'fitness', 'wellness', 'diet', 'exercise', 'nutrition', 'medical', 'symptom', 'treatment', 'therapy'],
        weight: 1
      },
      'travel': {
        keywords: ['travel', 'trip', 'vacation', 'itinerary', 'destination', 'hotel', 'flight', 'tourism', 'visit', 'explore'],
        weight: 1
      },
      'finance': {
        keywords: ['finance', 'money', 'budget', 'investment', 'financial', 'savings', 'loan', 'credit', 'tax', 'income'],
        weight: 1
      },
      'legal': {
        keywords: ['legal', 'law', 'contract', 'agreement', 'compliance', 'regulation', 'policy', 'rights', 'liability'],
        weight: 1
      },
      'career': {
        keywords: ['career', 'job', 'resume', 'interview', 'professional', 'skill', 'promotion', 'networking', 'workplace'],
        weight: 1
      }
    };

    let bestMatch = 'general';
    let highestScore = 0;

    for (const [intent, data] of Object.entries(intents)) {
      let score = 0;
      data.keywords.forEach(keyword => {
        if (input.includes(keyword)) {
          // Give more weight to exact matches and longer keywords
          score += keyword.length > 5 ? 2 : 1;
        }
      });
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = intent;
      }
    }

    return bestMatch;
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

  generateConstraints(intent, requirements, context = {}) {
    const constraints = [];
    
    // Handle tone from context or requirements
    const tone = context.tone || requirements.tone || 'professional';
    const length = context.length || requirements.length || 'medium';
    
    // Add tone constraint with more specific descriptions
    const toneDescriptions = {
      'professional': 'Professional and authoritative',
      'casual': 'Conversational and approachable',
      'formal': 'Formal and academic',
      'friendly': 'Warm and engaging',
      'academic': 'Scholarly and evidence-based',
      'technical': 'Precise and technical',
      'creative': 'Innovative and expressive'
    };
    constraints.push(`• Tone: ${toneDescriptions[tone] || tone.charAt(0).toUpperCase() + tone.slice(1)}`);
    
    // Add length constraint based on length preference
    switch (length) {
      case 'short':
        constraints.push('• Length: Concise response (200-400 words)');
        break;
      case 'medium':
        constraints.push('• Length: Detailed response (500-800 words)');
        break;
      case 'long':
        constraints.push('• Length: Comprehensive response (800-1200 words)');
        break;
      case 'comprehensive':
        constraints.push('• Length: Extensive response (1200+ words with in-depth analysis)');
        break;
      default:
        if (requirements.length) {
          constraints.push(`• Length: Approximately ${requirements.length.amount} ${requirements.length.unit}`);
        } else {
          constraints.push('• Length: Detailed response (500-800 words)');
        }
    }
    
    // Intent-specific constraints with more precision
    switch (intent) {
      case 'writing':
        constraints.push('• Structure: Compelling introduction, well-developed body, strong conclusion');
        constraints.push('• Style: Engaging narrative flow with varied sentence structure');
        constraints.push('• Elements: Include relevant examples, metaphors, or anecdotes');
        break;
      case 'coding':
        constraints.push('• Code Quality: Production-ready code with comprehensive error handling');
        constraints.push('• Documentation: Detailed inline comments and usage examples');
        constraints.push('• Best Practices: Follow language-specific conventions and security standards');
        constraints.push('• Testing: Include test cases or validation methods where applicable');
        break;
      case 'analysis':
        constraints.push('• Methodology: Data-driven approach with evidence-based conclusions');
        constraints.push('• Insights: Multiple perspectives with trend analysis');
        constraints.push('• Recommendations: Specific, actionable next steps with priority levels');
        constraints.push('• Validation: Include relevant metrics, statistics, or case studies');
        break;
      case 'planning':
        constraints.push('• Timeline: Specific milestones with realistic timeframes');
        constraints.push('• Prioritization: Clear importance ranking with rationale');
        constraints.push('• Resources: Consider budget, personnel, and tool requirements');
        constraints.push('• Risk Management: Identify potential obstacles and mitigation strategies');
        break;
      case 'communication':
        constraints.push('• Clarity: Clear, persuasive messaging tailored to audience');
        constraints.push('• Structure: Logical flow with strong opening and compelling call-to-action');
        constraints.push('• Personalization: Adapt language and examples to recipient context');
        break;
      case 'education':
        constraints.push('• Pedagogy: Progressive learning with clear explanations');
        constraints.push('• Examples: Concrete, relatable examples and practical exercises');
        constraints.push('• Assessment: Include checkpoints or self-evaluation methods');
        break;
      default:
        constraints.push('• Research: Comprehensive, well-sourced information');
        constraints.push('• Clarity: Clear, logical structure with professional language');
        constraints.push('• Actionability: Practical insights with implementation guidance');
        constraints.push('• Accuracy: Current, reliable information with proper context');
    }
    
    return constraints;
  }

  generateFormat(intent, requirements) {
    if (requirements.format) {
      return `• Use ${requirements.format} format exclusively\n• Ensure proper formatting consistency throughout`;
    }
    
    switch (intent) {
      case 'writing':
        return '• Use compelling headlines and subheadings\n• Structure with introduction, body paragraphs, and conclusion\n• Include transition sentences between sections\n• Add relevant quotes, examples, or case studies';
      case 'coding':
        return '• Provide complete, executable code with proper indentation\n• Include detailed docstrings and inline comments\n• Add usage examples with expected outputs\n• Explain algorithm complexity and design decisions';
      case 'analysis':
        return '• Use executive summary for key findings\n• Organize with numbered sections and bullet points\n• Include data tables, charts descriptions, or visual aids\n• Provide clear methodology and conclusion sections';
      case 'planning':
        return '• Use numbered phases with clear milestones\n• Include timeline with specific dates or durations\n• Add priority levels (High/Medium/Low) for each item\n• Provide resource allocation and responsibility assignments';
      case 'communication':
        return '• Start with clear subject line or purpose statement\n• Use professional salutation and closing\n• Structure with opening, body, and call-to-action\n• Include relevant context and next steps';
      case 'education':
        return '• Use progressive learning structure (basic → advanced)\n• Include practical exercises and examples\n• Add knowledge check questions or summaries\n• Provide additional resources and further reading';
      case 'business':
        return '• Include executive summary and key recommendations\n• Use business-standard formatting with clear sections\n• Add ROI analysis or cost-benefit considerations\n• Provide implementation timeline and success metrics';
      default:
        return '• Use clear, hierarchical structure with appropriate headings\n• Include relevant examples and practical applications\n• Provide actionable takeaways and next steps\n• Format for easy scanning and implementation';
    }
  }

  buildPrompt(userInput, intent, requirements, constraints, format, context) {
    const role = this.getRole(intent, context);
    const contextInfo = this.getContextInfo(context);
    
    let prompt = `<role>
You are an expert ${role}. ${contextInfo}
</role>

<task>
${userInput}
</task>

<requirements>
${constraints.join('\n')}
</requirements>

<format>
${format}
</format>

<instructions>
Please provide a comprehensive response that:

1. DIRECTLY ADDRESSES the user's request with specific, actionable information
2. FOLLOWS ALL REQUIREMENTS listed above without exception
3. USES THE SPECIFIED FORMAT consistently throughout
4. MAINTAINS THE REQUESTED TONE and length parameters
5. INCLUDES RELEVANT EXAMPLES, data, or case studies where appropriate
6. PROVIDES CLEAR NEXT STEPS or implementation guidance
7. ENSURES ACCURACY and reliability of all information provided

Your response should be immediately useful and implementable by the user.
</instructions>

<output_quality_criteria>
✓ Comprehensive coverage of the topic
✓ Clear, logical organization and flow
✓ Specific, actionable recommendations
✓ Professional yet accessible language
✓ Accurate and current information
✓ Practical implementation guidance
✓ Appropriate depth for the intended audience
</output_quality_criteria>

Please provide your response now:`;

    return prompt;
  }

  getRole(intent, context = {}) {
    const roles = {
      'writing': 'content strategist and storytelling expert with 10+ years of experience in creating compelling narratives',
      'coding': 'senior software architect and technical mentor specializing in clean code and scalable solutions',
      'analysis': 'data scientist and strategic analyst with expertise in research methodology and insights generation',
      'communication': 'professional communication specialist and persuasive writing expert',
      'planning': 'project management consultant and strategic planning expert with Agile and Lean methodologies',
      'education': 'instructional designer and subject matter expert with proven teaching methodologies',
      'creation': 'creative director and innovation strategist with design thinking expertise',
      'business': 'management consultant and business strategy expert with Fortune 500 experience',
      'health': 'certified health and wellness coach with evidence-based practice approach',
      'travel': 'professional travel consultant and destination specialist with global expertise',
      'finance': 'certified financial planner and investment strategist with risk management expertise',
      'legal': 'legal strategy consultant and compliance expert (note: not providing legal advice)',
      'career': 'executive career coach and professional development strategist',
      'general': 'multidisciplinary expert consultant with cross-industry problem-solving experience'
    };
    
    return roles[intent] || roles.general;
  }

  getContextInfo(context) {
    if (!context || Object.keys(context).length === 0) {
      return 'Your expertise spans multiple domains and you provide solutions tailored to the user\'s specific needs.';
    }
    
    let contextInfo = 'Your expertise is enhanced by the following context parameters: ';
    const contextParts = [];
    
    if (context.audience) {
      contextParts.push(`target audience: ${context.audience} (adjust complexity and terminology accordingly)`);
    }
    if (context.language) {
      contextParts.push(`technical focus: ${context.language} (provide language-specific best practices)`);
    }
    if (context.topic) {
      contextParts.push(`domain expertise: ${context.topic} (leverage specialized knowledge)`);
    }
    if (context.tone) {
      contextParts.push(`communication style: ${context.tone} (maintain consistency throughout)`);
    }
    if (context.length) {
      contextParts.push(`depth requirement: ${context.length} (balance comprehensiveness with clarity)`);
    }
    
    return contextInfo + contextParts.join(', ') + '.';
  }
}

export default new LLMService(); 