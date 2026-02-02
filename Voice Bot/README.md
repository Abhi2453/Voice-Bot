# Voice Bot - AI Interview Assistant

A React + Vite application that simulates an AI-powered voice assistant representing a candidate for a Generative AI Developer position. The bot uses speech recognition and text-to-speech to create an interactive interview experience.

## Features

- 🎤 **Speech Recognition** - Convert voice input to text using Web Speech API
- 🔊 **Text-to-Speech** - Hear AI responses spoken aloud
- 💬 **Chat Interface** - View conversation history with user and assistant messages
- 🤖 **AI-Powered Responses** - Uses Grok API for intelligent, contextual answers
- ⚡ **Real-time Processing** - Instant message processing and responses
- 🎯 **Auto-speak Toggle** - Enable/disable automatic voice responses

## Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **AI API:** Grok (x.ai)
- **Speech API:** Web Speech API (SpeechRecognition & SpeechSynthesis)
- **Styling:** CSS

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Grok API key from [x.ai](https://x.ai)

## Installation

1. Clone the repository:
```bash
cd "d:\Js\Voice bot\Voice Bot"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```
VITE_XAI_API_KEY=your_grok_api_key_here
```

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:5173`

## Usage

1. **Type or Speak:**
   - Type your message in the input field and click Send
   - Or click the Mic button to speak your question

2. **Listen to Responses:**
   - AI responses are automatically displayed
   - Enable "Auto Speak" to hear responses read aloud
   - Click the Speaker button to manually trigger speech

3. **Stop Actions:**
   - Click "Stop Listening" to stop recording
   - Click "Stop Speaking" to stop audio playback

## Project Structure

```
src/
├── App.jsx           # Main component with bot logic
├── App.css          # Styling
├── index.css        # Global styles
└── main.jsx         # Entry point
```

## Available Commands

```bash
npm start       # Start development server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

## Features Details

### Speech Recognition
- Uses Web Speech API for real-time voice input
- Automatic transcript display
- Support for multiple browsers (Chrome, Edge, Safari)

### AI Assistant
- Responds as a Generative AI Developer candidate
- Personalized answers about skills, experience, and growth areas
- Natural, conversational tone

### Text-to-Speech
- Chrome/Edge voice synthesis
- Configurable speech rate and pitch
- Toggle on/off as needed

## Configuration

Edit the system prompt in `App.jsx` to customize the assistant's persona and knowledge base.

## Browser Support

- Chrome/Chromium (recommended)
- Edge
- Safari (partial support)
- Firefox (limited speech API support)

## Troubleshooting

**API Key Not Loaded:**
- Ensure `.env` file is in project root
- Restart dev server after creating `.env`
- Check variable name starts with `VITE_`

**Speech Recognition Not Working:**
- Use Chrome/Edge for best compatibility
- Ensure microphone permissions are granted
- Check browser console for errors

**No Audio Output:**
- Enable "Auto Speak" toggle
- Check browser volume settings
- Verify speaker/headphones are connected

## Future Enhancements

- Support for more AI models
- Conversation history export
- Custom candidate profiles
- Multi-language support
- Advanced prompt engineering

## License

---

**Built with ❤️ for AI interviews**