import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Reports({ sharedProps }) {
  const { API_URL, currentUser } = sharedProps;
  const [reportType, setReportType] = useState('enrollment');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/reports/${reportType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(res.data);
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
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
          <p className="text-lg font-semibold text-blue-800">Total Enrolled Students: {reportData.total_students}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">By Grade Level</h3>
            <ul className="space-y-2">
              {Object.entries(reportData.by_grade || {}).map(([grade, count]) => (
                <li key={grade} className="flex justify-between">
                  <span className="text-gray-600">{grade || 'Unassigned'}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">By Section</h3>
            <ul className="space-y-2">
              {Object.entries(reportData.by_section || {}).map(([section, count]) => (
                <li key={section} className="flex justify-between">
                  <span className="text-gray-600">{section || 'Unassigned'}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
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
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
            <p className="text-sm text-green-700 font-semibold uppercase">Total Collected</p>
            <p className="text-2xl font-bold text-green-900">₱{reportData.total_collected?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
            <p className="text-sm text-blue-700 font-semibold uppercase">Total Expected</p>
            <p className="text-2xl font-bold text-blue-900">₱{reportData.total_expected?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r">
            <p className="text-sm text-purple-700 font-semibold uppercase">Collection Rate</p>
            <p className="text-2xl font-bold text-purple-900">{reportData.collection_rate?.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Status Breakdown</h3>
            <ul className="space-y-2">
              {Object.entries(reportData.status_counts || {}).map(([status, count]) => (
                <li key={status} className="flex justify-between">
                  <span className="text-gray-600">{status}</span>
                  <span className="font-medium">{count}</span>
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
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
            <p className="text-sm text-blue-700 font-semibold uppercase">Total Records</p>
            <p className="text-2xl font-bold text-blue-900">{reportData.total_records}</p>
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
            <p className="text-sm text-green-700 font-semibold uppercase">Fully Cleared</p>
            <p className="text-2xl font-bold text-green-900">{reportData.cleared_count}</p>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r">
            <p className="text-sm text-yellow-700 font-semibold uppercase">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">{reportData.pending_count}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 border rounded shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Bottlenecks (Pending Items by Department)</h3>
          <ul className="space-y-2">
            {Object.entries(reportData.bottlenecks || {}).map(([dept, count]) => (
              <li key={dept} className="flex justify-between">
                <span className="text-gray-600">{dept}</span>
                <span className="font-medium text-red-600">{count} pending items</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">School-Wide Reports</h1>
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
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex gap-4 border-b pb-4 mb-4">
          <button 
            className={`px-4 py-2 rounded font-medium ${reportType === 'enrollment' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setReportType('enrollment')}
          >
            Enrollment Summary
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium ${reportType === 'financial' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setReportType('financial')}
          >
            Financial Collection
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium ${reportType === 'clearance' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setReportType('clearance')}
          >
            Clearance Status
          </button>
        </div>
        
        {loading ? (
          <div className="py-12 text-center text-gray-500">Generating report...</div>
        ) : (
          <div className="report-content printable-area" id="printable-report">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 pb-2 border-b-2 border-blue-900">
              {reportData?.title || "Report"}
            </h2>
            
            {reportType === 'enrollment' && renderEnrollmentReport()}
            {reportType === 'financial' && renderFinancialReport()}
            {reportType === 'clearance' && renderClearanceReport()}
            
            <div className="mt-12 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
              Generated on {new Date().toLocaleDateString()} | CCA EduSys
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
