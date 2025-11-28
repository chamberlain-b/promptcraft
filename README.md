# Prompt Craft 🚀

Transform your casual ideas into powerful AI prompts with intelligent enhancement and context awareness.

## ✨ Features

### 🤖 LLM Integration
- **OpenAI API Support**: Connect your OpenAI API key for intelligent prompt generation
- **Smart Intent Detection**: Automatically analyzes your input to determine the best approach
- **Context-Aware Generation**: Uses conversation history to create more relevant prompts
- **Fallback Enhancement**: Works offline with local prompt enhancement when API is unavailable

### 🧠 Intelligent Context Management
- **Conversation Memory**: Remembers your previous interactions for better continuity
- **Intent Tracking**: Learns from your usage patterns to improve suggestions
- **Smart Suggestions**: Provides contextual recommendations based on your input
- **Similar Request Detection**: Finds and references similar previous prompts

### 🎯 Enhanced Prompt Generation
- **Dynamic Role Assignment**: Automatically assigns expert roles based on your request
- **Adaptive Constraints**: Generates relevant constraints and requirements
- **Format Optimization**: Suggests optimal output formats for different types of requests
- **Multi-Domain Support**: Specialized handling for writing, coding, analysis, planning, and more

### ⚙️ Advanced Settings
- **API Key Management**: Secure storage and testing of OpenAI API keys
- **User Preferences**: Customize default tone, length, and behavior
- **Feature Toggles**: Enable/disable specific features as needed
- **Data Management**: Export, import, and clear your conversation history

### 🎨 User Experience
- **Voice Input**: Speech-to-text support for hands-free operation
- **Smart Suggestions**: Real-time recommendations to improve your prompts
- **History Management**: Easy access to previous prompts with search and export
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (optional, for enhanced features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/promptcraft.git
   cd promptcraft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Configuration

1. **Set up OpenAI API (Optional)**
   - Click the "Settings" button in the app
   - Enter your OpenAI API key
   - Test the connection
   - Enable LLM integration features

2. **Customize Preferences**
   - Set your preferred default tone and length
   - Configure feature toggles
   - Adjust context memory settings

## 🎯 Usage Examples

### Content Writing
**Input**: "write a blog post about AI"
**Enhanced Output**: 
```
You are an expert content writer and storyteller. You are creating engaging, well-structured content that captivates readers and provides value.

**TASK:**
write a blog post about AI

**REQUIREMENTS:**
• Target length: 500-800 words
• Tone: Professional yet engaging
• Include engaging introduction and conclusion
• Use clear structure with headings

**OUTPUT FORMAT:**
• Use clear headings and subheadings
• Include engaging introduction and conclusion
• Use paragraphs for readability
• Incorporate relevant examples

**ADDITIONAL GUIDELINES:**
• Provide comprehensive, well-researched information
• Use clear, professional language
• Include relevant context and background information
• Ensure accuracy and reliability of information
• Consider the user's level of expertise
• Provide actionable insights and next steps
• Format the response for easy reading and implementation
```

### Code Generation
**Input**: "create a Python function to sort a list"
**Enhanced Output**:
```
You are a senior software engineer and technical mentor. You are providing clear, well-documented, production-ready code solutions with best practices.

**TASK:**
create a Python function to sort a list

**REQUIREMENTS:**
• Include comprehensive error handling
• Follow best practices and coding standards
• Provide detailed comments and documentation
• Include usage examples

**OUTPUT FORMAT:**
• Provide complete, runnable code
• Include detailed comments
• Add usage examples
• Explain the logic and approach

**ADDITIONAL GUIDELINES:**
• Provide comprehensive, well-researched information
• Use clear, professional language
• Include relevant context and background information
• Ensure accuracy and reliability of information
• Consider the user's level of expertise
• Provide actionable insights and next steps
• Format the response for easy reading and implementation
```

## 🔧 Technical Architecture

### Services
- **LLM Service**: Handles OpenAI API integration and local enhancement
- **Context Service**: Manages conversation history and user preferences
- **Settings Service**: Handles configuration and data management

### Key Components
- **Intent Analysis**: Determines the type and context of user requests
- **Context Enhancement**: Adds relevant information from previous interactions
- **Prompt Generation**: Creates structured, effective prompts
- **History Management**: Stores and retrieves conversation data

### Data Flow
1. User inputs a request
2. System analyzes intent and context
3. LLM service generates enhanced prompt
4. Context service stores interaction
5. User receives optimized prompt

## 🛠️ Development

### Project Structure
```
src/
├── components/
│   └── Settings.jsx          # Settings modal component
├── services/
│   ├── llmService.js         # LLM integration service
│   └── contextService.js     # Context management service
├── App.jsx                   # Main application component
├── index.css                 # Global styles
└── main.jsx                  # Application entry point
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables
- `REACT_APP_OPENAI_API_KEY` - OpenAI API key (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � Privacy & Security

### Data Handling
- **Local Storage**: User preferences and history are stored locally in your browser
- **Third-Party Processing**: Inputs are sent to AI services (OpenAI, etc.) for processing
- **No Personal Data**: Avoid submitting sensitive or personal information
- **Training Data**: Third-party AI providers may use inputs for model training

### Best Practices
- Review the [Privacy Policy](PRIVACY_POLICY.md) before use
- Use responsibly and follow your organization's AI usage policies
- Clear sensitive data from local storage regularly
- Set up API key restrictions in your OpenAI dashboard

### Disclaimer
This tool is provided "as-is" without warranty. Users are responsible for reviewing generated content and ensuring compliance with applicable laws and policies.

## �📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Icons from Lucide React
- LLM integration powered by OpenAI

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Transform your AI interactions with Prompt Craft! 🚀**
