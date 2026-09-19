import React, { useState, useRef, useEffect } from 'react';

export default function AIAssistantWidget({ API_URL, token, mode = 'floating', prompts = [], contextData = null }) {
  // mode can be 'floating', 'sidebar-button', 'inline', 'dashboard-button', 'embedded'
  const [isOpen, setIsOpen] = useState(mode === 'inline' || mode === 'embedded');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am the CCA AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash-lite');
  const [activeTab, setActiveTab] = useState('chat');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'analytics') {
      setAnalyticsLoading(true);
      fetch(`${API_URL}/ai/predictive-analytics`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setAnalyticsData(data))
      .catch(err => {
        console.error("Failed to fetch analytics:", err);
        setAnalyticsData({ error: "Unauthorized or failed to load predictive analytics." });
      })
      .finally(() => setAnalyticsLoading(false));
    }
  }, [activeTab, token, API_URL]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
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
        body: JSON.stringify({ 
          message: userMessage, 
          model: selectedModel, 
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content })),
          context_data: contextData
        })
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
        ? 'w-full h-full rounded-2xl shadow-sm border flex-1 min-h-[400px] max-h-[600px]' 
        : 'fixed bottom-24 right-6 w-96 sm:w-[480px] rounded-xl shadow-2xl border z-50 h-[550px] max-h-[calc(100vh-120px)]'
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
            <div className="flex flex-col gap-1 mt-1">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-[10px] bg-brand-700/50 text-white border border-brand-500 rounded px-1.5 py-0.5 outline-none hover:bg-brand-700"
              >
                <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Fastest)</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Standard)</option>
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Advanced)</option>
              </select>
              <p className="text-[9px] text-brand-200">Rate Limit: 15 RPM / 1M TPM / 1500 RPD</p>
            </div>
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

      {/* Tabs */}
      <div className="flex bg-brand-700 text-brand-100 text-xs font-semibold">
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`flex-1 py-2 text-center transition-colors ${activeTab === 'chat' ? 'bg-white text-brand-700 border-t-2 border-brand-500' : 'hover:bg-brand-600'}`}>
          Chat Assistant
        </button>
      </div>

      {activeTab === 'chat' ? (
        <>
          {/* Messages */}
          <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
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
        </>
      ) : (
        <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col gap-4 text-sm">
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Generating ML Forecasts...</div>
          ) : analyticsData?.error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{analyticsData.error}</div>
          ) : analyticsData?.message ? (
             <div className="bg-brand-50 text-brand-700 p-4 rounded-lg border border-brand-200">{analyticsData.message}</div>
          ) : analyticsData ? (
            <div className="flex flex-col gap-4 pb-4">
              <h3 className="font-bold text-lg text-brand-700 border-b-2 border-brand-200 pb-2 mb-2">{analyticsData.dashboard_title}</h3>
              
              {/* PRINCIPAL / SUPERADMIN */}
              {(analyticsData.role_type === 'Principal' || analyticsData.role_type === 'Superadmin') && (
                <>
                  <h4 className="font-bold text-slate-700">School-wide Enrollment Forecast</h4>
                  <div className="bg-white p-3 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-brand-600">{analyticsData.enrollment_forecast?.projected_enrollment}</div>
                      <div className="text-xs text-slate-500">Projected Next Year</div>
                    </div>
                    <div className={`flex flex-col items-end ${analyticsData.enrollment_forecast?.trend === 'upward' ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="font-bold text-lg">+{analyticsData.enrollment_forecast?.growth_rate_pct}%</div>
                      <div className="text-xs">from {analyticsData.enrollment_forecast?.current_enrollment}</div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-700 mt-2">Revenue Projection</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-lg border shadow-sm flex flex-col items-center text-center">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Due</div>
                      <div className="font-bold text-slate-700 mt-1">₱{((analyticsData.revenue_projection?.total_due || 0)/1000).toFixed(0)}k</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border shadow-sm flex flex-col items-center text-center">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Expected (30d)</div>
                      <div className="font-bold text-green-600 mt-1">₱{((analyticsData.revenue_projection?.next_30_days_expected || 0)/1000).toFixed(0)}k</div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-700 mt-2">High-Risk Dropouts (AI Flagged)</h4>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {analyticsData.high_risk_dropouts?.map((st, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border shadow-sm border-l-4 border-l-red-500">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-bold text-slate-700 text-xs">{st.student_name} <span className="text-slate-400 font-normal">({st.grade_level})</span></div>
                          <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{st.severity}</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight"><span className="font-semibold text-slate-600">Explanation:</span> {st.reason}</div>
                      </div>
                    ))}
                    {(!analyticsData.high_risk_dropouts || analyticsData.high_risk_dropouts.length === 0) && (
                      <div className="text-xs text-slate-500 italic">No high risk students detected.</div>
                    )}
                  </div>
                </>
              )}

              {/* CASHIER */}
              {analyticsData.role_type === 'Cashier' && (
                <>
                  <h4 className="font-bold text-slate-700">Collection Risk Forecast</h4>
                  <div className="bg-white p-3 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-brand-600">{analyticsData.collection_forecast?.collection_rate}%</div>
                      <div className="text-xs text-slate-500">Current Collection Rate</div>
                    </div>
                    <div className="flex flex-col items-end text-red-600">
                      <div className="font-bold text-lg">₱{((analyticsData.collection_forecast?.overdue_amount || 0)/1000).toFixed(0)}k</div>
                      <div className="text-xs">Total Overdue Risk</div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-700 mt-2">High-Risk Accounts (AI Flagged)</h4>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {analyticsData.high_risk_accounts?.map((st, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border shadow-sm border-l-4 border-l-red-500">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-bold text-slate-700 text-xs">{st.student_name} <span className="text-slate-400 font-normal">({st.grade_level})</span></div>
                          <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{st.severity}</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight mb-1"><span className="font-semibold text-slate-600">Outstanding:</span> ₱{st.outstanding_balance?.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500 leading-tight"><span className="font-semibold text-slate-600">Explanation:</span> {st.reason}</div>
                      </div>
                    ))}
                    {(!analyticsData.high_risk_accounts || analyticsData.high_risk_accounts.length === 0) && (
                      <div className="text-xs text-slate-500 italic">No high risk accounts detected.</div>
                    )}
                  </div>
                </>
              )}

              {/* REGISTRAR */}
              {analyticsData.role_type === 'Registrar' && (
                <>
                  <h4 className="font-bold text-slate-700">Enrollment Pipeline</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col items-center">
                      <div className="text-2xl font-black text-brand-600">{analyticsData.enrollment_pipeline?.conversion_rate}%</div>
                      <div className="text-[10px] text-slate-500 text-center mt-1">Application Conversion</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col items-center">
                      <div className="text-2xl font-black text-orange-500">{analyticsData.enrollment_pipeline?.incomplete_requirements}</div>
                      <div className="text-[10px] text-slate-500 text-center mt-1">Incomplete Requirements</div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-700 mt-2">Clearance Bottlenecks (AI Identified)</h4>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {analyticsData.bottlenecks?.map((st, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border shadow-sm border-l-4 border-l-orange-500">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-bold text-slate-700 text-xs">{st.student_name}</div>
                          <div className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{st.department}</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight"><span className="font-semibold text-slate-600">Explanation:</span> {st.reason}</div>
                      </div>
                    ))}
                    {(!analyticsData.bottlenecks || analyticsData.bottlenecks.length === 0) && (
                      <div className="text-xs text-slate-500 italic">No clearance bottlenecks detected.</div>
                    )}
                  </div>
                </>
              )}

              {/* TEACHER */}
              {analyticsData.role_type === 'Teacher' && (
                <>
                  <h4 className="font-bold text-slate-700">Academic Trajectory</h4>
                  <div className="bg-white p-3 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-brand-600">{analyticsData.academic_trajectory?.class_average}%</div>
                      <div className="text-xs text-slate-500">{analyticsData.academic_trajectory?.section_name} Avg</div>
                    </div>
                    <div className={`flex flex-col items-end ${analyticsData.academic_trajectory?.trend_forecast === 'Stable' ? 'text-green-600' : 'text-orange-500'}`}>
                      <div className="font-bold text-sm">{analyticsData.academic_trajectory?.trend_forecast}</div>
                      <div className="text-xs">{analyticsData.academic_trajectory?.student_count} Students</div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-700 mt-2">At-Risk Students (AI Flagged)</h4>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {analyticsData.at_risk_students?.map((st, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border shadow-sm border-l-4 border-l-red-500">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-bold text-slate-700 text-xs">{st.student_name}</div>
                          <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{st.severity}</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight mb-1"><span className="font-semibold text-slate-600">Subject:</span> {st.subject} <span className="ml-2 font-semibold">Score:</span> {st.current_score}</div>
                        <div className="text-[10px] text-slate-500 leading-tight"><span className="font-semibold text-slate-600">Explanation:</span> {st.reason}</div>
                      </div>
                    ))}
                    {(!analyticsData.at_risk_students || analyticsData.at_risk_students.length === 0) && (
                      <div className="text-xs text-slate-500 italic">No at-risk students detected in this section.</div>
                    )}
                  </div>
                </>
              )}

            </div>
          ) : null}
        </div>
      )}
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
