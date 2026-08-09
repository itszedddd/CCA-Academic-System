import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentClearance({ sharedProps }) {
  const { API_URL, currentUser, students } = sharedProps;
  const [clearances, setClearances] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (selectedStudent) {
      fetchClearances(selectedStudent);
    } else {
      setClearances([]);
    }
  }, [selectedStudent]);

  const fetchClearances = async (studentId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/clearances/student/${studentId}`);
      setClearances(res.data);
    } catch (err) {
      console.error("Error fetching clearances", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClearance = async () => {
    if (!selectedStudent) return;
    setCreating(true);
    try {
      await axios.post(`${API_URL}/clearances/`, {
        student_id: parseInt(selectedStudent),
        school_year: "2026-2027", // Hardcoded for demo
        term: "End of Year",
      });
      fetchClearances(selectedStudent);
    } catch (err) {
      console.error("Error creating clearance", err);
    } finally {
      setCreating(false);
    }
  };

  const updateItemStatus = async (itemId, newStatus, remarks) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/clearances/items/${itemId}`, {
        department: "", // handled by backend
        status: newStatus,
        remarks: remarks || ""
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClearances(selectedStudent);
    } catch (err) {
      console.error("Error updating clearance item", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Clearance System</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
        <select 
          className="w-full md:w-1/2 border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Choose a Student --</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.last_name}, {s.first_name} ({s.grade_level} - {s.section})</option>
          ))}
        </select>
        
        {selectedStudent && clearances.length === 0 && !loading && (
          <div className="mt-4">
            <p className="text-gray-500 mb-2">No clearance records found for this student.</p>
            {["Principal", "Registrar", "Teacher"].includes(currentUser?.role) && (
              <button 
                onClick={handleCreateClearance}
                disabled={creating}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                {creating ? "Creating..." : "Initiate Clearance"}
              </button>
            )}
          </div>
        )}
      </div>

      {loading && <div className="text-gray-500">Loading clearances...</div>}

      {clearances.map(clearance => (
        <div key={clearance.id} className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className={`p-4 ${clearance.status === 'Cleared' ? 'bg-green-50' : 'bg-yellow-50'} border-b flex justify-between items-center`}>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Clearance: {clearance.school_year} - {clearance.term}
              </h2>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1
                ${clearance.status === 'Cleared' ? 'bg-green-200 text-green-800' : 
                  clearance.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                {clearance.status}
              </span>
            </div>
            
            {clearance.status === 'Cleared' && (
              <button className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                Print Clearance Form
              </button>
            )}
          </div>
          
          <div className="p-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clearance.items && clearance.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.status === 'Cleared' ? 'bg-green-100 text-green-800' : 
                          item.status === 'Hold' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.remarks || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Only allow relevant roles to clear their respective departments */}
                      {((currentUser?.role === item.department) || (currentUser?.role === 'Principal') || (currentUser?.role === 'Superadmin')) ? (
                        <div className="flex space-x-2">
                          {item.status !== 'Cleared' && (
                            <button 
                              onClick={() => updateItemStatus(item.id, 'Cleared', '')}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Mark Cleared
                            </button>
                          )}
                          {item.status !== 'Hold' && (
                            <button 
                              onClick={() => {
                                const reason = prompt("Enter reason for holding clearance:");
                                if (reason !== null) updateItemStatus(item.id, 'Hold', reason);
                              }}
                              className="text-red-600 hover:text-red-900 font-medium"
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
