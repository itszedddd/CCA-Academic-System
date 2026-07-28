import React, { useState, useEffect, useRef } from 'react';

const REPORT_TYPES = [
  {
    id: 'institutional_summary',
    title: 'Institutional Summary',
    description: 'Complete school health overview — enrollment, academics, finance, and attendance.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    roles: ['Principal'],
    color: 'from-purple-500 to-indigo-600',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-900/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800/40',
  },
  {
    id: 'academic_performance',
    title: 'Academic Performance',
    description: 'Subject analysis, at-risk students, grade distributions, and AI early warning results.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    roles: ['Principal', 'Teacher'],
    color: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800/40',
  },
  {
    id: 'tuition_finance',
    title: 'Tuition & Finance',
    description: 'Revenue analysis, collection rates, high-risk accounts, and payment patterns.',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    roles: ['Principal', 'Cashier'],
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800/40',
  },
  {
    id: 'attendance_analysis',
    title: 'Attendance Analysis',
    description: 'Section breakdown, chronic absenteeism, late arrival patterns, and recommendations.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    roles: ['Principal', 'Teacher'],
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-900/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
  },
  {
    id: 'student_profile',
    title: 'Student Profile',
    description: 'Individual student report — academic history, attendance, tuition, and AI risk flags.',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    roles: ['Principal', 'Teacher', 'Registrar'],
    color: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-900/20',
    textColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-200 dark:border-rose-800/40',
  },
];

