import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { NavLink, Outlet, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Product, CartItem, StoreSettings, ClientUIProps } from '../types';
import { CATEGORIES, BADGE_COLORS } from '../constants';
import * as gemini from '../services/geminiService';
import { IconCart, IconPlus, IconMinus, IconTrash, IconChevronDown, IconX, IconChatBubble, IconSend, IconQueueList, IconSquares2x2, IconViewColumn, IconPhoto, IconMicrophone, IconSpeakerWave, IconSparkles, IconStopCircle, IconSearch, IconFilter, IconMenu, IconPhone, IconPhoneSlash } from './Icons';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenaiBlob } from "@google/genai";


const SearchBar: React.FC<{ onSearch: () => void, className?: string, autoFocus?: boolean }> = ({ onSearch, className, autoFocus }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoFocus) {
            // Delay focus slightly to ensure the element is visible and transitions are complete
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [autoFocus]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const targetPath = '/';
        // Only navigate if we are not on the home page already.
        if (window.location.hash !== `#${targetPath}`) {
            navigate(targetPath);
        }
        
        const newParams = new URLSearchParams(searchParams);
        if (query.trim()) {
            newParams.set('q', query);
        } else {
            newParams.delete('q');
        }
        setSearchParams(newParams);
        onSearch(); // Callback to close mobile menu, etc.
    };

    return (
        <form onSubmit={handleSearch} className={`relative ${className}`}>
            <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full p-3 pl-10 rounded-lg glassmorphic focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] text-sm text-gray-800 placeholder-gray-500"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-label="Buscar">
                <IconSearch className="w-5 h-5" />
            </button>
        </form>
    );
};


