import React, { useState, useEffect } from 'react';

export default function DigitalForms({ API, authFetch, students }) {
  const [selectedForm, setSelectedForm] = useState('student_info');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [formHtml, setFormHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const formTypes = [
    { id: 'student_info', label: 'Student Information Sheet' },
    { id: 'enrollment_form', label: 'Enrollment / Pre-Registration Form' },
    { id: 'id_form', label: 'Student ID Form' },
    { id: 'consent_form', label: 'Consent Form' },
    { id: 'medical_form', label: 'Medical / Health Form' },
    { id: 'waiver_form', label: 'Liability Waiver' },
  ];

  const fetchForm = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API}/forms/${selectedForm}/${selectedStudent}`);
      if (res?.ok) {
        const html = await res.text();
        setFormHtml(html);
      }
    } catch (err) {
      console.error("Error fetching form", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlankForm = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/forms/${selectedForm}/blank`);
      if (res?.ok) {
        const html = await res.text();
        setFormHtml(html);
      }
    } catch (err) {
      console.error("Error fetching blank form", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(formHtml);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Digital Forms</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Type</label>
            <select 
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded p-2"
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
            >
              {formTypes.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label>
            <select 
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded p-2"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">-- Select Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.last_name}, {s.first_name} ({s.grade_level})</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button 
              onClick={fetchForm}
              disabled={!selectedStudent || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              Generate
            </button>
            <button 
              onClick={fetchBlankForm}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition disabled:opacity-50"
            >
              Blank Form
            </button>
            {formHtml && (
              <button 
                onClick={handlePrint}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Print
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && <div className="text-center text-gray-500 dark:text-gray-400 py-8">Generating form...</div>}

      {formHtml && !loading && (
        <div className="bg-white rounded-lg shadow p-6 border">
          <div dangerouslySetInnerHTML={{ __html: formHtml }} />
        </div>
      )}
    </div>
  );
}
