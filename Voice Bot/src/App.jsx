import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Send } from 'lucide-react';

export default function VoiceBot() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        if (event.results[current].isFinal) {
          handleSendMessage(transcriptText);
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

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text) => {
    if (!autoSpeak) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInputText('');
    setIsProcessing(true);

    try {
      
      console.log('api key exists:', !!import.meta.env.VITE_GROQ_API_KEY);
      console.log('sending api req to groq');

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a voice assistant representing a candidate for a Generative AI Developer position at 100x. Answer questions as if you are the candidate. Keep responses conversational, natural, and authentic. Sound like a real person in an interview, not robotic or overly formal. Be concise but informative.
              
Personal Profile Data:

  Gangiredla Lohit Abhiram Naidu is a B.Tech Mechanical Engineering student at IIT (ISM) Dhanbad. Originally from Visakhapatnam.

Education Highlights:

Currently pursuing Bachelor of Technology in Mechanical Engineering at IIT ISM Dhanbad (2022-2026). Relevant coursework covers Solid Mechanics, Fluid Mechanics, Engineering Materials, Manufacturing Production Technology, Thermodynamics, Heat and Mass Transfer, Machine Design, and Machining & Machine Tools. Secured All India Rank 2962 in JEE-Advanced.

Skills Inventory

Programming & Tech Stack:

Category	Skills
Languages- Python, C++(5-star HackerRank), JavaScript,MySQL, HTML, CSS
Frameworks/Tools-	Power BI, Tableau, React.js, Node.js, Express.js, TailwindCSS, MongoDB, Firebase, Mirage JS 

Data & Others-	pandas, BeautifulSoup, requests, scikit-learn, statsmodels, ETL, Web Scraping, Data Visualization, Git/GitHub, REST APIs, JWT, Data Structures 
Key Projects

Talent-Flow (React.js, Node.js, TailwindCSS, Mirage JS): HR platform with job management, Kanban, assessments, IndexedDB for data handling. Live: talentflow-5.onrender.com.

Blog-App (Node.js, Express.js, MongoDB): Secure auth (JWT, bcrypt), CRUD admin dashboard, public pages with pagination. Live: blogapp-krkj.onrender.com.

Queue-App (React Vite, Firebase, Tailwind): Real-time queue management with role-based auth and dynamic dashboards.

Sales Insights (Excel, SQL, Power BI): Interactive dashboards for sales trends and stakeholder insights.

T20 Cricket Analysis (Python scraping, pandas, Power BI): Match stats dashboard for performance trends.

Hospitality Revenue (Python, SQL, Power BI): Occupancy and revenue optimization analytics.

Achievements & Engagements

5-star HackerRank in C and Problem Solving; CodeChef 2-star (rating 1400). Volunteered/organized at Srijan'22 (socio-cultural), Concetto'23 (tech fest), Parakram sports fest.`
            },
            {
              role: 'user',
              content: textToSend
            }
          ],
          max_tokens: 500,
          temperature: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || 'No response received';
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      speak(assistantMessage);
      
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage = `Error: ${error.message}`;
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
      speak(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6 flex flex-col h-screen">
        {/* Header */}
        <header className="text-center py-8 mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Space Grotesk', 'Outfit', sans-serif" }}>
              AI Voice Interview Bot
            </h1>
            <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-purple-200 text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
            100x Generative AI Developer Assessment
          </p>
          <p className="text-purple-300/70 text-sm mt-2">
            Ask me about my background, skills, and experience
          </p>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-2xl">
          {messages.length === 0 && (
            <div className="text-center py-12 text-purple-300/60">
              <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Start by clicking the microphone or typing your question</p>
              <div className="mt-6 text-left max-w-md mx-auto space-y-2 text-sm">
                <p className="font-semibold text-purple-200">Try asking:</p>
                <ul className="space-y-1 text-purple-300/80">
                  <li>• What should I know about your life story?</li>
                  <li>• What's your #1 superpower?</li>
                  <li>• What are the top 3 areas you'd like to grow in?</li>
                  <li>• What misconception do coworkers have about you?</li>
                  <li>• How do you push your boundaries?</li>
                </ul>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50' 
                  : 'bg-white/10 backdrop-blur-md text-purple-50 border border-white/20 shadow-lg'
              }`}>
                <p className="text-sm font-semibold mb-1 opacity-70">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </p>
                <p className="leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-purple-300 text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-2xl">
          {/* Voice status */}
          {(isListening || isSpeaking) && (
            <div className="mb-4 text-center">
              {isListening && (
                <div className="flex items-center justify-center gap-2 text-purple-300 animate-pulse">
                  <Mic className="w-5 h-5" />
                  <span>Listening... {transcript && `"${transcript}"`}</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center justify-center gap-2 text-blue-300 animate-pulse">
                  <Volume2 className="w-5 h-5" />
                  <span>Speaking...</span>
                </div>
              )}
            </div>
          )}

          {/* Input area */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
              placeholder="Type your question..."
              disabled={isProcessing}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 backdrop-blur-sm"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isProcessing || !inputText.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 font-semibold transition-all duration-200 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/50'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isListening ? 'Stop Recording' : 'Start Voice Input'}
            </button>

            <button
              onClick={isSpeaking ? stopSpeaking : () => setAutoSpeak(!autoSpeak)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                isSpeaking
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/50'
                  : autoSpeak
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-500/50'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  Stop Speaking
                </>
              ) : autoSpeak ? (
                <>
                  <Volume2 className="w-5 h-5" />
                  Voice On
                </>
              ) : (
                <>
                  <VolumeX className="w-5 h-5" />
                  Voice Off
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-6 text-purple-300/50 text-sm">
          <p>Created for 100x Generative AI Developer Assessment</p>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;600&display=swap');
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  );
}