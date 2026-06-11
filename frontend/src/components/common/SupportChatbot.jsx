import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Tag, Truck, ShieldCheck, User } from 'lucide-react';
import api from '../../services/api';
import Button from './Button';

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your NexusCart virtual assistant. How can I help you today? Feel free to type a message or select a quick option below.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const addBotReply = (replyText) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { sender: 'bot', text: replyText }]);
    }, 600);
  };

  const handleQuickOption = (option) => {
    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: option.label }]);

    // Trigger bot reply
    addBotReply(option.reply);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    
    // Add user message to UI immediately
    const updatedMessages = [...messages, { sender: 'user', content: userText, text: userText }];
    setMessages(updatedMessages);
    setInputText('');
    setTyping(true);

    try {
      // Send to AI endpoint
      const { data } = await api.post('/ai/chat', { 
        message: userText, 
        history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })) 
      });
      
      setTyping(false);
      setMessages((prev) => [...prev, { sender: 'bot', text: data.message, content: data.message }]);
    } catch (error) {
      console.error('Chatbot API Error:', error);
      setTyping(false);
      setMessages((prev) => [...prev, { sender: 'bot', text: "I'm having trouble connecting to my AI core right now. Please try again later.", content: "Error" }]);
    }
  };

  const quickOptions = [
    {
      label: 'Active Promos',
      icon: Tag,
      reply: 'Our active promo codes are: ECO20 (20% discount), NEXUS10 (10% discount), and WELCOME5 (flat $5.00 off). You can apply them in the cart drawer or checkout summary!',
    },
    {
      label: 'Eco-Shipping',
      icon: Truck,
      reply: 'We offer 100% carbon-neutral, zero-plastic eco-shipping. Delivery is FREE on orders above $100. For orders under $100, shipping is a flat fee of $10.',
    },
    {
      label: 'Returns policy',
      icon: ShieldCheck,
      reply: 'We offer a 30-Day Money Back Guarantee and free returns. If you want to return a completed order, you can print the invoice receipt from your Profile page and contact us.',
    },
    {
      label: 'Talk to Live Agent',
      icon: User,
      reply: 'A customer support notification has been dispatched. One of our live agents will contact you shortly at your registered email address.',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Widget */}
      {isOpen && (
        <div className="w-[340px] sm:w-[360px] h-[450px] bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/60 dark:border-dark-850 shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-6 duration-300 transition-colors">
          {/* Header */}
          <div className="bg-slate-50 dark:bg-dark-950 px-5 py-4 border-b border-slate-150 dark:border-dark-850 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary-600/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-dark-950 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-250 uppercase tracking-wide">Nexus Assistant</h4>
                <p className="text-[9px] text-slate-400 font-semibold">Active & Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-900 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Panel */}
          <div ref={messagesContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-100 dark:bg-dark-950 text-slate-800 dark:text-slate-250 rounded-bl-none border border-slate-200/40 dark:border-dark-850'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-dark-950 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-200/40 dark:border-dark-850 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Option Selectors */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-dark-850/60 flex gap-2 overflow-x-auto shrink-0 bg-slate-50/30 dark:bg-dark-950/20">
            {quickOptions.map((opt, idx) => {
              const Icon = opt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleQuickOption(opt)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-800 rounded-xl text-[10px] font-bold shrink-0 shadow-xs hover:border-slate-350 dark:hover:border-dark-700 transition-all active:scale-95"
                >
                  <Icon size={10} className="text-primary-600 dark:text-primary-450" />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Text Send Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-150 dark:border-dark-850 flex gap-2 bg-slate-50 dark:bg-dark-950 transition-colors shrink-0"
          >
            <input
              type="text"
              placeholder="Type your question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="form-input flex-grow py-2 px-3.5 text-xs bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 rounded-xl focus:ring-1 focus:ring-primary-600"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:hover:bg-primary-600 text-white rounded-xl transition-all duration-300 shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Floating launcher Button with pulsing rings */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-4 rounded-full bg-primary-600 hover:bg-primary-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-350 group"
        aria-label="Toggle support chatbot"
      >
        {/* Pulsing ring overlays */}
        <span className="absolute inset-0 rounded-full bg-primary-500/30 border border-primary-500/20 scale-110 animate-ping group-hover:scale-120 duration-1000 -z-10 pointer-events-none"></span>
        <span className="absolute inset-0 rounded-full bg-primary-500/10 border border-primary-500/10 scale-120 animate-pulse duration-1000 -z-10 pointer-events-none"></span>

        {isOpen ? <X size={22} className="rotate-90 transition-transform duration-300" /> : <MessageSquare size={22} className="transition-transform duration-300" />}
      </button>
    </div>
  );
};

export default SupportChatbot;