export default function AIReports({ authFetch, API, currentRole, students }) {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  const availableReports = REPORT_TYPES.filter(r => r.roles.includes(currentRole));

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
    String(s.id).includes(studentSearch)
  );

  const handleGenerate = async () => {
    if (!selectedType) return;
    if (selectedType === 'student_profile' && !selectedStudentId) {
      setError('Please select a student for the Student Profile report.');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const payload = {
        report_type: selectedType,
        ...(selectedType === 'student_profile' && selectedStudentId ? { student_id: parseInt(selectedStudentId) } : {}),
      };

      const res = await authFetch(`${API}/ai/generate_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res?.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to generate report');
      }

      const data = await res.json();
      setReport(data);

      // Scroll to report after a short delay
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setReport(null);
    setSelectedType(null);
    setSelectedStudentId('');
    setStudentSearch('');
    setError(null);
  };

  const selectedReportConfig = REPORT_TYPES.find(r => r.id === selectedType);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">

      {/* ===== Header Section ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-8 md:p-12 print:hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/15 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Gemini AI Powered</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-4">
              AI Report Generator
            </h1>
            <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
              Generate comprehensive institutional and student reports in seconds using AI-powered analysis of real school data.
            </p>
          </div>

          {/* Status Rings */}
          <div className="flex gap-4">
            {[
              { label: 'Reports', value: availableReports.length, color: 'text-amber-400' },
              { label: 'AI Model', value: 'Gemini', color: 'text-emerald-400' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center w-24 h-24 rounded-full border border-slate-700/50 bg-slate-800/50 backdrop-blur-md shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]">
                <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Report Selector (hidden when report is shown) ===== */}
      {!report && (
        <>
          {/* Report Type Cards */}
          <div className="print:hidden">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center">
              <span className="w-8 h-px bg-slate-300 dark:bg-slate-700 mr-3"></span>
              Select Report Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {availableReports.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => { setSelectedType(rt.id); setError(null); }}
                  className={`group relative text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    selectedType === rt.id
                      ? `${rt.borderColor} ${rt.bgLight} ${rt.bgDark} shadow-lg ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-current ${rt.textColor}`
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    selectedType === rt.id
                      ? `bg-gradient-to-br ${rt.color} text-white shadow-lg`
                      : `${rt.bgLight} ${rt.bgDark} ${rt.textColor}`
                  }`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={rt.icon} />
                    </svg>
                  </div>
                  <h3 className={`font-bold text-lg mb-1 ${selectedType === rt.id ? rt.textColor : 'text-slate-800 dark:text-white'}`}>
                    {rt.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {rt.description}
                  </p>

                  {/* Check mark */}
                  {selectedType === rt.id && (
                    <div className={`absolute top-4 right-4 w-7 h-7 rounded-full bg-gradient-to-br ${rt.color} flex items-center justify-center shadow-lg`}>
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Student Selector (for Student Profile) */}
          {selectedType === 'student_profile' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg print:hidden">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Select Student
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all text-sm"
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {(studentSearch || selectedStudentId) && (
                <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400 text-center">No students found.</div>
                  ) : (
                    filteredStudents.slice(0, 20).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedStudentId(String(s.id)); setStudentSearch(`${s.first_name} ${s.last_name}`); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                          selectedStudentId === String(s.id)
                            ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                          {s.first_name[0]}{s.last_name[0]}
                        </div>
                        <div>
                          <span className="font-medium">{s.first_name} {s.last_name}</span>
                          <span className="text-slate-400 ml-2">· {s.grade_level} {s.section ? `(${s.section})` : ''}</span>
                        </div>
                        {selectedStudentId === String(s.id) && (
                          <svg className="w-5 h-5 ml-auto text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/30 text-sm font-medium flex items-center gap-3 print:hidden">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Generate Button */}
          {selectedType && (
            <div className="flex justify-center print:hidden">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r ${selectedReportConfig?.color || 'from-slate-700 to-slate-800'}`}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Generate {selectedReportConfig?.title || ''} Report</span>
                  </>
                )}

                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${selectedReportConfig?.color || ''} blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10`}></div>
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6 print:hidden">
              <div className="relative">
                <div className={`absolute -inset-6 bg-gradient-to-r ${selectedReportConfig?.color || 'from-slate-400 to-slate-500'} rounded-full blur-lg opacity-30 animate-pulse`}></div>
                <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-700 border-t-current rounded-full animate-spin relative z-10" style={{ borderTopColor: 'currentColor' }}></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">AI is analyzing your data...</p>
                <p className="text-sm text-slate-400 mt-1">Gemini is generating a comprehensive report. This may take a few seconds.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== Generated Report Display ===== */}
      {report && (
        <div ref={reportRef}>
          {/* Action Bar (print hidden) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-200 dark:border-slate-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              New Report
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-bold shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Download PDF
            </button>
          </div>

          {/* Report Paper */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden print:rounded-none print:shadow-none print:border-none">
            
            {/* Report Header */}
            <div className={`relative bg-gradient-to-r ${selectedReportConfig?.color || 'from-slate-700 to-slate-800'} p-8 md:p-12 text-white print:bg-none print:text-black`}>
              <div className="absolute inset-0 bg-black/10 print:hidden"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 opacity-80">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center print:bg-slate-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={selectedReportConfig?.icon || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'} />
                    </svg>
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest opacity-90 print:text-slate-600">Calvary Christian Academy</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 print:text-slate-900">
                  {report.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm opacity-80 print:text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {report.generated_at}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {report.model_used}
                  </span>
                </div>
              </div>
            </div>

            {/* Report Body */}
            <div className="p-8 md:p-12 space-y-10">
              {report.sections.map((section, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${selectedReportConfig?.color || 'from-slate-500 to-slate-600'} shadow-md print:bg-slate-700`}>
                      {idx + 1}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white print:text-slate-900">
                      {section.heading}
                    </h3>
                  </div>
                  <div className="pl-11">
                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-[15px] print:text-slate-700">
                      {section.content}
                    </div>
                  </div>

                  {/* Divider between sections */}
                  {idx < report.sections.length - 1 && (
                    <div className="mt-8 border-b border-slate-100 dark:border-slate-700/50 print:border-slate-200"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Report Footer */}
            <div className="px-8 md:px-12 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/50 print:bg-white print:border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-medium">Generated by CCA AI Report Engine</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span>{report.model_used}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">
                  This report is AI-generated. Please verify critical data points with source records.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
