import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Send, Bot, MessagesSquare } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


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
    <div className="min-h-screen bg-[#1f2121] text-orange-900 font-sans">
      {/* Simple solid background */}
      <div className="fixed inset-0 bg-[#1f2121] pointer-events-none"></div>

      <div className="relative z-10 max-w-8xl mx-auto flex gap-6 h-screen px-6 py-2">
        {/* Left Sidebar - Header */}
        <div className="w-64 flex flex-col border-[#D4A5A5] justify-between">
          <div className="py-6 pr-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-7 h-7 text-white" />
              <h1 className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', 'Outfit', sans-serif" }}>
                Lohit Abhiram
              </h1>
            </div>
            <p className="text-white text-sm font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
              AI Developer Voice Assistant
            </p>
            <p className="text-white text-xs mt-3">
              Ask me about my background, skills, and experience
            </p>
          </div>
          <div className="flex-1 mt-55 justify-end items-center border-[#D4A5A5]">
             <DotLottieReact
                src="https://lottie.host/6c1820fe-c480-46ce-a287-655c002e1cfc/xTR8vykqhS.lottie"
                loop
                autoplay
                speed={2}
              />
          </div>
          
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-4 bg-[#191a1a] rounded-2xl p-6 border border-[#2b2d2d] shadow-sm">
            {messages.length === 0 && (
              <div className="text-center py-35 text-white">
                <MessagesSquare className="w-16 h-16 mx-auto mb-4 opacity-20 animate-bounce text-white" />
                <p className="text-lg font-medium">Start by clicking the microphone or typing your question</p>
                <div className="mt-6 text-left max-w-md mx-auto space-y-2 text-sm">
                  <p className="font-semibold text-white">Try asking:</p>
                  <ul className="space-y-1 text-white">
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
                    ? 'bg-[#1f2121] text-white shadow-sm' 
                    : 'bg-[#191a1a] text-white border-[#D4A5A5] shadow-sm'
                }`}>
                  <p className="text-sm font-semibold mb-1 opacity-80">
                    {msg.role === 'user' ? 'Me' : 'AI Assistant'}
                  </p>
                  <p className="leading-relaxed font-medium">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-[#E8D4C4] rounded-2xl px-5 py-3 border border-[#D4A5A5]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#9B7E7E] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#9B7E7E] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[#9B7E7E] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-[#6B4F4F] text-sm font-medium">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="bg-[#191a1a] rounded-2xl p-6 border border-[#2b2d2d] shadow-sm">
            {/* Voice status */}
            {(isListening || isSpeaking) && (
              <div className="mb-4 text-center">
                {isListening && (
                  <div className="flex items-center justify-center gap-2 text-[#8B6F6F] animate-pulse">
                    <Mic className="w-5 h-5" />
                    <span className="font-medium">Listening... {transcript && `"${transcript}"`}</span>
                  </div>
                )}
              </div>
            )}

            {/* Input area */}
            <div className="flex gap-3 mb-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
                placeholder="Type your question..."
                disabled={isProcessing}
                className="flex-1 bg-[#1f2121] border-2 border-[#2b2d2d] rounded-xl px-4 py-3 text-white placeholder:text-[#626560] focus:outline-none focus:ring-2 focus:ring-[#2b2d2d] focus:border-transparent disabled:opacity-50 font-medium"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isProcessing || !inputText.trim()}
                className="mt-2 bg-[#393E46] disabled:opacity-50 hover:bg-[#393E46] hover:opacity-80 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 shadow-sm flex w-9 h-9 items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={isSpeaking ? stopSpeaking : () => setAutoSpeak(!autoSpeak)}
                className={`flex mt-2 items-center justify-center w-9 h-9 rounded-lg font-semibold transition-all duration-200 shadow-sm text-sm ${
                  isSpeaking
                    ? 'bg-[#FF0000] opacity-50 hover:bg-[#FF0000] hover:opacity-100 text-white'
                    : autoSpeak
                    ? 'bg-[#393E46] opacity-100 hover:bg-[#393E46] hover:opacity-80 text-white'
                    : 'bg-[#FF0000] opacity-50 hover:bg-[#FF0000] hover:opacity-100 text-white border-[#D4A5A5]'
                }`}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4" />
                ) : autoSpeak ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              <div className="group relative">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={`flex mt-2 items-center justify-center p-2 rounded-lg font-semibold transition-all duration-200 shadow-sm ${
                    isListening
                      ? 'bg-[#4561a8] opacity-75 hover:bg-[#4561a8] hover:opacity-100 text-white'
                      : 'bg-[#6495ED] opacity-75 hover:bg-[#6495ED] hover:opacity-100 text-white'
                  } disabled:opacity-100 disabled:cursor-not-allowed`}
                  title={isListening ? 'Stop Recording' : 'Start Voice Input'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-[#6B4F4F] text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">
                  {isListening ? 'Stop Recording' : 'Start Voice Input'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&display=swap');
        
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
          background: #F5E6D3;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #D4A5A5;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #9B7E7E;
        }
      `}</style>
    </div>
  );
}
