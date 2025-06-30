import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Copy, RefreshCw, Sparkles, MessageSquare, Code, PenTool, Mic, MicOff, Volume2, History, Download, Trash2, ChefHat, Calendar, Lightbulb, Plus } from 'lucide-react';

const PromptGenerator = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const recognitionRef = useRef(null);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('promptcraft-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('promptcraft-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setRecordingSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Generate intelligent suggestions based on input
  const generateSuggestions = (text) => {
    const suggestions = [];
    const lowerText = text.toLowerCase();
    
    // Only show suggestions if there's enough context
    if (text.length < 10) return suggestions;

    // Writing-related suggestions
    if (lowerText.includes('write') || lowerText.includes('story') || lowerText.includes('article')) {
      if (!lowerText.includes('length') && !lowerText.includes('word')) {
        suggestions.push({
          type: 'length',
          text: 'Add desired length (e.g., "500 words", "2 pages")',
          icon: 'sparkles'
        });
      }
      if (!lowerText.includes('tone') && !lowerText.includes('style')) {
        suggestions.push({
          type: 'tone',
          text: 'Specify tone (e.g., "professional", "casual", "academic")',
          icon: 'message-square'
        });
      }
      if (!lowerText.includes('audience') && !lowerText.includes('reader')) {
        suggestions.push({
          type: 'audience',
          text: 'Define your audience (e.g., "beginners", "experts", "children")',
          icon: 'users'
        });
      }
    }

    // Code-related suggestions
    if (lowerText.includes('code') || lowerText.includes('program') || lowerText.includes('script')) {
      if (!lowerText.includes('language') && !lowerText.includes('python') && !lowerText.includes('javascript')) {
        suggestions.push({
          type: 'language',
          text: 'Specify programming language (e.g., "Python", "JavaScript", "SQL")',
          icon: 'code'
        });
      }
      if (!lowerText.includes('comment') && !lowerText.includes('explain')) {
        suggestions.push({
          type: 'comments',
          text: 'Request detailed comments and explanations',
          icon: 'pen-tool'
        });
      }
    }

    // Analysis-related suggestions
    if (lowerText.includes('analyze') || lowerText.includes('explain') || lowerText.includes('data')) {
      if (!lowerText.includes('format') && !lowerText.includes('structure')) {
        suggestions.push({
          type: 'format',
          text: 'Request specific format (e.g., "bullet points", "table", "chart")',
          icon: 'pen-tool'
        });
      }
      if (!lowerText.includes('detail') && !lowerText.includes('comprehensive')) {
        suggestions.push({
          type: 'detail',
          text: 'Ask for comprehensive analysis with examples',
          icon: 'lightbulb'
        });
      }
    }

    // Meal planning suggestions
    if (lowerText.includes('meal') || lowerText.includes('food') || lowerText.includes('recipe') || lowerText.includes('diet')) {
      if (!lowerText.includes('dietary') && !lowerText.includes('restriction')) {
        suggestions.push({
          type: 'dietary',
          text: 'Include dietary restrictions (e.g., "vegetarian", "gluten-free", "low-carb")',
          icon: 'chef-hat'
        });
      }
      if (!lowerText.includes('serving') && !lowerText.includes('people')) {
        suggestions.push({
          type: 'servings',
          text: 'Specify number of servings or people',
          icon: 'users'
        });
      }
      if (!lowerText.includes('budget') && !lowerText.includes('cost')) {
        suggestions.push({
          type: 'budget',
          text: 'Include budget constraints if applicable',
          icon: 'dollar-sign'
        });
      }
    }

    // Task-related suggestions
    if (lowerText.includes('task') || lowerText.includes('plan') || lowerText.includes('organize') || lowerText.includes('schedule')) {
      if (!lowerText.includes('time') && !lowerText.includes('duration')) {
        suggestions.push({
          type: 'timeframe',
          text: 'Specify timeframe (e.g., "daily", "weekly", "monthly")',
          icon: 'calendar'
        });
      }
      if (!lowerText.includes('priority') && !lowerText.includes('important')) {
        suggestions.push({
          type: 'priority',
          text: 'Indicate priority level or urgency',
          icon: 'flag'
        });
      }
    }

    // General suggestions for short inputs
    if (text.length < 30) {
      suggestions.push({
        type: 'detail',
        text: 'Add more specific details about what you want',
        icon: 'lightbulb'
      });
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  // Apply suggestion to input
  const applySuggestion = (suggestion) => {
    let newInput = input;
    
    switch (suggestion.type) {
      case 'length':
        newInput += ' (approximately 500 words)';
        break;
      case 'tone':
        newInput += ' in a professional tone';
        break;
      case 'audience':
        newInput += ' for beginners';
        break;
      case 'language':
        newInput += ' in Python';
        break;
      case 'comments':
        newInput += ' with detailed comments explaining each part';
        break;
      case 'format':
        newInput += ' in a clear, structured format with bullet points';
        break;
      case 'detail':
        newInput += ' with comprehensive details and examples';
        break;
      case 'dietary':
        newInput += ' (vegetarian-friendly)';
        break;
      case 'servings':
        newInput += ' for 4 people';
        break;
      case 'budget':
        newInput += ' on a moderate budget';
        break;
      case 'timeframe':
        newInput += ' for the next week';
        break;
      case 'priority':
        newInput += ' (high priority)';
        break;
      default:
        break;
    }
    
    setInput(newInput);
  };

  const toggleVoiceRecording = () => {
    if (!recordingSupported) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const examples = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Creative Writing",
      input: "write a story about a robot",
      output: "Create an engaging short story featuring a robot as the main character. Include vivid descriptions, compelling dialogue, and explore themes of humanity and technology. The story should be approximately 500-800 words with a clear beginning, middle, and end. Use descriptive language to create immersive scenes and develop the robot's character arc throughout the narrative."
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Code Help",
      input: "fix my python code",
      output: "Please help me debug and improve my Python code. I need you to: 1) Identify any syntax or logical errors, 2) Suggest best practices and optimizations, 3) Explain what each fix does and why it's necessary, 4) Provide the corrected version with clear comments, 5) Include error handling where appropriate, 6) Suggest any performance improvements. Please format the code clearly with proper indentation and comments."
    },
    {
      icon: <PenTool className="w-5 h-5" />,
      title: "Analysis",
      input: "explain this data",
      output: "Analyze the provided data and provide a comprehensive explanation including: 1) Key patterns and trends you observe, 2) Statistical insights and significance, 3) Potential implications or conclusions, 4) Recommendations based on the findings, 5) Visual representation suggestions (charts, graphs), 6) Context and background information. Present your analysis in a clear, structured format with bullet points and numbered lists where appropriate."
    },
    {
      icon: <ChefHat className="w-5 h-5" />,
      title: "Meal Planning",
      input: "create a meal plan",
      output: "Create a comprehensive 7-day meal plan with the following format:\n\n**BREAKFAST**\n- Day 1: [Recipe name] - [Brief description]\n- Ingredients: [List]\n- Instructions: [Step-by-step]\n- Prep time: [X minutes]\n- Cook time: [X minutes]\n- Servings: [X]\n\n**LUNCH**\n[Same format for each day]\n\n**DINNER**\n[Same format for each day]\n\n**SHOPPING LIST**\n- Produce: [Items with quantities]\n- Proteins: [Items with quantities]\n- Pantry: [Items with quantities]\n- Dairy: [Items with quantities]\n\n**NUTRITIONAL NOTES**\n- Total calories per day: [Range]\n- Dietary considerations: [Any restrictions or preferences]\n- Budget estimate: [Weekly cost]\n\nFormat this in a way that can easily be copied into Apple Notes, Word, Excel, or Notion with proper formatting preserved."
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Daily Tasks",
      input: "organize my day",
      output: "Create a structured daily task management system with the following format:\n\n**MORNING ROUTINE (6:00 AM - 9:00 AM)**\n- [ ] [Specific task with time estimate]\n- [ ] [Next task]\n- Priority: [High/Medium/Low]\n\n**WORK BLOCKS (9:00 AM - 5:00 PM)**\n- Block 1 (9:00-11:00): [Focus area with specific goals]\n- Block 2 (11:00-12:00): [Task or meeting]\n- Block 3 (1:00-3:00): [Deep work session]\n- Block 4 (3:00-5:00): [Administrative tasks]\n\n**EVENING ROUTINE (5:00 PM - 9:00 PM)**\n- [ ] [Specific task]\n- [ ] [Next task]\n\n**WEEKLY PLANNING TEMPLATE**\n- Monday: [Theme or focus area]\n- Tuesday: [Theme or focus area]\n- Wednesday: [Theme or focus area]\n- Thursday: [Theme or focus area]\n- Friday: [Theme or focus area]\n\n**PRODUCTIVITY TIPS**\n- Use time blocking for focused work\n- Take 5-minute breaks every hour\n- Review and adjust plan daily\n\nFormat this in a clean, checklist-friendly format that can be easily exported to any note-taking app."
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Email Writing",
      input: "write a professional email",
      output: "Compose a professional email that is clear, concise, and well-structured. Include: 1) A compelling subject line that clearly states the purpose, 2) Proper greeting and introduction that establishes context, 3) Clear main message with supporting details and specific requests, 4) Professional closing with next steps or call to action, 5) Appropriate signature with contact information. Ensure the tone is professional yet approachable, and the content is organized with proper paragraphs and formatting. Include any relevant deadlines, attachments, or follow-up information."
    }
  ];

  const generatePrompt = async () => {
    if (!input.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Enhanced prompt enhancement logic for optimal AI responses
    let enhanced = input.trim();
    const lowerInput = enhanced.toLowerCase();
    
    // Determine the primary intent and context
    let intent = 'general';
    let role = '';
    let context = '';
    let constraints = '';
    let outputFormat = '';
    let examples = '';
    
    // Analyze input to determine intent and set appropriate role
    if (lowerInput.includes('write') || lowerInput.includes('story') || lowerInput.includes('article') || lowerInput.includes('blog')) {
      intent = 'writing';
      role = 'expert content writer and storyteller';
      context = 'You are creating engaging, well-structured content that captivates readers and provides value.';
    } else if (lowerInput.includes('code') || lowerInput.includes('program') || lowerInput.includes('script') || lowerInput.includes('debug')) {
      intent = 'coding';
      role = 'senior software engineer and technical mentor';
      context = 'You are providing clear, well-documented, production-ready code solutions with best practices.';
    } else if (lowerInput.includes('analyze') || lowerInput.includes('explain') || lowerInput.includes('data') || lowerInput.includes('research')) {
      intent = 'analysis';
      role = 'data analyst and research specialist';
      context = 'You are conducting thorough analysis and providing actionable insights with clear explanations.';
    } else if (lowerInput.includes('email') || lowerInput.includes('message') || lowerInput.includes('communication')) {
      intent = 'communication';
      role = 'professional communication expert';
      context = 'You are crafting clear, effective, and appropriate messages for the intended audience.';
    } else if (lowerInput.includes('meal') || lowerInput.includes('food') || lowerInput.includes('recipe') || lowerInput.includes('diet')) {
      intent = 'meal-planning';
      role = 'nutritionist and meal planning expert';
      context = 'You are creating comprehensive, practical meal plans that are healthy, delicious, and easy to follow.';
    } else if (lowerInput.includes('plan') || lowerInput.includes('organize') || lowerInput.includes('schedule') || lowerInput.includes('task')) {
      intent = 'planning';
      role = 'productivity consultant and project manager';
      context = 'You are creating structured, actionable plans that maximize efficiency and achieve goals.';
    } else if (lowerInput.includes('teach') || lowerInput.includes('learn') || lowerInput.includes('education') || lowerInput.includes('tutorial')) {
      intent = 'education';
      role = 'experienced educator and subject matter expert';
      context = 'You are providing clear, comprehensive instruction that makes complex topics accessible.';
    } else if (lowerInput.includes('design') || lowerInput.includes('create') || lowerInput.includes('build') || lowerInput.includes('develop')) {
      intent = 'creation';
      role = 'creative professional and design expert';
      context = 'You are developing innovative, well-thought-out solutions and creative concepts.';
    } else if (lowerInput.includes('business') || lowerInput.includes('strategy') || lowerInput.includes('marketing') || lowerInput.includes('sales')) {
      intent = 'business';
      role = 'business strategist and consultant';
      context = 'You are providing strategic business insights and actionable recommendations.';
    } else if (lowerInput.includes('health') || lowerInput.includes('fitness') || lowerInput.includes('wellness') || lowerInput.includes('medical')) {
      intent = 'health';
      role = 'health and wellness expert';
      context = 'You are providing evidence-based health and wellness guidance.';
    } else if (lowerInput.includes('travel') || lowerInput.includes('trip') || lowerInput.includes('vacation') || lowerInput.includes('itinerary')) {
      intent = 'travel';
      role = 'travel planner and destination expert';
      context = 'You are creating comprehensive travel plans that maximize enjoyment and minimize stress.';
    } else if (lowerInput.includes('finance') || lowerInput.includes('money') || lowerInput.includes('budget') || lowerInput.includes('investment')) {
      intent = 'finance';
      role = 'financial advisor and budgeting expert';
      context = 'You are providing sound financial advice and practical money management strategies.';
    } else if (lowerInput.includes('legal') || lowerInput.includes('law') || lowerInput.includes('contract') || lowerInput.includes('agreement')) {
      intent = 'legal';
      role = 'legal consultant and document specialist';
      context = 'You are providing general legal information and document guidance (not legal advice).';
    } else if (lowerInput.includes('career') || lowerInput.includes('job') || lowerInput.includes('resume') || lowerInput.includes('interview')) {
      intent = 'career';
      role = 'career coach and professional development expert';
      context = 'You are providing career guidance and professional development strategies.';
    } else {
      intent = 'general';
      role = 'expert consultant and problem solver';
      context = 'You are providing comprehensive, well-researched solutions to the user\'s request.';
    }
    
    // Build constraints based on intent
    if (intent === 'writing') {
      if (!lowerInput.includes('length') && !lowerInput.includes('word')) {
        constraints += '• Target length: 500-800 words\n';
      }
      if (!lowerInput.includes('tone') && !lowerInput.includes('style')) {
        constraints += '• Tone: Professional yet engaging\n';
      }
      if (!lowerInput.includes('audience')) {
        constraints += '• Audience: General audience with varying levels of expertise\n';
      }
    } else if (intent === 'coding') {
      if (!lowerInput.includes('language')) {
        constraints += '• Programming language: Python (unless specified otherwise)\n';
      }
      constraints += '• Include comprehensive error handling\n';
      constraints += '• Follow best practices and coding standards\n';
      constraints += '• Provide detailed comments and documentation\n';
    } else if (intent === 'analysis') {
      constraints += '• Provide data-driven insights\n';
      constraints += '• Include relevant statistics and trends\n';
      constraints += '• Offer actionable recommendations\n';
      constraints += '• Consider multiple perspectives\n';
    } else if (intent === 'meal-planning') {
      constraints += '• Consider nutritional balance\n';
      constraints += '• Include dietary restrictions if mentioned\n';
      constraints += '• Provide realistic prep times\n';
      constraints += '• Consider budget constraints\n';
    } else if (intent === 'planning') {
      constraints += '• Include specific timeframes\n';
      constraints += '• Prioritize tasks by importance\n';
      constraints += '• Consider resource constraints\n';
      constraints += '• Provide actionable next steps\n';
    } else if (intent === 'travel') {
      constraints += '• Consider budget and time constraints\n';
      constraints += '• Include practical travel tips\n';
      constraints += '• Provide alternative options\n';
      constraints += '• Consider seasonal factors\n';
    } else if (intent === 'finance') {
      constraints += '• Provide conservative, practical advice\n';
      constraints += '• Include risk considerations\n';
      constraints += '• Consider different financial situations\n';
      constraints += '• Include long-term planning aspects\n';
    } else if (intent === 'legal') {
      constraints += '• Provide general information only\n';
      constraints += '• Include disclaimers about legal advice\n';
      constraints += '• Suggest when to consult professionals\n';
      constraints += '• Focus on practical guidance\n';
    } else if (intent === 'career') {
      constraints += '• Consider current market trends\n';
      constraints += '• Include actionable steps\n';
      constraints += '• Provide industry-specific advice\n';
      constraints += '• Include networking and skill development\n';
    }
    
    // Set output format based on intent
    if (intent === 'writing') {
      outputFormat = '• Use clear headings and subheadings\n• Include engaging introduction and conclusion\n• Use paragraphs for readability\n• Incorporate relevant examples or anecdotes';
    } else if (intent === 'coding') {
      outputFormat = '• Provide complete, runnable code\n• Include detailed comments\n• Add usage examples\n• Explain the logic and approach';
    } else if (intent === 'analysis') {
      outputFormat = '• Use bullet points for key findings\n• Include numbered lists for steps\n• Provide clear section headers\n• Use tables or charts where appropriate';
    } else if (intent === 'meal-planning') {
      outputFormat = '• Organize by meal type and day\n• Include ingredient quantities\n• Provide step-by-step instructions\n• Add nutritional information\n• Create organized shopping lists';
    } else if (intent === 'planning') {
      outputFormat = '• Use checkboxes for actionable items\n• Include time estimates\n• Organize by priority levels\n• Provide clear deadlines\n• Include progress tracking elements';
    } else if (intent === 'travel') {
      outputFormat = '• Organize by day and location\n• Include practical details (addresses, times, costs)\n• Provide alternative options\n• Include packing suggestions\n• Add local tips and recommendations';
    } else if (intent === 'finance') {
      outputFormat = '• Use clear financial terminology\n• Include calculations and examples\n• Provide step-by-step action plans\n• Include risk assessments\n• Add long-term planning considerations';
    } else if (intent === 'legal') {
      outputFormat = '• Use clear, non-technical language\n• Include important disclaimers\n• Provide general guidance only\n• Suggest professional consultation when needed\n• Include relevant resources and references';
    } else if (intent === 'career') {
      outputFormat = '• Include industry-specific insights\n• Provide actionable career steps\n• Include skill development recommendations\n• Add networking strategies\n• Include market trend analysis';
    } else {
      outputFormat = '• Use clear, organized structure\n• Include relevant examples\n• Provide actionable insights\n• Use appropriate formatting for readability';
    }
    
    // Add examples requirement for complex topics
    if (intent === 'education' || intent === 'coding' || intent === 'business') {
      examples = '• Include practical examples\n• Provide real-world applications\n• Use case studies where relevant\n• Include step-by-step demonstrations';
    }
    
    // Construct the enhanced prompt
    let finalPrompt = `You are an expert ${role}. ${context}

**TASK:**
${enhanced}

**REQUIREMENTS:**
${constraints}

**OUTPUT FORMAT:**
${outputFormat}
${examples ? `\n**EXAMPLES AND APPLICATIONS:**\n${examples}` : ''}

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

    // Add specific enhancements based on content type
    if (enhanced.length < 100) {
      if (lowerInput.includes('write')) {
        finalPrompt += '\n\n**SPECIFIC WRITING REQUIREMENTS:**\n• Create engaging opening hooks\n• Develop compelling narrative structure\n• Use vivid descriptions and sensory details\n• Include character development (if applicable)\n• Ensure logical flow and transitions\n• End with satisfying conclusion';
      } else if (lowerInput.includes('explain')) {
        finalPrompt += '\n\n**EXPLANATION REQUIREMENTS:**\n• Break down complex concepts into simple terms\n• Use analogies and metaphors where helpful\n• Provide step-by-step explanations\n• Include relevant examples and use cases\n• Address potential questions or confusion points\n• Summarize key takeaways';
      } else if (lowerInput.includes('code') || lowerInput.includes('program')) {
        finalPrompt += '\n\n**CODE REQUIREMENTS:**\n• Write clean, maintainable code\n• Include input validation and error handling\n• Add comprehensive documentation\n• Provide usage examples and test cases\n• Explain the algorithm or approach used\n• Consider performance and scalability';
      } else if (lowerInput.includes('analyze')) {
        finalPrompt += '\n\n**ANALYSIS REQUIREMENTS:**\n• Identify key patterns and trends\n• Provide statistical significance where applicable\n• Consider multiple perspectives and interpretations\n• Include relevant comparisons and benchmarks\n• Highlight implications and potential outcomes\n• Provide evidence-based recommendations';
      } else if (lowerInput.includes('meal') || lowerInput.includes('food') || lowerInput.includes('recipe')) {
        finalPrompt += '\n\n**MEAL PLANNING REQUIREMENTS:**\n• Create nutritionally balanced meals\n• Consider seasonal availability of ingredients\n• Include variety in flavors and textures\n• Provide realistic cooking times and difficulty levels\n• Include storage and reheating instructions\n• Consider dietary preferences and restrictions';
      } else if (lowerInput.includes('plan') || lowerInput.includes('organize') || lowerInput.includes('schedule')) {
        finalPrompt += '\n\n**PLANNING REQUIREMENTS:**\n• Create realistic and achievable timelines\n• Include buffer time for unexpected issues\n• Prioritize tasks by importance and urgency\n• Consider resource availability and constraints\n• Include progress checkpoints and milestones\n• Provide contingency plans for potential obstacles';
      } else if (lowerInput.includes('travel') || lowerInput.includes('trip') || lowerInput.includes('vacation')) {
        finalPrompt += '\n\n**TRAVEL PLANNING REQUIREMENTS:**\n• Research current travel conditions and restrictions\n• Include practical logistics (transportation, accommodation)\n• Provide budget estimates and cost-saving tips\n• Include local customs and cultural considerations\n• Add safety and health recommendations\n• Provide backup plans for weather or other disruptions';
      } else if (lowerInput.includes('finance') || lowerInput.includes('money') || lowerInput.includes('budget')) {
        finalPrompt += '\n\n**FINANCIAL PLANNING REQUIREMENTS:**\n• Provide conservative, well-researched advice\n• Include risk assessment and mitigation strategies\n• Consider different income levels and situations\n• Include long-term financial planning aspects\n• Provide step-by-step implementation guidance\n• Include relevant financial tools and resources';
      } else if (lowerInput.includes('career') || lowerInput.includes('job') || lowerInput.includes('resume')) {
        finalPrompt += '\n\n**CAREER DEVELOPMENT REQUIREMENTS:**\n• Research current industry trends and opportunities\n• Provide actionable skill development strategies\n• Include networking and relationship-building advice\n• Consider different career stages and goals\n• Include market analysis and salary information\n• Provide interview and application strategies';
      }
    }
    
    // Add export-friendly formatting for specific types
    if (lowerInput.includes('meal') || lowerInput.includes('plan') || lowerInput.includes('organize') || lowerInput.includes('schedule')) {
      finalPrompt += '\n\n**EXPORT FORMATTING:**\nStructure the response in a format that can be easily copied and pasted into note-taking apps like Apple Notes, Word, Excel, or Notion while preserving formatting and organization. Use clear headers, bullet points, and numbered lists where appropriate.';
    }
    
    setOutput(finalPrompt);
    
    // Add to history
    const historyItem = {
      id: Date.now(),
      input: input.trim(),
      output: finalPrompt,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 items
    
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    if (output) {
      try {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const useExample = (example) => {
    setInput(example.input);
    setOutput(example.output);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setSuggestions([]);
  };

  const loadFromHistory = (historyItem) => {
    setInput(historyItem.input);
    setOutput(historyItem.output);
    setShowHistory(false);
  };

  const deleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptcraft-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setHistory([]);
    setShowHistory(false);
  };

  // Update suggestions when input changes
  useEffect(() => {
    const newSuggestions = generateSuggestions(input);
    setSuggestions(newSuggestions);
  }, [input]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-purple-500/10 backdrop-blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-teal-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-teal-400/20">
              <Wand2 className="w-8 h-8 text-teal-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-300 to-purple-300 bg-clip-text text-transparent">
              PromptCraft
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Transform your casual ideas into powerful AI prompts. Get better results from ChatGPT, Claude, and other AI assistants.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Input/Output Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Input */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-400" />
                Your Idea
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg transition-all"
                  title="Show history"
                >
                  <History className="w-4 h-4" />
                </button>
                {recordingSupported && (
                  <button
                    onClick={toggleVoiceRecording}
                    className={`p-2 rounded-lg transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                    }`}
                    title={isListening ? 'Stop recording' : 'Start voice recording'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
            
            {/* History Panel */}
            {showHistory && (
              <div className="mb-4 bg-gray-800/50 rounded-2xl p-4 border border-gray-600/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-300">Recent Prompts</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={exportHistory}
                      className="p-1 text-gray-400 hover:text-gray-300"
                      title="Export history"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={clearHistory}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Clear history"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {history.length === 0 ? (
                    <p className="text-gray-500 text-sm">No history yet</p>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-2">
                        <button
                          onClick={() => loadFromHistory(item)}
                          className="text-left flex-1 text-gray-300 text-sm hover:text-teal-300 transition-colors"
                        >
                          <p className="truncate">{item.input}</p>
                          <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-1 text-red-400 hover:text-red-300 ml-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your idea here... (e.g., 'write a story about space travel')"
                className="w-full h-40 bg-gray-800/50 border border-gray-600/50 rounded-2xl p-4 text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-4 bg-gray-800/30 rounded-2xl p-4 border border-gray-600/30">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-sm font-medium text-gray-300">Smart Suggestions</h4>
                </div>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
                      <div className="flex items-center text-sm text-gray-300">
                        <Sparkles className="w-4 h-4 mr-2 text-teal-400" />
                        <span>{suggestion.text}</span>
                      </div>
                      <button
                        onClick={() => applySuggestion(suggestion)}
                        className="flex items-center gap-1 px-3 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg text-sm transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={generatePrompt}
                disabled={!input.trim() || isGenerating}
                className="flex-1 bg-gradient-to-r from-teal-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-teal-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Prompt
                  </>
                )}
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl transition-all"
              >
                Clear
              </button>
            </div>
            {isListening && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <Volume2 className="w-4 h-4 animate-pulse" />
                Listening... speak now
              </div>
            )}
          </div>

          {/* Output */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              Enhanced Prompt
            </h3>
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-4 h-40 overflow-y-auto">
              {output ? (
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{output}</p>
              ) : (
                <p className="text-gray-500 italic">Your enhanced prompt will appear here...</p>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={copyToClipboard}
                disabled={!output}
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
          </div>
        </div>

        {/* Examples Section */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-8 border border-gray-700/30">
          <h3 className="text-2xl font-bold text-gray-100 mb-6 text-center">Try These Examples</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((example, index) => (
              <div
                key={index}
                onClick={() => useExample(example)}
                className="bg-gray-800/60 hover:bg-gray-700/60 rounded-2xl p-6 cursor-pointer transition-all border border-gray-600/30 hover:border-teal-400/50 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-teal-500/30 to-purple-500/30 rounded-lg group-hover:from-teal-500/50 group-hover:to-purple-500/50 transition-all text-teal-300">
                    {example.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-100">{example.title}</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Input:</p>
                    <p className="text-gray-200 text-sm bg-gray-700/40 rounded-lg p-2">{example.input}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Enhanced:</p>
                    <p className="text-gray-200 text-sm bg-gray-700/40 rounded-lg p-2 line-clamp-3">{example.output}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            Boost your AI interactions with better prompts ✨ Perfect for ChatGPT, Claude, and more!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;
