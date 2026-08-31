import React, { useState, useEffect } from 'react';

export default function StudentClearance({ API, authFetch, token, students, currentRole, user }) {
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [modalSearch, setModalSearch] = useState('');
  const [viewMode, setViewMode] = useState(currentRole === 'Teacher' ? 'Overview' : 'List');
  const [sectionFilter, setSectionFilter] = useState(currentRole === 'Teacher' && user?.section ? user.section : 'All');
  
  // Navigation enhancements
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedCards, setExpandedCards] = useState(new Set()); // Track expanded state

  const toggleCard = (id) => {
    const newSet = new Set(expandedCards);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedCards(newSet);
  };

  useEffect(() => {
    fetchAllClearances();
  }, []);

  const fetchAllClearances = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/clearances/`);
      if (res?.ok) {
        const data = await res.json();
        setClearances(data);
      }
    } catch (err) {
      console.error("Error fetching clearances", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClearance = async (studentId) => {
    const id = studentId || selectedStudent;
    if (!id) return;
    setCreating(true);
    try {
      const res = await authFetch(`${API}/clearances/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: parseInt(id),
          school_year: "2026-2027",
          term: "End of Year",
        })
      });
      if (res?.ok) {
        setShowModal(false);
        setSelectedStudent('');
        setModalSearch('');
        fetchAllClearances();
      }
    } catch (err) {
      console.error("Error creating clearance", err);
    } finally {
      setCreating(false);
    }
  };

  const updateItemStatus = async (itemId, newStatus, remarks) => {
    try {
      const res = await authFetch(`${API}/clearances/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: "",
          status: newStatus,
          remarks: remarks || ""
        })
      });
      if (res?.ok) {
        fetchAllClearances();
      } else {
        const data = await res.json();
        alert(data.detail || "Error updating clearance.");
      }
    } catch (err) {
      console.error("Error updating clearance item", err);
      alert("Error updating clearance item.");
    }
  };

  // Filter students for the modal search
  const filteredStudents = students.filter(s => {
    const q = modalSearch.toLowerCase();
    if (!q) return true;
    return `${s.first_name} ${s.last_name} ${s.grade_level} ${s.section || ''}`.toLowerCase().includes(q);
  });

  const filteredClearances = clearances.filter(c => {
     if (sectionFilter !== 'All' && c.student?.section !== sectionFilter) return false;
     if (statusFilter !== 'All' && c.status !== statusFilter) return false;
     
     if (searchQuery) {
       const q = searchQuery.toLowerCase();
       const name = `${c.student?.first_name || ''} ${c.student?.last_name || ''}`.toLowerCase();
       const idStr = String(c.student_id);
       if (!name.includes(q) && !idStr.includes(q)) return false;
     }
     
     return true;
  });

  return (
    <>
      {viewMode === 'Overview' && currentRole === 'Teacher' ? (
        <div className="bg-white dark:bg-slate-900 min-h-[calc(100vh-120px)] p-6 md:p-8">
          <h2 className="text-xl font-black font-cinzel text-brand-800 dark:text-brand-400 tracking-widest uppercase mb-4">SECTIONS HANDLED</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <button
              onClick={() => { setSectionFilter(user?.section || 'All'); setViewMode('List'); }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-center items-center hover:bg-brand-800 hover:text-white dark:hover:bg-brand-800 transition-colors duration-200 shadow-sm hover:shadow-md group"
            >
              <span className="font-bold text-lg mb-2 group-hover:text-white text-slate-800 dark:text-white">{user?.section || 'Advisory Class'}</span>
              <span className="bg-brand-600 group-hover:bg-white group-hover:text-brand-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">View Clearances</span>
            </button>
          </div>
        </div>
      ) : (
    <div className="p-6">
      {currentRole === 'Teacher' && (
        <button onClick={() => setViewMode('Overview')} className="text-sm font-bold text-slate-400 hover:text-brand-600 mb-4 self-start flex items-center transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Sections
        </button>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-extrabold font-cinzel text-brand-900 dark:text-white">Clearance Records</h1>
        {["Principal", "Registrar", "Teacher", "Superadmin"].includes(currentRole) && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-brand-600 text-white px-5 py-2.5 rounded-xl hover:bg-brand-700 transition shadow-md font-bold tracking-wide flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Initiate Clearance
          </button>
        )}
      </div>

      {/* Filters and Search Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Search by student name or ID..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Cleared">Cleared</option>
          <option value="Pending">Pending</option>
        </select>
      </div>
      
      {loading && (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      )}
      
      {!loading && filteredClearances.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-12 text-center flex flex-col items-center">
          <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Clearance Records</h3>
          <p className="text-slate-500">There are no clearances matching your current filters.</p>
        </div>
      )}

      {filteredClearances.map(clearance => {
        const isExpanded = expandedCards.has(clearance.id);
        
        return (
        <div key={clearance.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-4 overflow-hidden transition-all duration-200">
          <div 
            onClick={() => toggleCard(clearance.id)}
            className={`p-5 ${clearance.status === 'Cleared' ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'} cursor-pointer flex justify-between items-center transition-colors`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-slate-700 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold mr-4">
                {clearance.student?.first_name?.[0]}{clearance.student?.last_name?.[0]}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                  {clearance.student ? `${clearance.student.last_name}, ${clearance.student.first_name}` : `Student ID: ${clearance.student_id}`}
                </h2>
                <div className="text-xs font-bold text-slate-500 mt-0.5 tracking-wide flex items-center gap-2">
                  <span>{clearance.student?.grade_level || 'Unknown'} {clearance.student?.section ? `- ${clearance.student.section}` : ''}</span>
                  <span>•</span>
                  <span>{clearance.school_year} {clearance.term}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`inline-flex px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full 
                ${clearance.status === 'Cleared' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 
                  clearance.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                {clearance.status}
              </span>
              <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] border-t border-slate-100 dark:border-slate-700' : 'max-h-0'}`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {clearance.items && clearance.items.map((item, index) => {
                  const isLocked = index > 0 && clearance.items[index - 1].status !== 'Cleared';
                  // Map department names to the roles that can sign them
                  const DEPT_ROLE_MAP = {
                    'Subjects': ['Teacher'],
                    'Library': ['Registrar', 'Principal'],
                    'Clinic': ['Registrar', 'Principal'],
                    'Cashier': ['Cashier'],
                    'Registrar': ['Registrar'],
                    'Principal': ['Principal'],
                  };
                  const allowedRoles = DEPT_ROLE_MAP[item.department] || [];
                  const canAct = allowedRoles.includes(currentRole) || currentRole === 'Superadmin';
                  
                  return (
                  <tr key={item.id} className={isLocked ? "opacity-50 bg-gray-50 dark:bg-slate-900/50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      {isLocked && <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                      {item.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.status === 'Cleared' ? 'bg-green-100 text-green-800' : 
                          item.status === 'Hold' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {item.remarks || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {canAct ? (
                        <div className="flex space-x-2">
                          {item.status !== 'Cleared' && (
                            <button 
                              onClick={() => {
                                if (isLocked) alert(`Cannot clear ${item.department}. Previous step must be cleared first.`);
                                else updateItemStatus(item.id, 'Cleared', '');
                              }}
                              className={`${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-900'} font-medium`}
                            >
                              Mark Cleared
                            </button>
                          )}
                          {item.status !== 'Hold' && (
                            <button 
                              onClick={() => {
                                if (isLocked) alert(`Cannot put ${item.department} on hold. Previous step must be cleared first.`);
                                else {
                                  const reason = prompt("Enter reason for holding clearance:");
                                  if (reason !== null) updateItemStatus(item.id, 'Hold', reason);
                                }
                              }}
                              className={`${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'} font-medium`}
                            >
                              Put on Hold
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No permission</span>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )})}

      {/* Modal for initiating new clearance — searchable student list */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => { setShowModal(false); setSelectedStudent(''); setModalSearch(''); }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Initiate Clearance</h2>
                <button onClick={() => { setShowModal(false); setSelectedStudent(''); setModalSearch(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Search input */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  autoFocus
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  placeholder="Search by name, grade, or section..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Student list */}
            <div className="max-h-80 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No students match your search.</div>
              ) : (
                filteredStudents.map(s => {
                  const isSelected = selectedStudent === String(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudent(String(s.id))}
                      className={`flex items-center px-6 py-3 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700/50 ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {s.first_name[0]}{s.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-white'}`}>
                          {s.last_name}, {s.first_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {s.grade_level} {s.section ? `• ${s.section}` : ''} • #{String(s.id).padStart(4, '0')}
                        </p>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {selectedStudent ? `Selected: ${students.find(s => String(s.id) === selectedStudent)?.first_name || ''} ${students.find(s => String(s.id) === selectedStudent)?.last_name || ''}` : 'Select a student above'}
              </span>
              <button 
                onClick={() => handleCreateClearance()}
                disabled={!selectedStudent || creating}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm"
              >
                {creating ? "Creating..." : "Initiate Clearance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    )}
    </>
  );
}
