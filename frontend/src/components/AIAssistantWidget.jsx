import React, { useState, useRef, useEffect } from 'react';

export default function AIAssistantWidget({ API_URL, token, mode = 'floating', prompts = [] }) {
  // mode can be 'floating', 'sidebar-button', 'inline', 'dashboard-button', 'embedded'
  const [isOpen, setIsOpen] = useState(mode === 'inline' || mode === 'embedded');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am the CCA AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !token) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userMessage, history: messages.slice(1).map(m => ({ role: m.role, content: m.content })) })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process your request right now." }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process your request right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const ChatUI = (
    <div className={`flex flex-col bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 overflow-hidden ${
      (mode === 'inline' || mode === 'embedded')
        ? 'w-full h-full rounded-2xl shadow-sm border flex-1 min-h-[400px]' 
        : 'fixed bottom-24 right-6 w-80 sm:w-96 rounded-xl shadow-2xl border z-50 h-[500px] max-h-[calc(100vh-120px)]'
    }`}>
      {/* Header */}
      <div className="bg-brand-600 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 15.3m14.8 0l.853 10.218A.809.809 0 0119.846 27h-15.692a.809.809 0 01-.807-1.482L5 15.3" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-sm">CCA AI Assistant</h3>
            <p className="text-xs text-brand-100">Powered by Gemini</p>
          </div>
        </div>
        {mode !== 'inline' && mode !== 'embedded' && (
          <button onClick={() => setIsOpen(false)} className="text-brand-100 hover:text-white focus:outline-none transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col gap-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-tr-sm shadow-md' 
                : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 p-3 rounded-xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pre-Command Suggestions (embedded mode only) */}
      {mode === 'embedded' && prompts && prompts.length > 0 && messages.length === 1 && (
        <div className="px-3 pt-2 pb-1 bg-white dark:bg-slate-800 flex flex-wrap gap-2">
          {prompts.map((cmd, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setInput(cmd); }}
              className="text-[11px] font-bold px-3 py-1.5 bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-300 rounded-full border border-brand-200 dark:border-slate-600 hover:bg-brand-100 dark:hover:bg-slate-600 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about CCA..."
          className="flex-1 bg-slate-100 dark:bg-slate-700 border-transparent focus:bg-white dark:focus:bg-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-full px-4 py-2.5 text-sm dark:text-white outline-none transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md focus:outline-none"
        >
          <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );

  if (mode === 'inline' || mode === 'embedded') return ChatUI;

  return (
    <>
      {mode === 'floating' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 hover:shadow-xl transition-all flex items-center justify-center z-50 focus:outline-none"
          aria-label="Toggle AI Assistant"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </button>
      )}

      {mode === 'sidebar-button' && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center px-4 py-3 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 rounded-xl transition-colors font-bold text-sm mb-4 border border-brand-200 dark:border-brand-800"
        >
          <svg className="w-5 h-5 mr-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          CCA AI Assistant
        </button>
      )}

      {mode === 'dashboard-button' && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center px-6 py-3 bg-brand-600 text-white rounded-xl shadow-md hover:bg-brand-700 hover:shadow-lg transition-all font-bold text-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Ask AI Assistant
        </button>
      )}

      {/* Shared Popup Window for non-inline modes */}
      {isOpen && mode !== 'inline' && ChatUI}
    </>
  );
}
