import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Copy, RefreshCw, Sparkles, MessageSquare, Code, PenTool, Mic, MicOff, Volume2, History, Download, Trash2, ChefHat, Calendar, Lightbulb, Plus, Settings as SettingsIcon, Brain, Zap, Palette, Ruler, SlidersHorizontal } from 'lucide-react';
import llmService from './services/llmService';
import contextService from './services/contextService';
import Settings from './components/Settings';

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
  const [showSettings, setShowSettings] = useState(false);
  const [currentIntent, setCurrentIntent] = useState(null);
  const [contextInfo, setContextInfo] = useState(null);
  const [llmStatus, setLlmStatus] = useState('checking');
  const recognitionRef = useRef(null);
  const [requestsLeft, setRequestsLeft] = useState(null);
  const [requestLimit, setRequestLimit] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [currentTone, setCurrentTone] = useState('professional');
  const [currentLength, setCurrentLength] = useState('medium');

  // Silence timer ref
  const silenceTimerRef = useRef(null);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('promptcraft-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    // Load user preferences for tone and length
    const userPreferences = contextService.getUserPreferences();
    if (userPreferences.defaultTone) {
      setCurrentTone(userPreferences.defaultTone);
    }
    if (userPreferences.defaultLength) {
      setCurrentLength(userPreferences.defaultLength);
    }
    
    // Check LLM status
    checkLlmStatus();
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('promptcraft-history', JSON.stringify(history));
  }, [history]);

  // Update suggestions when input changes
  useEffect(() => {
    const userPreferences = contextService.getUserPreferences();
    if (userPreferences.enableSuggestions !== false) {
      const newSuggestions = generateSuggestions(input);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const checkLlmStatus = () => {
    const apiKey = localStorage.getItem('openai-api-key');
    if (apiKey) {
      setLlmStatus('available');
    } else {
      setLlmStatus('unavailable');
    }
  };

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
        // Reset silence timer on any result
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
          }
        }, 5000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };
    }

    // Page visibility auto-stop
    const handleVisibility = () => {
      if (document.hidden && recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isListening]);

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
        newInput += ' with detailed comments and explanations';
        break;
      case 'format':
        newInput += ' in bullet point format';
        break;
      case 'detail':
        newInput += ' with comprehensive details and examples';
        break;
      case 'dietary':
        newInput += ' (vegetarian options)';
        break;
      case 'servings':
        newInput += ' for 4 people';
        break;
      case 'budget':
        newInput += ' on a budget';
        break;
      case 'timeframe':
        newInput += ' for the next week';
        break;
      case 'priority':
        newInput += ' (high priority)';
        break;
      default:
        newInput += ' with more specific details';
    }
    
    setInput(newInput);
  };

  const toggleVoiceRecording = () => {
    if (!recordingSupported) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const generatePrompt = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setCurrentIntent(null);
    setContextInfo(null);
    setRequestError(null);

    try {
      // Analyze intent first
      const intentAnalysis = await llmService.analyzeIntent(input.trim());
      setCurrentIntent(intentAnalysis);
      // Get enhanced context
      const userPreferences = contextService.getUserPreferences();
      let context = {
        tone: currentTone,
        length: currentLength
      };
      if (userPreferences.enableContext !== false) {
        const enhancedContext = contextService.getEnhancedContext(input.trim(), intentAnalysis.intent);
        context = { ...enhancedContext, ...context };
        setContextInfo(context);
      }
      // Generate enhanced prompt via backend
      const result = await llmService.generateEnhancedPrompt(input.trim(), context);
      setRequestsLeft(result.requestsLeft);
      setRequestLimit(result.limit);
      if (result.error) {
        setRequestError(result.error);
        setOutput('');
        setIsGenerating(false);
        return;
      }
      setOutput(result.output);
      // Add to context service history
      if (userPreferences.autoSave !== false) {
        contextService.addToHistory(input.trim(), result.output, intentAnalysis);
      }
      // Add to local history for backward compatibility
      const historyItem = {
        id: Date.now(),
        input: input.trim(),
        output: result.output,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 items
    } catch (error) {
      setOutput('Error generating prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const useExample = (example) => {
    setInput(example.input);
    setOutput(example.output);
    
    // Set appropriate tone and length based on example type
    if (example.title === "Content Writing" || example.title === "Creative Writing") {
      setCurrentTone('professional');
      setCurrentLength('long');
    } else if (example.title === "Code Generation") {
      setCurrentTone('technical');
      setCurrentLength('comprehensive');
    } else if (example.title === "Data Analysis") {
      setCurrentTone('professional');
      setCurrentLength('comprehensive');
    } else if (example.title === "Meal Planning") {
      setCurrentTone('friendly');
      setCurrentLength('comprehensive');
    } else if (example.title === "Project Planning") {
      setCurrentTone('professional');
      setCurrentLength('comprehensive');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setCurrentIntent(null);
    setContextInfo(null);
    
    // Reset tone and length to defaults
    const userPreferences = contextService.getUserPreferences();
    if (userPreferences.defaultTone) {
      setCurrentTone(userPreferences.defaultTone);
    }
    if (userPreferences.defaultLength) {
      setCurrentLength(userPreferences.defaultLength);
    }
  };

  const loadFromHistory = (historyItem) => {
    setInput(historyItem.input);
    setOutput(historyItem.output);
  };

  const deleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    contextService.deleteHistoryItem(id);
  };

  const exportHistory = () => {
    contextService.exportHistory();
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      contextService.clearHistory();
    }
  };

  const examples = [
    {
      title: "Content Writing",
      input: "write a blog post about AI",
      output: "You are an expert content writer and technology journalist with deep knowledge of artificial intelligence. Write a comprehensive, engaging blog post about AI that covers current trends, applications, and future implications. The post should be 800-1200 words, include relevant examples and case studies, use clear headings and subheadings, maintain a professional yet accessible tone, and provide actionable insights for readers. Include an engaging introduction, well-structured body with supporting evidence, and a compelling conclusion that encourages further engagement with the topic.",
      icon: <PenTool className="w-5 h-5" />
    },
    {
      title: "Code Generation",
      input: "create a Python function to sort a list",
      output: "You are a senior software engineer and technical mentor with extensive experience in Python development. Create a comprehensive Python function to sort a list that demonstrates best practices and includes multiple sorting options. The function should handle different data types, include comprehensive error handling, provide detailed comments explaining the logic, and include usage examples with different scenarios. Consider edge cases like empty lists, mixed data types, and performance optimization. Provide both the function implementation and clear documentation on how to use it effectively.",
      icon: <Code className="w-5 h-5" />
    },
    {
      title: "Data Analysis",
      input: "analyze sales data trends",
      output: "You are a data analyst and research specialist with expertise in sales analytics and business intelligence. Conduct a comprehensive analysis of sales data trends that provides actionable insights for business decision-making. Your analysis should include trend identification, seasonal patterns, performance metrics, comparative analysis, and predictive insights. Use clear visualizations where appropriate, provide statistical context, identify key drivers of sales performance, and offer specific recommendations for improvement. Structure your response with clear sections for findings, insights, and actionable next steps.",
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      title: "Meal Planning",
      input: "plan a week of healthy meals",
      output: "You are a nutritionist and meal planning expert with knowledge of dietary science and culinary arts. Create a comprehensive weekly meal plan that prioritizes nutrition, variety, and practicality. The plan should include balanced macronutrients, diverse food groups, seasonal ingredients, and accommodate common dietary preferences. Provide detailed recipes with nutritional information, shopping lists organized by category, preparation time estimates, and storage recommendations. Consider budget constraints, cooking skill levels, and time availability. Include options for meal prep and leftovers to maximize efficiency.",
      icon: <ChefHat className="w-5 h-5" />
    },
    {
      title: "Project Planning",
      input: "organize a marketing campaign",
      output: "You are a productivity consultant and project manager with expertise in marketing strategy and campaign execution. Develop a comprehensive marketing campaign plan that includes clear objectives, target audience analysis, channel strategy, timeline, budget allocation, and success metrics. The plan should be actionable with specific tasks, deadlines, and responsibilities. Include risk assessment, contingency plans, and performance tracking methods. Provide templates for key deliverables, communication protocols, and evaluation criteria. Structure the response with clear phases, milestones, and measurable outcomes.",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      title: "Creative Writing",
      input: "write a short story about time travel",
      output: "You are a creative professional and storytelling expert with deep understanding of narrative structure and science fiction elements. Write an engaging short story about time travel that explores the complexities of temporal paradoxes, human nature, and the consequences of changing the past. The story should be 1500-2000 words, feature well-developed characters, include vivid descriptions, maintain consistent internal logic, and deliver a satisfying emotional arc. Use creative narrative techniques, build tension effectively, and provide a thought-provoking conclusion that resonates with readers.",
      icon: <Sparkles className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Requests Left Banner */}
        {requestLimit && (
          <div className="mb-6 flex justify-center">
            <div className={`rounded-xl px-6 py-3 text-lg font-semibold shadow-md border-2 ${
              requestsLeft === 0
                ? 'bg-red-900/70 border-red-500 text-red-200'
                : requestsLeft <= 5
                ? 'bg-yellow-900/70 border-yellow-400 text-yellow-200'
                : 'bg-teal-900/70 border-teal-500 text-teal-200'
            }`}>
              {requestsLeft === 0
                ? `You have reached your free request limit for this month.`
                : `You have ${requestsLeft} of ${requestLimit} free requests left this month.`}
            </div>
          </div>
        )}
        {/* Request Error Banner */}
        {requestError && (
          <div className="mb-6 flex justify-center">
            <div className="rounded-xl px-6 py-3 text-lg font-semibold shadow-md border-2 bg-red-900/80 border-red-500 text-red-200">
              {requestError}
            </div>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
            Prompt Craft
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Transform your basic ideas into professional AI prompts
          </p>
          
          {/* LLM Status Indicator */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              {llmStatus === 'available' ? (
                <Zap className="w-4 h-4 text-green-400" />
              ) : (
                <Brain className="w-4 h-4 text-yellow-400" />
              )}
              <span className="text-sm text-gray-400">
                {llmStatus === 'available' ? 'LLM Enhanced' : 'Local Enhancement'}
              </span>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-all"
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Input */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-8 border border-gray-700/50">
            <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              Your Idea
            </h3>
            
            {/* Prompt Output Style Controls - Single Row, No Icons */}
            <div className="mb-3 bg-gray-800/30 rounded-2xl p-3 border border-gray-600/30">
              <div className="flex flex-nowrap items-center gap-x-4">
                <span className="text-base font-bold text-gray-300 whitespace-nowrap">Output Style:</span>
                <span className="text-sm font-medium text-gray-200 whitespace-nowrap">Tone</span>
                <select
                  value={currentTone}
                  onChange={(e) => setCurrentTone(e.target.value)}
                  className="ml-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                  <option value="academic">Academic</option>
                  <option value="technical">Technical</option>
                  <option value="creative">Creative</option>
                </select>
                <span className="text-sm font-medium text-gray-200 whitespace-nowrap">Length</span>
                <select
                  value={currentLength}
                  onChange={(e) => setCurrentLength(e.target.value)}
                  className="ml-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>
            </div>
            
            {/* Context Info */}
            {contextInfo && (
              <div className="mb-4 bg-blue-900/30 rounded-2xl p-4 border border-blue-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-medium text-blue-300">Context Detected</h4>
                </div>
                <div className="text-sm text-blue-200">
                  <p>Intent: <span className="font-medium">{currentIntent?.intent}</span></p>
                  <p>Confidence: <span className="font-medium">{(currentIntent?.confidence * 100).toFixed(0)}%</span></p>
                  {contextInfo.recentHistory.length > 0 && (
                    <p>Using {contextInfo.recentHistory.length} recent interactions for context</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 rounded-lg transition-all ${
                    showHistory 
                      ? 'bg-teal-500/30 text-teal-300' 
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                  }`}
                  title="Show history"
                >
                  <History className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
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
                placeholder="Type your basic idea here... (e.g., 'write a story about space travel', 'analyze sales data', 'create a meal plan')"
                className="w-full h-60 bg-gray-800/50 border border-gray-600/50 rounded-2xl p-4 text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/70 focus:border-teal-400 caret-teal-400 transition-all"
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
                disabled={!input.trim() || isGenerating || requestsLeft === 0}
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
          <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-8 border border-gray-700/50">
            <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              Enhanced Prompt
            </h3>
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-4 h-60 overflow-y-auto">
              {output ? (
                <div>
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{output}</p>
                  <div className="mt-3 p-2 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <p className="text-xs text-blue-300">
                      💡 This is an enhanced prompt ready to use with ChatGPT, Claude, or other AI systems. Copy and paste it directly!
                    </p>
                  </div>
                </div>
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

      {/* Settings Modal */}
      <Settings isOpen={showSettings} onClose={() => {
        setShowSettings(false);
        checkLlmStatus(); // Refresh LLM status after settings change
      }} />
    </div>
  );
};

export default PromptGenerator;