const Header: React.FC<{ settings: StoreSettings }> = ({ settings }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);
    const closeSearch = () => setIsSearchOpen(false);

    useEffect(() => {
        if (isMenuOpen || isSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMenuOpen, isSearchOpen]);
    
    const SideMenuContent = () => (
        <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
                <h2 className="font-bold text-xl font-arista text-gray-800">Menú</h2>
                <button onClick={closeMenu} aria-label="Cerrar menú">
                    <IconX className="w-7 h-7 text-gray-800" />
                </button>
            </div>
            <nav className="flex flex-col gap-4">
                <NavLink to="/" onClick={closeMenu} className={({isActive}) => `font-semibold p-3 rounded-lg text-left ${isActive ? 'bg-[#9AD5FA] text-gray-800' : 'text-gray-800 hover:bg-white/50'}`}>Inicio</NavLink>
                <NavLink to="/about" onClick={closeMenu} className={({isActive}) => `font-semibold p-3 rounded-lg text-left ${isActive ? 'bg-[#9AD5FA] text-gray-800' : 'text-gray-800 hover:bg-white/50'}`}>Quiénes Somos</NavLink>
                <NavLink to="/contact" onClick={closeMenu} className={({isActive}) => `font-semibold p-3 rounded-lg text-left ${isActive ? 'bg-[#9AD5FA] text-gray-800' : 'text-gray-800 hover:bg-white/50'}`}>Contáctanos</NavLink>
            </nav>
        </div>
    );

    return (
        <>
            <header className="p-4 bg-[#e6e9ef]/80 backdrop-blur-lg sticky top-0 z-20">
                <div className="container mx-auto flex justify-between items-center">
                    <NavLink to="/" onClick={() => { closeMenu(); closeSearch(); }}>
                        <img src={settings.logoUrl} alt={`${settings.storeName} Logo`} className="h-12 w-auto object-contain" />
                    </NavLink>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-4 items-center">
                        <SearchBar onSearch={() => {}} className="w-64" />
                        <NavLink to="/" className={({isActive}) => `font-semibold transition-colors hover:text-[#FF5DCD] ${isActive ? 'text-[#FF5DCD]' : 'text-gray-800'}`}>Inicio</NavLink>
                        <NavLink to="/about" className={({isActive}) => `font-semibold transition-colors hover:text-[#FF5DCD] ${isActive ? 'text-[#FF5DCD]' : 'text-gray-800'}`}>Quiénes Somos</NavLink>
                        <NavLink to="/contact" className={({isActive}) => `font-semibold transition-colors hover:text-[#FF5DCD] ${isActive ? 'text-[#FF5DCD]' : 'text-gray-800'}`}>Contáctanos</NavLink>
                    </nav>

                    {/* Mobile Menu Buttons */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={() => setIsSearchOpen(true)} aria-label="Abrir búsqueda">
                           <IconSearch className="w-6 h-6 text-gray-800" />
                        </button>
                        <button onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
                            <IconMenu className="w-7 h-7 text-gray-800" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Mobile Search Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeSearch}
                aria-hidden="true"
            />
            <div className={`fixed top-0 left-0 w-full z-50 transform transition-transform duration-300 md:hidden ${isSearchOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="p-4 bg-[#e6e9ef]/90 backdrop-blur-lg">
                    <SearchBar onSearch={closeSearch} autoFocus={isSearchOpen} />
                </div>
            </div>
            
            {/* Mobile Side Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeMenu}
                aria-hidden="true"
            />
            
            {/* Mobile Side Menu Panel */}
            <aside className={`fixed top-0 right-0 h-full w-4/5 max-w-xs z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                 <div className="h-full w-full glassmorphic bg-[#e6e9ef]/90">
                    <SideMenuContent />
                 </div>
            </aside>
        </>
    );
};


const Footer: React.FC<{ settings: StoreSettings }> = ({ settings }) => (
    <footer className="bg-transparent text-gray-800 p-6 mt-8">
      <div className="container mx-auto text-center">
        <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
                <p className="font-bold text-lg mb-2 font-arista">{settings.storeName}</p>
                <p className="text-sm">{settings.address}</p>
                 <div className="flex justify-center md:justify-start gap-4 my-4">
                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF5DCD] transition-colors">Instagram</a>
                    <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF5DCD] transition-colors">Facebook</a>
                    <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF5DCD] transition-colors">TikTok</a>
                </div>
            </div>
            <div className="text-center">
                <h3 className="font-bold font-arista mb-2">Horarios de Atención</h3>
                <ul className="text-sm">
                    <li>Lunes - Sábado: 7:30 AM – 7:30 PM</li>
                    <li>Domingo: 8:30 AM – 7:30 PM</li>
                </ul>
            </div>
             <div className="text-center md:text-right">
                <h3 className="font-bold font-arista mb-2">Navegación</h3>
                <ul className="text-sm">
                    <li><NavLink to="/" className="hover:text-[#FF5DCD]">Inicio</NavLink></li>
                    <li><NavLink to="/about" className="hover:text-[#FF5DCD]">Quiénes Somos</NavLink></li>
                    <li><NavLink to="/contact" className="hover:text-[#FF5DCD]">Contáctanos</NavLink></li>
                </ul>
            </div>
        </div>
        <div className="text-xs mt-8 pt-4 border-t border-gray-300 flex justify-center items-center">
            <NavLink to="/admin" className="hover:text-[#FF5DCD] transition-colors" title="Acceso de Administrador">
                <span>&copy; {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.</span>
            </NavLink>
        </div>
      </div>
    </footer>
);

// --- Audio Helper Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): GenaiBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Types ---
type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: string;
  imageUrl?: string | null;
  audioData?: string | null;
};

