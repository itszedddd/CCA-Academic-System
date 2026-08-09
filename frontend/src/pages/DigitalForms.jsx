import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DigitalForms = ({ sharedProps }) => {
  const { API_URL, currentUser } = sharedProps;
  const [forms, setForms] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchForms();
    if (["Principal", "Registrar", "Admission"].includes(currentUser?.role)) {
      fetchStudents();
    }
  }, [currentUser]);

  const fetchForms = async () => {
    try {
      const res = await axios.get(`${API_URL}/forms/templates`);
      setForms(res.data);
      if (res.data.length > 0) setSelectedForm(res.data[0].id);
    } catch (err) {
      console.error("Error fetching forms:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/students/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const generateForm = async () => {
    if (!selectedForm) return;
    setLoading(true);
    try {
      let url = `${API_URL}/forms/${selectedForm}/blank`;
      if (selectedStudent) {
        url = `${API_URL}/forms/${selectedForm}/student/${selectedStudent}`;
      }
      
      const res = await axios.get(url);
      setHtmlContent(res.data);
    } catch (err) {
      console.error("Error generating form:", err);
      setHtmlContent("<p>Error generating form.</p>");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Digital Forms</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Form Template</label>
            <select 
              className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
            >
              {forms.map(form => (
                <option key={form.id} value={form.id}>{form.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {forms.find(f => f.id === selectedForm)?.description}
            </p>
          </div>
          
          {["Principal", "Registrar", "Admission"].includes(currentUser?.role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Student (Optional)</label>
              <select 
                className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">-- Blank Form --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.last_name}, {student.first_name} ({student.grade_level})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={generateForm}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Generating..." : "Generate Preview"}
          </button>
          
          {htmlContent && (
            <button 
              onClick={handlePrint}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print Form
            </button>
          )}
        </div>
      </div>

      {htmlContent && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 overflow-auto max-h-[800px]">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Preview</h2>
          <div className="preview-container border p-4 shadow-inner bg-gray-50 rounded" dangerouslySetInnerHTML={{ __html: htmlContent }}>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalForms;
