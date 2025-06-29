import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  Sparkles, 
  Lightbulb, 
  Wand2, 
  Loader2,
  Volume2,
  Settings,
  Zap
} from 'lucide-react';

function App() {
  const [inputText, setInputText] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Generate suggestions based on input
  const generateSuggestions = (text) => {
    const suggestions = [];
    
    if (text.length < 10) {
      suggestions.push({
        type: 'length',
        text: 'Add more details to make your prompt more specific',
        icon: 'lightbulb'
      });
    }
    
    if (!text.includes('what') && !text.includes('how') && !text.includes('why') && !text.includes('when') && !text.includes('where')) {
      suggestions.push({
        type: 'question',
        text: 'Consider adding a question word to make it more engaging',
        icon: 'sparkles'
      });
    }
    
    if (!text.includes('specific') && !text.includes('detailed') && !text.includes('comprehensive')) {
      suggestions.push({
        type: 'detail',
        text: 'Add specific requirements for better results',
        icon: 'wand2'
      });
    }
    
    if (text.length > 50 && !text.includes('format') && !text.includes('style')) {
      suggestions.push({
        type: 'format',
        text: 'Specify the desired format or style for the output',
        icon: 'settings'
      });
    }
    
    return suggestions;
  };

  // Get icon component for suggestions
  const getSuggestionIcon = (icon) => {
    switch (icon) {
      case 'lightbulb':
        return <Lightbulb className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'wand2':
        return <Wand2 className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    
    if (text.length > 5) {
      const newSuggestions = generateSuggestions(text);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Simulate AI processing
  const simulateProcessing = async () => {
    setIsProcessing(true);
    setProcessingStep(0);
    
    const steps = [
      'Analyzing your input...',
      'Generating enhancement suggestions...',
      'Structuring the prompt...',
      'Adding context and clarity...',
      'Finalizing enhanced prompt...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Generate enhanced prompt
    const enhanced = enhancePrompt(inputText);
    setEnhancedPrompt(enhanced);
    setIsProcessing(false);
    setProcessingStep(0);
  };

  // Enhance the prompt with AI-like processing
  const enhancePrompt = (text) => {
    let enhanced = text;
    
    // Add context if missing
    if (!enhanced.toLowerCase().includes('context') && !enhanced.toLowerCase().includes('background')) {
      enhanced = `Given the context of your request, ${enhanced}`;
    }
    
    // Add specificity
    if (!enhanced.toLowerCase().includes('specific') && !enhanced.toLowerCase().includes('detailed')) {
      enhanced = enhanced.replace(/\.$/, '') + '. Please provide specific, detailed information.';
    }
    
    // Add format guidance
    if (!enhanced.toLowerCase().includes('format') && !enhanced.toLowerCase().includes('structure')) {
      enhanced = enhanced.replace(/\.$/, '') + ' Structure your response in a clear, organized manner.';
    }
    
    // Add tone guidance
    if (!enhanced.toLowerCase().includes('tone') && !enhanced.toLowerCase().includes('style')) {
      enhanced = enhanced.replace(/\.$/, '') + ' Use a professional yet engaging tone.';
    }
    
    return enhanced;
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Apply suggestion
  const applySuggestion = (suggestion) => {
    let newText = inputText;
    
    switch (suggestion.type) {
      case 'length':
        newText += ' Please provide comprehensive details and examples.';
        break;
      case 'question':
        newText += ' What specific aspects would you like me to focus on?';
        break;
      case 'detail':
        newText += ' Include specific requirements, constraints, and desired outcomes.';
        break;
      case 'format':
        newText += ' Please format the response with clear sections and bullet points where appropriate.';
        break;
      default:
        break;
    }
    
    setInputText(newText);
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient-xy">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              PromptCraft
            </h1>
          </div>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Transform your casual ideas into powerful AI prompts with intelligent enhancement
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Input Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                Your Prompt Idea
              </h2>
              <button
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
            
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInputChange}
              placeholder="Describe your idea or question here... (e.g., 'write a story about space travel' or 'explain quantum physics')"
              className="w-full h-32 bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Suggestions to improve your prompt:
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center text-sm text-slate-300">
                        {getSuggestionIcon(suggestion.icon)}
                        <span className="ml-2">{suggestion.text}</span>
                      </div>
                      <button
                        onClick={() => applySuggestion(suggestion)}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="text-center mb-8">
            <button
              onClick={simulateProcessing}
              disabled={!inputText.trim() || isProcessing}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center mx-auto ${
                !inputText.trim() || isProcessing
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Generate Enhanced Prompt
                </>
              )}
            </button>
          </div>

          {/* Processing Animation */}
          {isProcessing && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <h3 className="text-lg font-semibold text-white">Enhancing your prompt...</h3>
              </div>
              <div className="space-y-2">
                {[
                  'Analyzing your input...',
                  'Generating enhancement suggestions...',
                  'Structuring the prompt...',
                  'Adding context and clarity...',
                  'Finalizing enhanced prompt...'
                ].map((step, index) => (
                  <div key={index} className={`flex items-center text-sm ${
                    index <= processingStep ? 'text-purple-300' : 'text-slate-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      index <= processingStep ? 'bg-purple-400' : 'bg-slate-600'
                    }`}></div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Prompt Output */}
          {enhancedPrompt && !isProcessing && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Enhanced Prompt
                </h2>
                <button
                  onClick={copyToClipboard}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {enhancedPrompt}
                </p>
              </div>
              
              {copied && (
                <div className="mt-3 text-center">
                  <span className="text-green-400 text-sm">✓ Copied to clipboard!</span>
                </div>
              )}
            </div>
          )}

          {/* Features Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Voice Input</h3>
              <p className="text-slate-300 text-sm">Speak your ideas directly using voice recognition (Chrome/Edge)</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Suggestions</h3>
              <p className="text-slate-300 text-sm">Get intelligent suggestions to improve your prompts in real-time</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Enhancement</h3>
              <p className="text-slate-300 text-sm">Transform simple ideas into detailed, structured prompts instantly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