const Chatbot: React.FC<{ products: Product[], settings: StoreSettings }> = ({ products, settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: `¡Hola! Soy Laudith. ¿En qué te puedo ayudar hoy? Puedes preguntarme, enviarme una foto de un producto o usar el micrófono para hablar.` }], timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [imagePayload, setImagePayload] = useState<{b64: string, mime: string, url: string} | null>(null);

  // Voice Session State
  const [voiceSessionMode, setVoiceSessionMode] = useState<'off' | 'message' | 'call'>('off');
  const [liveTranscription, setLiveTranscription] = useState('');

  // Refs for Live API resources
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, liveTranscription]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput && !imagePayload) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessageHistory = messages.map(msg => ({ role: msg.role, parts: msg.parts }));

    setMessages(prev => [...prev, { role: 'user', parts: [{ text: trimmedInput }], timestamp, imageUrl: imagePayload?.url }]);
    setUserInput('');
    setImagePayload(null);
    setIsLoading(true);

    let botResponseText;
    if (imagePayload) {
        botResponseText = await gemini.analyzeImageWithPrompt(imagePayload.b64, imagePayload.mime, trimmedInput, products);
    } else if (isExpertMode) {
        botResponseText = await gemini.generateExpertResponse(userMessageHistory, trimmedInput, products);
        setIsExpertMode(false); // Reset after use
    } else {
        botResponseText = await gemini.generateChatbotResponse(userMessageHistory, trimmedInput, products);
    }
    
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: botResponseText }], timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setIsLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = (event.target?.result as string)?.split(',')[1];
      if (b64) {
        setImagePayload({ b64, mime: file.type, url: URL.createObjectURL(file) });
      }
    };
    // fix: Corrected typo from readDataURL to readAsDataURL.
    reader.readAsDataURL(file);
    e.target.value = ''; // Allow re-uploading the same file
  };
  
  const handlePlayAudio = async (text: string, index: number) => {
    const msg = messages[index];
    if (msg.audioData) { // Play from cache
      const audio = new Audio("data:audio/wav;base64," + msg.audioData);
      audio.play();
      return;
    }
    
    const audioB64 = await gemini.generateSpeech(text);
    if(audioB64) {
      setMessages(prev => prev.map((m, i) => i === index ? {...m, audioData: audioB64} : m));
      const audio = new Audio("data:audio/wav;base64," + audioB64);
      audio.play();
    }
  };
  
  // --- Voice Session Logic ---
  const stopVoiceSession = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if(mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setVoiceSessionMode('off');
    setLiveTranscription('');
  }, []);
  
  const startVoiceSession = async () => {
      const ai = gemini.getAiInstance();
      if (!ai) return;

      const inputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = inputAudioContext;
      const outputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      let nextStartTime = 0;
      let currentInputTranscription = '';
      let currentOutputTranscription = '';

      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

          sessionPromiseRef.current = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              callbacks: {
                  onopen: () => {
                      const source = inputAudioContext.createMediaStreamSource(stream);
                      mediaStreamSourceRef.current = source;
                      const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                      scriptProcessorRef.current = scriptProcessor;
                      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                          const pcmBlob = createBlob(inputData);
                          sessionPromiseRef.current?.then((session) => {
                              session.sendRealtimeInput({ media: pcmBlob });
                          });
                      };
                      source.connect(scriptProcessor);
                      scriptProcessor.connect(inputAudioContext.destination);
                  },
                  onmessage: async (message: LiveServerMessage) => {
                      if (message.serverContent?.inputTranscription) {
                          setLiveTranscription(currentInputTranscription + message.serverContent.inputTranscription.text);
                      }
                       if (message.serverContent?.outputTranscription) {
                          currentOutputTranscription += message.serverContent.outputTranscription.text;
                       }

                      const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                      if (base64Audio) {
                          nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                          const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                          const source = outputAudioContext.createBufferSource();
                          source.buffer = audioBuffer;
                          source.connect(outputAudioContext.destination);
                          source.start(nextStartTime);
                          nextStartTime += audioBuffer.duration;
                      }
                      
                      if(message.serverContent?.turnComplete) {
                        const finalInput = currentInputTranscription + (message.serverContent?.inputTranscription?.text || '');
                        const finalOutput = currentOutputTranscription;
                        if(finalInput.trim()) {
                            setMessages(prev => [...prev, {role: 'user', parts: [{text: finalInput}], timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]);
                        }
                        if(finalOutput.trim()) {
                            setMessages(prev => [...prev, {role: 'model', parts: [{text: finalOutput}], timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]);
                        }
                        currentInputTranscription = '';
                        currentOutputTranscription = '';
                        setLiveTranscription('');
                      }
                  },
                  onerror: (e: ErrorEvent) => stopVoiceSession(),
                  onclose: (e: CloseEvent) => {
                    stream.getTracks().forEach(track => track.stop());
                  },
              },
              config: {
                  responseModalities: [Modality.AUDIO],
                  inputAudioTranscription: {},
                  outputAudioTranscription: {},
              },
          });
      } catch (err) {
          console.error("Error getting user media", err);
          stopVoiceSession();
      }
  };

  const handleToggleVoiceMessage = () => {
    if (voiceSessionMode === 'message') {
      stopVoiceSession();
    } else if (voiceSessionMode === 'off') {
      setVoiceSessionMode('message');
      startVoiceSession();
    }
    // If call is active, do nothing.
  };

  const handleToggleCall = () => {
    if (voiceSessionMode === 'call') {
      stopVoiceSession();
    } else if (voiceSessionMode === 'off') {
      setVoiceSessionMode('call');
      startVoiceSession();
    }
     // If message is active, do nothing.
  };
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
        stopVoiceSession();
    };
  }, [stopVoiceSession]);


  return (
    <>
      <div className="fixed bottom-6 left-6 z-30">
        <button onClick={() => setIsOpen(!isOpen)} className="glassmorphic p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border-none">
          <IconChatBubble className="w-8 h-8 text-gray-800" />
        </button>
      </div>
      
      <div className={`fixed bottom-24 left-6 z-40 w-[calc(100%-3rem)] max-w-sm h-[70vh] glassmorphic rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="p-4 flex items-center border-b border-white/20 flex-shrink-0">
            <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 rounded-full mr-3 object-contain bg-white/50 p-1" />
            <div>
                <h3 className="font-bold text-gray-800 font-arista">Laudith</h3>
                <p className="text-xs text-gray-800">Asistente de {settings.storeName}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
                 <button onClick={handleToggleCall} className="p-2 text-gray-700 hover:text-gray-900 rounded-full transition-colors disabled:opacity-50" aria-label={voiceSessionMode === 'call' ? 'Finalizar llamada' : 'Iniciar llamada de voz'} disabled={voiceSessionMode === 'message'}>
                    {voiceSessionMode === 'call' ? <IconPhoneSlash className="w-6 h-6 text-red-500"/> : <IconPhone className="w-6 h-6"/>}
                </button>
                <button onClick={() => { setIsOpen(false); stopVoiceSession(); }}><IconX className="w-6 h-6 text-gray-800"/></button>
            </div>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl shadow-md relative group ${msg.role === 'user' ? 'bg-[#E7FFDB] text-gray-800 rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                       {msg.imageUrl && <img src={msg.imageUrl} alt="User upload" className="rounded-lg mb-2 max-w-full h-auto" />}
                        <p className="text-sm">{msg.parts[0].text}</p>
                        <p className={`text-xs mt-1 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
                        {msg.role === 'model' && msg.parts[0].text && (
                           <button onClick={() => handlePlayAudio(msg.parts[0].text, index)} className="absolute -bottom-3 -right-2 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                             <IconSpeakerWave className="w-4 h-4 text-gray-700"/>
                           </button>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-md">
                      <div className="typing-indicator"><span></span><span></span><span></span></div>
                  </div>
              </div>
            )}
             {(voiceSessionMode === 'message' || voiceSessionMode === 'call') && liveTranscription && (
                <div className="flex justify-end mb-3">
                    <div className="max-w-[85%] p-3 rounded-2xl shadow-md bg-[#E7FFDB] text-gray-500 rounded-br-none italic">
                        <p className="text-sm">{liveTranscription}...</p>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {voiceSessionMode === 'call' ? (
            <div className="p-4 border-t border-white/20 flex-shrink-0 text-center flex flex-col items-center justify-center">
                <p className="font-semibold text-gray-800">Llamada de voz activa...</p>
                <div className="typing-indicator my-2 justify-center"><span></span><span></span><span></span></div>
            </div>
        ) : (
            <div className="p-4 border-t border-white/20 flex-shrink-0">
                {imagePayload && (
                    <div className="relative mb-2 w-20 h-20">
                        <img src={imagePayload.url} alt="preview" className="rounded-lg w-full h-full object-cover"/>
                        <button onClick={() => setImagePayload(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><IconX className="w-4 h-4"/></button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-700 hover:text-gray-900 transition-colors"><IconPhoto className="w-6 h-6"/></button>
                    <button type="button" onClick={() => setIsExpertMode(!isExpertMode)} className="p-3 text-gray-700 hover:text-[#D4AF37] transition-colors"><IconSparkles isActive={isExpertMode} className="w-6 h-6"/></button>
                    
                    <input 
                        type="text"
                        value={voiceSessionMode === 'message' ? '' : userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={voiceSessionMode === 'message' ? "Escuchando..." : "Escribe un mensaje..."}
                        className="w-full p-3 bg-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-white/80 placeholder-gray-600 text-gray-800"
                        disabled={voiceSessionMode === 'message'}
                    />

                    <button type="button" onClick={handleToggleVoiceMessage} disabled={voiceSessionMode === 'call'} className={`p-3 rounded-full transition-colors ${voiceSessionMode === 'message' ? 'text-red-500' : 'text-gray-700'} disabled:opacity-50`}>
                        {voiceSessionMode === 'message' ? <IconStopCircle className="w-6 h-6"/> : <IconMicrophone className="w-6 h-6"/>}
                    </button>
                    <button type="submit" className="bg-[#00E0FF] text-gray-800 p-3 rounded-full disabled:bg-gray-400 disabled:opacity-50 transition-colors" disabled={isLoading || voiceSessionMode !== 'off' || (!userInput.trim() && !imagePayload)}>
                        <IconSend className="w-6 h-6"/>
                    </button>
                </form>
            </div>
        )}
      </div>
    </>
  );
};


type ViewMode = 'list' | 'grid-2' | 'grid-1';

const ProductCard: React.FC<{ product: Product; onAddToCart: () => void; viewMode: ViewMode; }> = ({ product, onAddToCart, viewMode }) => {
    
    const Badge = () => {
        if (!product.badge) return null;
        const badgeColor = BADGE_COLORS[product.badge] || 'bg-gray-500';
        return (
            <div className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full z-10 ${badgeColor}`}>
                {product.badge}
            </div>
        )
    }

    if (viewMode === 'list') {
        return (
            <div className="neomorphic-out group flex gap-4 w-full p-3 items-center relative">
                <Badge/>
                <Link to={`/product/${product.id}`} className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 block">
                    <img className="w-full h-full object-contain rounded-md group-hover:scale-105 transition-transform duration-300" src={product.images[0]} alt={product.name} />
                </Link>
                <div className="flex flex-col flex-grow self-stretch">
                    <Link to={`/product/${product.id}`} className="block flex-grow">
                        <p className="text-sm text-gray-800">{product.category}</p>
                        <h3 className="font-bold text-lg text-gray-800 font-arista">{product.name}</h3>
                    </Link>
                    <div className="flex justify-between items-center mt-auto pt-2">
                        <p className="text-xl font-semibold text-[#00E0FF]">${product.price.toFixed(2)}</p>
                        <button
                            onClick={(e) => { e.preventDefault(); onAddToCart(); }}
                            className="bg-[#FF5DCD] hover:bg-[#D4AF37] text-gray-800 font-bold p-2 rounded-full transition-colors duration-300 transform hover:scale-110 z-10 relative neomorphic-button">
                            <IconPlus className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // Grid views
    return (
        <div className="neomorphic-out group flex flex-col h-full relative">
            <Badge/>
            <Link to={`/product/${product.id}`} className="block">
                <img className="w-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-t-xl" src={product.images[0]} alt={product.name} />
                <div className="p-3 flex-grow">
                    <p className="text-xs text-gray-800">{product.category}</p>
                    <h3 className="font-bold text-base text-gray-800 font-arista leading-tight">{product.name}</h3>
                </div>
            </Link>
            <div className="p-3 mt-auto">
                <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-[#00E0FF]">${product.price.toFixed(2)}</p>
                    <button
                        onClick={(e) => { e.preventDefault(); onAddToCart(); }}
                        className="bg-[#FF5DCD] hover:bg-[#D4AF37] text-gray-800 font-bold p-2 rounded-full transition-colors duration-300 transform hover:scale-110 z-10 relative neomorphic-button">
                        <IconPlus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const FilterModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
}> = ({ isOpen, onClose, selectedCategory, onSelectCategory }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex justify-center items-end" onClick={onClose}>
            <div className="w-full bg-[#e6e9ef] rounded-t-2xl p-4 transform transition-transform duration-300 translate-y-0 animate-slide-up" style={{ animation: 'slide-up 0.3s ease-out forwards' }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold font-arista text-gray-800">Filtros</h3>
                    <button onClick={onClose}><IconX className="w-6 h-6"/></button>
                </div>
                <ul className="space-y-2">
                    <li>
                        <button
                        onClick={() => { onSelectCategory(null); onClose(); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-lg ${!selectedCategory ? 'bg-[#9AD5FA] text-gray-800 font-bold' : 'hover:bg-gray-200/50'}`}
                        >
                        Todas las Categorías
                        </button>
                    </li>
                    {CATEGORIES.map(category => (
                        <li key={category}>
                        <button
                            onClick={() => { onSelectCategory(category); onClose(); }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-lg ${selectedCategory === category ? 'bg-[#9AD5FA] text-gray-800 font-bold' : 'hover:bg-gray-200/50'}`}
                        >
                            {category}
                        </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


const Filters: React.FC<{ selectedCategory: string | null; onSelectCategory: (category: string | null) => void; }> = ({ selectedCategory, onSelectCategory }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="p-4 rounded-lg neomorphic-out">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left font-bold text-lg text-[#FF5DCD] mb-2">
        Categorías <IconChevronDown className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onSelectCategory(null)}
              className={`w-full text-left px-2 py-1 rounded-md transition-colors ${!selectedCategory ? 'bg-[#9AD5FA] text-gray-800' : 'hover:bg-gray-200/50'}`}
            >
              Todas
            </button>
          </li>
          {CATEGORIES.map(category => (
            <li key={category}>
              <button
                onClick={() => onSelectCategory(category)}
                className={`w-full text-left px-2 py-1 rounded-md transition-colors ${selectedCategory === category ? 'bg-[#9AD5FA] text-gray-800' : 'hover:bg-gray-200/50'}`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const OrderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  clearCart: () => void;
}> = ({ isOpen, onClose, cart, settings, clearCart }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    let message = `¡Hola ${settings.storeName}! 👋\n\nMi nombre es ${name} y me gustaría hacer el siguiente pedido:\n\n`;
    cart.forEach(item => {
      message += `*${item.name}* (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total Estimado:* $${total.toFixed(2)}\n`;
    message += `\n*Dirección de entrega:*\n${address}\n\n¡Muchas gracias!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${settings.whatsappNumber.replace(/\+/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="neomorphic-out rounded-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
          <IconX className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center text-[#FF5DCD] mb-4 font-arista">Finalizar Pedido</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Nombre Completo</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
          </div>
          <div className="mb-6">
            <label htmlFor="address" className="block text-gray-700 font-semibold mb-1">Dirección de Entrega</label>
            <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
          </div>
          <button type="submit" className="w-full bg-[#00E0FF] hover:bg-[#9AD5FA] text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors duration-300 neomorphic-out neomorphic-button">
            Enviar Pedido por WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
};

const FloatingCart: React.FC<ClientUIProps> = (props) => {
  const { cart, removeFromCart, updateQuantity } = props;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-30">
        <button onClick={() => setIsCartOpen(!isCartOpen)} className="bg-gradient-to-br from-[#FF5DCD] to-[#FFA6E3] text-gray-800 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center gap-2 neomorphic-button">
          <IconCart className="w-8 h-8" />
          {cartCount > 0 && <span className="bg-white text-[#FF5DCD] rounded-full px-2 py-0.5 text-sm font-bold">{cartCount}</span>}
        </button>
      </div>

      <div className={`fixed top-0 right-0 h-full w-full md:w-96 neomorphic-out shadow-2xl z-40 transform transition-transform duration-500 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-[#FF5DCD] font-arista">Tu Carrito</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-600 hover:text-gray-900"><IconX className="w-7 h-7" /></button>
          </div>
          
          {cart.length === 0 ? (
            <p className="text-center text-gray-600 flex-grow flex items-center justify-center">Tu carrito está vacío.</p>
          ) : (
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 mb-4 bg-transparent p-2 rounded-lg">
                  <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-md object-contain"/>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-[#00E0FF] font-bold">${item.price.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full neomorphic-out neomorphic-button"><IconMinus className="w-4 h-4"/></button>
                      <span className="px-3 font-bold text-gray-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full neomorphic-out neomorphic-button"><IconPlus className="w-4 h-4"/></button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700"><IconTrash className="w-5 h-5"/></button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-white/80 pt-4 mt-auto flex-shrink-0">
            <div className="flex justify-between font-bold text-lg mb-4 text-gray-800">
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => {
                setIsCartOpen(false);
                setIsOrderModalOpen(true);
              }}
              disabled={cart.length === 0}
              className="w-full bg-[#00E0FF] hover:bg-[#9AD5FA] text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed neomorphic-out neomorphic-button"
            >
              Proceder al Pedido
            </button>
          </div>
        </div>
      </div>
      <OrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} cart={props.cart} settings={props.settings} clearCart={props.clearCart}/>
    </>
  );
};


export const ClientLayout: React.FC<ClientUIProps> = (props) => (
    <div className="flex flex-col min-h-screen bg-transparent">
        <Header settings={props.settings} />
        <main className="flex-grow text-gray-800">
            <Outlet />
        </main>
        <Footer settings={props.settings} />
        <Chatbot products={props.products} settings={props.settings} />
        <FloatingCart {...props} />
    </div>
);


export const HomePage: React.FC<Omit<ClientUIProps, 'cart' | 'removeFromCart' | 'updateQuantity' | 'clearCart'>> = (props) => {
  const { products, addToCart } = props;
  const [viewMode, setViewMode] = useState<ViewMode>('grid-2');
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const productContainerRef = useRef<HTMLDivElement>(null);

  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('cat') || null;

  const filteredProducts = useMemo(() => {
    let results = products;
    if (selectedCategory) {
      results = results.filter(p => p.category === selectedCategory);
    }
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(lowerCaseQuery) ||
        p.description.toLowerCase().includes(lowerCaseQuery) ||
        p.category.toLowerCase().includes(lowerCaseQuery) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
      );
    }
    return results;
  }, [products, selectedCategory, query]);

  const gridLayoutClasses = useMemo(() => {
    switch (viewMode) {
      case 'list':
        return 'flex flex-col gap-4';
      case 'grid-1':
        return 'grid grid-cols-1 gap-4';
      case 'grid-2':
      default:
        return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4';
    }
  }, [viewMode]);

  useEffect(() => {
    // Scroll to results when a filter or search is applied
    if ((query || selectedCategory !== null) && productContainerRef.current) {
        setTimeout(() => {
             productContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
  }, [query, selectedCategory]);

  const handleCategorySelect = (category: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('cat', category);
    } else {
      newParams.delete('cat');
    }
    setSearchParams(newParams);
  };
  
  const Toolbar: React.FC = () => {
    const buttonClass = (mode: ViewMode) => 
      `p-2 rounded-lg transition-colors neomorphic-button ${viewMode === mode ? 'neomorphic-in' : 'bg-transparent text-gray-600 hover:bg-[#9AD5FA]/50'}`;
  
    return (
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-800">{filteredProducts.length} productos</p>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsFilterModalOpen(true)}
                className="md:hidden p-2 rounded-lg neomorphic-out neomorphic-button flex items-center gap-2"
            >
                <IconFilter className="w-5 h-5"/>
                <span className="text-sm font-semibold">Filtros</span>
            </button>
            <div className="flex items-center gap-2 p-1 rounded-lg neomorphic-out">
                <button onClick={() => setViewMode('list')} className={buttonClass('list')} aria-label="Vista de lista">
                    <IconQueueList className="w-6 h-6" />
                </button>
                <button onClick={() => setViewMode('grid-1')} className={buttonClass('grid-1')} aria-label="Vista de una columna">
                    <IconViewColumn className="w-6 h-6" />
                </button>
                <button onClick={() => setViewMode('grid-2')} className={buttonClass('grid-2')} aria-label="Vista de dos columnas">
                    <IconSquares2x2 className="w-6 h-6" />
                </button>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      <aside className="hidden md:block md:col-span-1 md:sticky md:top-24">
        <Filters selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />
      </aside>
      <div className="md:col-span-3">
        <div ref={productContainerRef} className="scroll-mt-24">
            <Toolbar />
        </div>
        <div className={gridLayoutClasses}>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product, 1)} viewMode={viewMode} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
            <div className="text-center p-8 col-span-full neomorphic-out rounded-lg">
                <p className="text-gray-800">No se encontraron productos que coincidan con tu búsqueda.</p>
            </div>
        )}
      </div>
      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
    </div>
  );
};