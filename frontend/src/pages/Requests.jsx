import React, { useState, useEffect } from 'react';

export default function Requests({ currentRole, authFetch }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [printDoc, setPrintDoc] = useState(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/document-requests/');
      if (res?.ok) {
        setRequests(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentRole]);

  const handleStatusChange = async (id, newStatus, currentRemarks = '') => {
    let remarks = currentRemarks;
    if (newStatus === 'Rejected' || newStatus === 'Ready') {
      const input = prompt(`Enter remarks for changing status to ${newStatus}:`, currentRemarks || '');
      if (input === null) return; // cancelled
      remarks = input;
    }
    
    try {
      const res = await authFetch(`/api/document-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, remarks: remarks || null })
      });
      if (res?.ok) {
        fetchRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'All' || r.status === filter;
    const searchString = `${r.student_name} ${r.document_type}`.toLowerCase();
    const matchesSearch = searchString.includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h3 className="text-lg font-bold font-cinzel tracking-wide text-slate-800 dark:text-white">Document Requests</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage and track student document requests.</p>
        </div>
      </div>
      
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search by student or document..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Processing', 'Ready', 'Released', 'Rejected'].map(status => (
            <button 
              key={status} 
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                filter === status 
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              <th className="px-6 py-3">Student Name</th>
              <th className="px-6 py-3">Document</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date Requested</th>
              <th className="px-6 py-3">Remarks</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {isLoading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Loading requests...</td></tr>
            ) : filteredRequests.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No requests found.</td></tr>
            ) : filteredRequests.map(r => (
              <tr key={r.id} className="hover:bg-brand-50/30 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                  {r.student_name}
                  <div className="text-xs text-slate-400 font-normal">{r.student_grade || ''}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {r.document_type}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    r.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    r.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    r.status === 'Ready' ? 'bg-green-100 text-green-700' :
                    r.status === 'Released' ? 'bg-slate-100 text-slate-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(r.date_requested).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate" title={r.remarks || ''}>
                  {r.remarks || '—'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {r.status === 'Pending' && (
                    <>
                      <button onClick={() => handleStatusChange(r.id, 'Processing', r.remarks)} className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-bold transition">Process</button>
                      <button onClick={() => handleStatusChange(r.id, 'Rejected', r.remarks)} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-bold transition">Reject</button>
                    </>
                  )}
                  {r.status === 'Processing' && (
                    <button onClick={() => handleStatusChange(r.id, 'Ready', r.remarks)} className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-bold transition">Mark Ready</button>
                  )}
                  {r.status === 'Ready' && (
                    <>
                      <button onClick={() => setPrintDoc(r)} className="px-3 py-1 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded text-xs font-bold transition">Print Draft</button>
                      <button onClick={() => handleStatusChange(r.id, 'Released', r.remarks)} className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-xs font-bold transition">Release</button>
                    </>
                  )}
                  {r.status === 'Released' && (
                    <button onClick={() => setPrintDoc(r)} className="px-3 py-1 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded text-xs font-bold transition">Print</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {printDoc && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Print Document: {printDoc.document_type}</h3>
              <div className="space-x-2">
                <button onClick={() => window.print()} className="px-4 py-2 bg-brand-600 text-white rounded font-bold text-sm shadow">Print</button>
                <button onClick={() => setPrintDoc(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded font-bold text-sm">Close</button>
              </div>
            </div>
            <div className="p-12 overflow-y-auto print:p-0 print:overflow-visible">
              <div className="border border-slate-300 p-12 min-h-[800px] print:border-none print:p-0">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-black font-cinzel">Calvary Christian Academy</h1>
                  <p className="text-sm uppercase tracking-widest text-slate-500 mt-1">Official Document Draft</p>
                </div>
                
                <h2 className="text-xl font-bold uppercase border-b-2 border-black pb-2 mb-6">{printDoc.document_type}</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div><strong>Student Name:</strong> {printDoc.student_name}</div>
                  <div><strong>Grade/Level:</strong> {printDoc.student_grade || 'N/A'}</div>
                  <div><strong>Date Requested:</strong> {new Date(printDoc.date_requested).toLocaleDateString()}</div>
                  <div><strong>Status:</strong> {printDoc.status}</div>
                </div>

                <div className="mt-8 text-sm leading-relaxed text-justify">
                  <p>This document serves as a draft/preview of the requested {printDoc.document_type} for {printDoc.student_name}.</p>
                  <p className="mt-4">The official document will contain complete academic records, signatures, and the school seal.</p>
                  {printDoc.remarks && (
                    <div className="mt-6 p-4 border border-dashed border-slate-400 bg-slate-50">
                      <strong>Remarks:</strong> {printDoc.remarks}
                    </div>
                  )}
                </div>

                <div className="mt-32 flex justify-between px-12">
                  <div className="text-center">
                    <div className="border-t border-black w-48 pt-2 font-bold text-sm">Prepared By</div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-black w-48 pt-2 font-bold text-sm">School Registrar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
