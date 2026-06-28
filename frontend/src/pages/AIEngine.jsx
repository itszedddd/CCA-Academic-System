import React, { useState, useEffect } from 'react';

export default function AIEngine({ authFetch, API, currentRole }) {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // We can fetch this directly since we made it public, but using authFetch works too
    authFetch(`${API}/ai/model_summary`)
      .then(res => {
        if (!res?.ok) throw new Error('Failed to fetch AI diagnostics');
        return res.json();
      })
      .then(data => {
        setModelData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [API, authFetch]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-30 animate-pulse"></div>
          <div className="w-16 h-16 border-4 border-slate-800 dark:border-slate-700 border-t-cyan-400 rounded-full animate-spin relative z-10"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30 text-center shadow-lg">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold mb-2">Diagnostic Engine Offline</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-8 md:p-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Models Active & Learning</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-4">
              AI Engine Diagnostics
            </h1>
            <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
              Live telemetry and architectural overview of the machine learning algorithms actively monitoring student performance and tuition risk.
            </p>
          </div>
          
          {/* Status Rings */}
          <div className="flex gap-4">
            {[
              { label: 'Latency', value: '14ms', color: 'text-cyan-400' },
              { label: 'Uptime', value: '99.9%', color: 'text-emerald-400' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center w-24 h-24 rounded-full border border-slate-700/50 bg-slate-800/50 backdrop-blur-md shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]">
                <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {modelData?.models.map((model, i) => (
          <div key={i} className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-colors duration-500 pointer-events-none"></div>
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {model.name}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 inline-block px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    {model.type} · {model.algorithm}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center border border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  {i === 0 ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                </div>
              </div>

              {/* Feature Engineering */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                  <span className="w-8 h-px bg-slate-200 dark:bg-slate-700 mr-3"></span>
                  Input Feature Vectors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {model.features.map((f, idx) => (
                    <div key={idx} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all cursor-default shadow-sm">
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Model Output</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                    {model.output}
                  </p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hyperparameters</h4>
                  <div className="space-y-1.5">
                    {Object.entries(model.hyperparameters).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 dark:text-slate-400">{k}</span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-50 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Training Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[60px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Training Pipeline</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-800 dark:text-white">Architecture:</strong> {modelData?.training_approach}. 
              The system utilizes <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600 dark:text-pink-400">{modelData?.preprocessing}</code> to ensure scale-invariant feature processing before feeding tensors to the ensemble estimators.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
