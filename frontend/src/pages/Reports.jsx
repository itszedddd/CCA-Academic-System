import React, { useState, useEffect } from 'react';

export default function Reports({ API, authFetch }) {
  const [reportType, setReportType] = useState('enrollment');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const endpoint = reportType === 'analytics' ? `${API}/analytics/report` : `${API}/reports/${reportType}`;
      const res = await authFetch(endpoint);
      if (res?.ok) {
        const data = await res.json();
        if (reportType === 'analytics' && !data.title) {
          data.title = 'Academics & General Analytics Report';
        }
        setReportData(data);
      } else {
        setReportData(null);
      }
    } catch (err) {
      console.error("Error fetching report", err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderEnrollmentReport = () => {
    if (!reportData) return null;
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r">
          <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">Total Enrolled Students: {reportData.total_students}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-700 p-4 border dark:border-slate-600 rounded shadow-sm">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-slate-600 pb-2">By Grade Level</h3>
            <ul className="space-y-2">
              {Object.entries(reportData.by_grade || {}).map(([grade, count]) => (
                <li key={grade} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{grade || 'Unassigned'}</span>
                  <span className="font-medium dark:text-white">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-700 p-4 border dark:border-slate-600 rounded shadow-sm">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-slate-600 pb-2">By Section</h3>
            <ul className="space-y-2">
              {Object.entries(reportData.by_section || {}).map(([section, count]) => (
                <li key={section} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{section || 'Unassigned'}</span>
                  <span className="font-medium dark:text-white">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-700 p-4 border dark:border-slate-600 rounded shadow-sm md:col-span-2">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-slate-600 pb-2">Dropout / Transferee Breakdown</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Dropped Out</span>
                <span className="font-medium text-red-500">{reportData.dropped_count || 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Transferred</span>
                <span className="font-medium text-amber-500">{reportData.transferred_count || 0}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialReport = () => {
    if (!reportData) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r">
            <p className="text-sm text-green-700 dark:text-green-400 font-semibold uppercase">Total Collected</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-200">₱{reportData.total_collected?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold uppercase">Total Expected</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">₱{reportData.total_expected?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded-r">
            <p className="text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase">Collection Rate</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{reportData.collection_rate?.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-700 p-4 border dark:border-slate-600 rounded shadow-sm">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-slate-600 pb-2">Status Breakdown</h3>
            <ul className="space-y-2">
              {Object.entries(reportData.status_counts || {}).map(([status, count]) => (
                <li key={status} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{status}</span>
                  <span className="font-medium dark:text-white">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderClearanceReport = () => {
    if (!reportData) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold uppercase">Total Records</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{reportData.total_records}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r">
            <p className="text-sm text-green-700 dark:text-green-400 font-semibold uppercase">Fully Cleared</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-200">{reportData.cleared_count}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r">
            <p className="text-sm text-yellow-700 dark:text-yellow-400 font-semibold uppercase">Pending</p>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{reportData.pending_count}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-700 p-4 border dark:border-slate-600 rounded shadow-sm">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-slate-600 pb-2">Bottlenecks (Pending Items by Department)</h3>
          <ul className="space-y-2">
            {Object.entries(reportData.bottlenecks || {}).map(([dept, count]) => (
              <li key={dept} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{dept}</span>
                <span className="font-medium text-red-600">{count} pending items</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderAnalyticsReport = () => {
    if (!reportData) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold uppercase">Total Students</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{reportData.total_students}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r">
            <p className="text-sm text-green-700 dark:text-green-400 font-semibold uppercase">Enrolled Students</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-200">{reportData.enrolled_students}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-700 p-4 border dark:border-slate-600 rounded shadow-sm">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-slate-600 pb-2">Academic Performance</h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Global Academic Average</span>
                <span className="font-bold text-lg dark:text-white">{reportData.global_academic_average}%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Academic Pass Rate</span>
                <span className="font-bold text-lg text-green-600">{reportData.academic_pass_rate}%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Active Academic Warnings</span>
                <span className="font-bold text-lg text-red-600">{reportData.active_academic_warnings}</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-700 p-4 border dark:border-slate-600 rounded shadow-sm">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-slate-600 pb-2">Financial Overview</h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Total Tuition Due</span>
                <span className="font-bold dark:text-white">₱{reportData.total_tuition_due?.toLocaleString()}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Total Collected</span>
                <span className="font-bold text-green-600">₱{reportData.total_tuition_collected?.toLocaleString()}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Outstanding Balance</span>
                <span className="font-bold text-red-600">₱{reportData.outstanding_balance?.toLocaleString()}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 print:p-0 print:m-0 print:bg-white print:text-black">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">School-Wide Reports</h1>
        <button 
          onClick={handlePrint}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print Report
        </button>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6 print:border-none print:shadow-none print:p-0">
        <div className="flex gap-4 border-b dark:border-slate-700 pb-4 mb-4 print:hidden">
          <button 
            className={`px-4 py-2 rounded font-medium ${reportType === 'enrollment' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            onClick={() => setReportType('enrollment')}
          >
            Enrollment Summary
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium ${reportType === 'financial' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            onClick={() => setReportType('financial')}
          >
            Financial Collection
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium ${reportType === 'clearance' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            onClick={() => setReportType('clearance')}
          >
            Clearance Status
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium ${reportType === 'analytics' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            onClick={() => setReportType('analytics')}
          >
            Academics & Analytics
          </button>
        </div>
        
        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Generating report...</div>
        ) : (
          <div className="report-content printable-area" id="printable-report">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6 pb-2 border-b-2 border-blue-900 dark:border-blue-400">
              {reportData?.title || "Report"}
            </h2>
            
            {reportType === 'enrollment' && renderEnrollmentReport()}
            {reportType === 'financial' && renderFinancialReport()}
            {reportType === 'clearance' && renderClearanceReport()}
            {reportType === 'analytics' && renderAnalyticsReport()}
            
            <div className="mt-12 pt-4 border-t border-gray-300 dark:border-slate-600 print:border-black text-center text-sm text-gray-500 dark:text-gray-400 print:text-black">
              Generated on {new Date().toLocaleDateString()} | CCA EduSys
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
