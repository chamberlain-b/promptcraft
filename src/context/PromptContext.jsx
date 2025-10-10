import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import llmService from '../services/llmService';
import contextService from '../services/contextService';
import {
  HISTORY_LIMIT,
  REQUEST_LIMIT,
  SILENCE_TIMEOUT,
  TONE_OPTIONS,
  LENGTH_OPTIONS
} from '../data/constants';

const PromptContext = createContext(null);

const getDefaultTone = () => {
  const preferences = contextService.getUserPreferences();
  return preferences.defaultTone || 'professional';
};

const getDefaultLength = () => {
  const preferences = contextService.getUserPreferences();
  return preferences.defaultLength || 'medium';
};

export const PromptProvider = ({ children }) => {
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
  const [requestsLeft, setRequestsLeft] = useState(null);
  const [requestLimit, setRequestLimit] = useState(null);
  const [currentTone, setCurrentTone] = useState(getDefaultTone);
  const [currentLength, setCurrentLength] = useState(getDefaultLength);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('promptcraft-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse stored history:', error);
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('promptcraft-history', JSON.stringify(history));
  }, [history]);

  const generateSuggestions = useCallback((text) => {
    const result = [];
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 10) return result;

    const lowerText = trimmed.toLowerCase();

    if (lowerText.includes('write') || lowerText.includes('story') || lowerText.includes('article')) {
      if (!lowerText.includes('length') && !lowerText.includes('word')) {
        result.push({ type: 'length', text: 'Add desired length (e.g., "500 words", "2 pages")', icon: 'sparkles' });
      }
      if (!lowerText.includes('tone') && !lowerText.includes('style')) {
        result.push({ type: 'tone', text: 'Specify tone (e.g., "professional", "casual", "academic")', icon: 'message-square' });
      }
      if (!lowerText.includes('audience') && !lowerText.includes('reader')) {
        result.push({ type: 'audience', text: 'Define your audience (e.g., "beginners", "experts", "children")', icon: 'users' });
      }
    }

    if (lowerText.includes('code') || lowerText.includes('program') || lowerText.includes('script')) {
      if (!lowerText.includes('language') && !lowerText.includes('python') && !lowerText.includes('javascript')) {
        result.push({ type: 'language', text: 'Specify programming language (e.g., "Python", "JavaScript", "SQL")', icon: 'code' });
      }
      if (!lowerText.includes('comment') && !lowerText.includes('explain')) {
        result.push({ type: 'comments', text: 'Request detailed comments and explanations', icon: 'pen-tool' });
      }
    }

    if (lowerText.includes('analyze') || lowerText.includes('explain') || lowerText.includes('data')) {
      if (!lowerText.includes('format') && !lowerText.includes('structure')) {
        result.push({ type: 'format', text: 'Request specific format (e.g., "bullet points", "table", "chart")', icon: 'pen-tool' });
      }
      if (!lowerText.includes('detail') && !lowerText.includes('comprehensive')) {
        result.push({ type: 'detail', text: 'Ask for comprehensive analysis with examples', icon: 'lightbulb' });
      }
    }

    if (lowerText.includes('meal') || lowerText.includes('food') || lowerText.includes('recipe') || lowerText.includes('diet')) {
      if (!lowerText.includes('dietary') && !lowerText.includes('restriction')) {
        result.push({ type: 'dietary', text: 'Include dietary restrictions (e.g., "vegetarian", "gluten-free", "low-carb")', icon: 'chef-hat' });
      }
      if (!lowerText.includes('serving') && !lowerText.includes('people')) {
        result.push({ type: 'servings', text: 'Specify number of servings or people', icon: 'users' });
      }
      if (!lowerText.includes('budget') && !lowerText.includes('cost')) {
        result.push({ type: 'budget', text: 'Include budget constraints if applicable', icon: 'dollar-sign' });
      }
    }

    if (lowerText.includes('task') || lowerText.includes('plan') || lowerText.includes('organize') || lowerText.includes('schedule')) {
      if (!lowerText.includes('time') && !lowerText.includes('duration')) {
        result.push({ type: 'timeframe', text: 'Specify timeframe (e.g., "daily", "weekly", "monthly")', icon: 'calendar' });
      }
      if (!lowerText.includes('priority') && !lowerText.includes('important')) {
        result.push({ type: 'priority', text: 'Indicate priority level or urgency', icon: 'flag' });
      }
    }

    if (trimmed.length < 30) {
      result.push({ type: 'detail', text: 'Add more specific details about what you want', icon: 'lightbulb' });
    }

    return result.slice(0, 3);
  }, []);

  useEffect(() => {
    const userPreferences = contextService.getUserPreferences();
    if (userPreferences.enableSuggestions === false) {
      setSuggestions([]);
      return;
    }
    setSuggestions(generateSuggestions(input));
  }, [input, generateSuggestions]);

  const applySuggestion = useCallback((suggestion) => {
    setInput((prevInput) => {
      let updated = prevInput || '';
      switch (suggestion.type) {
        case 'length':
          updated += ' (approximately 500 words)';
          break;
        case 'tone':
          updated += ' in a professional tone';
          break;
        case 'audience':
          updated += ' for beginners';
          break;
        case 'language':
          updated += ' in Python';
          break;
        case 'comments':
          updated += ' with detailed comments and explanations';
          break;
        case 'format':
          updated += ' in bullet point format';
          break;
        case 'detail':
          updated += ' with comprehensive details and examples';
          break;
        case 'dietary':
          updated += ' (vegetarian options)';
          break;
        case 'servings':
          updated += ' for 4 people';
          break;
        case 'budget':
          updated += ' on a budget';
          break;
        case 'timeframe':
          updated += ' for the next week';
          break;
        case 'priority':
          updated += ' (high priority)';
          break;
        default:
          updated += ' with more specific details';
      }
      return updated;
    });
  }, []);

  const toggleVoiceRecording = useCallback(() => {
    if (!recordingSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  }, [isListening, recordingSupported]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setRecordingSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput((prev) => `${prev} ${finalTranscript}`.trim());
        }
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
          }
        }, SILENCE_TIMEOUT);
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

  const generatePrompt = useCallback(async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setCurrentIntent(null);
    setContextInfo(null);

    try {
      const intentAnalysis = await llmService.analyzeIntent(input.trim());
      setCurrentIntent(intentAnalysis);

      const userPreferences = contextService.getUserPreferences();
      let context = { tone: currentTone, length: currentLength };

      if (userPreferences.enableContext !== false) {
        const enhancedContext = contextService.getEnhancedContext(input.trim(), intentAnalysis.intent);
        context = { ...enhancedContext, ...context };
        setContextInfo(context);
      }

      const result = await llmService.generateEnhancedPrompt(input.trim(), context);

      if (result.error) {
        setOutput(`⚠️ ${result.error}`);
        setLlmStatus('error');
        setRequestsLeft(result.requestsLeft ?? 0);
        setRequestLimit(result.limit ?? REQUEST_LIMIT);
        return;
      }

      setRequestsLeft(result.requestsLeft);
      setRequestLimit(result.limit ?? REQUEST_LIMIT);

      if (result.enhanced) {
        setLlmStatus('enhanced');
      } else {
        setLlmStatus('error');
      }

      setOutput(result.output);

      if (userPreferences.autoSave !== false) {
        contextService.addToHistory(input.trim(), result.output, intentAnalysis);
      }

      const historyItem = {
        id: uuidv4(),
        input: input.trim(),
        output: result.output,
        timestamp: new Date().toISOString()
      };

      setHistory((prev) => [historyItem, ...prev.slice(0, HISTORY_LIMIT - 1)]);
    } catch (error) {
      console.error('Generation error:', error);
      setOutput('⚠️ AI enhancement service is temporarily unavailable. Please try again in a few moments.');
      setLlmStatus('error');
    } finally {
      setIsGenerating(false);
    }
  }, [input, currentTone, currentLength]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [output]);

  const useExample = useCallback((example) => {
    setInput(example.input);
    setOutput(example.output);

    if (example.tone) {
      setCurrentTone(example.tone);
    }
    if (example.length) {
      setCurrentLength(example.length);
    }
  }, []);

  const clearAll = useCallback(() => {
    setInput('');
    setOutput('');
    setCurrentIntent(null);
    setContextInfo(null);

    const preferences = contextService.getUserPreferences();
    if (preferences.defaultTone) {
      setCurrentTone(preferences.defaultTone);
    } else {
      setCurrentTone(TONE_OPTIONS[0].value);
    }
    if (preferences.defaultLength) {
      setCurrentLength(preferences.defaultLength);
    } else {
      setCurrentLength(LENGTH_OPTIONS[1].value);
    }
  }, []);

  const loadFromHistory = useCallback((item) => {
    setInput(item.input);
    setOutput(item.output);
  }, []);

  const deleteHistoryItem = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    contextService.deleteHistoryItem(id);
  }, []);

  const exportHistory = useCallback(() => {
    contextService.exportHistory();
  }, []);

  const clearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      contextService.clearHistory();
    }
  }, []);

  const checkLlmStatus = useCallback(() => {
    setLlmStatus('checking');
  }, []);

  const contextValue = useMemo(() => ({
    state: {
      input,
      output,
      isGenerating,
      copied,
      isListening,
      recordingSupported,
      history,
      showHistory,
      suggestions,
      showSettings,
      currentIntent,
      contextInfo,
      llmStatus,
      requestsLeft,
      requestLimit,
      currentTone,
      currentLength
    },
    actions: {
      setShowHistory,
      setShowSettings,
      setCurrentTone,
      setCurrentLength,
      setInput,
      setOutput,
      applySuggestion,
      toggleVoiceRecording,
      generatePrompt,
      copyToClipboard,
      useExample,
      clearAll,
      loadFromHistory,
      deleteHistoryItem,
      exportHistory,
      clearHistory,
      setIsListening,
      setHistory,
      checkLlmStatus
    }
  }), [
    input,
    output,
    isGenerating,
    copied,
    isListening,
    recordingSupported,
    history,
    showHistory,
    suggestions,
    showSettings,
    currentIntent,
    contextInfo,
    llmStatus,
    requestsLeft,
    requestLimit,
    currentTone,
    currentLength,
    applySuggestion,
    toggleVoiceRecording,
    generatePrompt,
    copyToClipboard,
    useExample,
    clearAll,
    loadFromHistory,
    deleteHistoryItem,
    exportHistory,
    clearHistory,
    checkLlmStatus
  ]);

  return (
    <PromptContext.Provider value={contextValue}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompt = () => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
};

export default PromptContext;
