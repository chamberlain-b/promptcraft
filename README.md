# PromptCraft 🪄

Transform your casual ideas into powerful AI prompts with PromptCraft - an intelligent prompt enhancement tool that helps you get better results from any AI assistant.

![PromptCraft Screenshot](https://via.placeholder.com/800x400/1a1a1a/teal?text=PromptCraft+Interface)

## ✨ Features

- **Smart Enhancement**: Automatically transforms simple ideas into detailed, structured prompts
- **Voice Input**: Speak your ideas directly using voice recognition (Chrome/Edge)
- **Intelligent Suggestions**: Context-aware suggestions to improve your prompts
- **Real-time Processing**: Instant prompt enhancement with visual feedback
- **Copy to Clipboard**: One-click copying of enhanced prompts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Example Templates**: Pre-built examples for common use cases

## 🚀 Live Demo

[View Live Demo](https://yourusername.github.io/promptcraft) *(Replace with your actual URL)*

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0
- **Styling**: Tailwind CSS 4.1.11
- **Icons**: Lucide React 0.525.0
- **Speech**: Web Speech API
- **Build**: Create React App

## 📦 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/promptcraft.git
cd promptcraft

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## 🏗️ Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npx serve -s build
```

## 🌐 Deployment

### Netlify (Recommended)
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Or connect your GitHub repo for automatic deployments

### Vercel
```bash
npm i -g vercel
vercel
```

### GitHub Pages
```bash
npm run deploy
```

## 🎯 Usage

1. **Enter Your Idea**: Type or speak your basic prompt idea
2. **Get Suggestions**: Review intelligent suggestions to enhance your prompt
3. **Generate**: Click "Generate Prompt" to create an enhanced version
4. **Copy & Use**: Copy the enhanced prompt and use it with any AI assistant

### Examples

**Input**: "write a story about space travel"

**Enhanced Output**: "Given the context of your request, write a story about space travel. Please provide specific, detailed information. Structure your response in a clear, organized manner. Use a professional yet engaging tone."

## 🎨 Customization

### Modifying Suggestions
Edit the `generateSuggestions` function in `src/App.js` to customize suggestion logic:

```javascript
const generateSuggestions = (text) => {
  // Add your custom suggestion logic here
  const suggestions = [];
  // ... your logic
  return suggestions;
};
```

### Styling
- Modify `tailwind.config.js` for theme customization
- Update component classes in `src/App.js`
- Add custom CSS in `src/index.css`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_VERSION=1.0.0
REACT_APP_NAME=PromptCraft
```

### Browser Support
- ✅ Chrome/Edge (full features including voice input)
- ✅ Firefox (all features except voice input)
- ✅ Safari (all features except voice input)
- ✅ Mobile browsers (touch optimized)

## 📱 Mobile Features

- Responsive design works on all screen sizes
- Touch-optimized interface
- Voice input supported on compatible mobile browsers
- Optimized for both portrait and landscape orientations

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit: `git commit -m 'Add feature-name'`
6. Push: `git push origin feature-name`
7. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes across different browsers
- Update documentation for new features

## 🐛 Troubleshooting

### Common Issues

**Voice recognition not working:**
- Ensure you're using Chrome or Edge browser
- Grant microphone permissions when prompted
- Voice input requires HTTPS in production

**Styles not loading:**
- Clear browser cache
- Ensure Tailwind is properly configured
- Check console for CSS errors

**Build fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.0s

## 🔒 Privacy & Security

- No data is stored externally
- Voice input processed locally in browser
- No tracking or analytics by default
- All processing happens client-side

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Styling framework by [Tailwind CSS](https://tailwindcss.com/)
- Built with [React](https://reactjs.org/)

## 📞 Support

- 📧 Email: your.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/promptcraft/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/promptcraft/discussions)

## 🗺️ Roadmap

- [ ] AI API integration for real prompt enhancement
- [ ] Prompt templates library
- [ ] User accounts and saved prompts
- [ ] Team collaboration features
- [ ] Browser extension
- [ ] Mobile app

---

**Made with ❤️ for the AI community**

*Replace `yourusername` with your actual GitHub username throughout this file.*
