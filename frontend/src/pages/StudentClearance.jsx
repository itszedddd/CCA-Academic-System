import React, { useState, useEffect } from 'react';

export default function StudentClearance({ API, authFetch, token, students, currentRole, user }) {
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [modalSearch, setModalSearch] = useState('');

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Student Clearance System</h1>
        {["Principal", "Registrar", "Teacher", "Superadmin"].includes(currentRole) && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm font-medium"
          >
            Initiate New Clearance
          </button>
        )}
      </div>
      
      {loading && <div className="text-gray-500 dark:text-gray-400 mb-6">Loading clearances...</div>}
      
      {!loading && clearances.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
          No clearance records found.
        </div>
      )}

      {clearances.map(clearance => (
        <div key={clearance.id} className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6 overflow-hidden">
          <div className={`p-4 ${clearance.status === 'Cleared' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'} border-b dark:border-slate-700 flex justify-between items-center`}>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {clearance.student ? `${clearance.student.last_name}, ${clearance.student.first_name}` : `Student ID: ${clearance.student_id}`}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({clearance.student?.grade_level || 'Unknown Grade'} {clearance.student?.section ? `- ${clearance.student.section}` : ''})
                </span>
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Clearance: {clearance.school_year} - {clearance.term}
              </div>
            </div>
            <div>
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full 
                ${clearance.status === 'Cleared' ? 'bg-green-200 text-green-800' : 
                  clearance.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                {clearance.status}
              </span>
            </div>
          </div>
          
          <div className="p-0">
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
      ))}

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
  );
}
