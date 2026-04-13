const API = '/api';

export default function EnrollmentOCR({ forms, fetchForms, uploading, fileInputRef, handleFileUpload, authFetch }) {
  const handleVerify = async (id) => {
    await authFetch(`${API}/enrollment_forms/${id}/verify`, { method: 'PUT' });
    fetchForms();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold font-cinzel tracking-wide text-slate-800 dark:text-white">OCR Extraction Engine</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Upload physical enrollment forms — AI extracts and indexes the text automatically.</p>
        </div>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className={`px-4 py-2 bg-brand-600 text-white rounded-lg font-medium shadow-sm flex items-center text-sm transition ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-700'}`}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {uploading ? 'Processing OCR…' : 'Upload Form'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700">
              <th className="px-6 py-3">Form ID</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Extracted Preview</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {forms.map(f => (
              <tr key={f.id} className="hover:bg-brand-50/30 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">DOC-{String(f.id).padStart(4,'0')}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{f.form_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${f.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{f.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{f.extracted_text || 'No text extracted.'}</td>
                <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                  <button onClick={() => alert(`Extracted Text:\n\n${f.extracted_text || '(empty)'}`)} className="text-brand-600 hover:text-brand-800 transition">View Text</button>
                  {f.status !== 'Success' && <button onClick={() => handleVerify(f.id)} className="text-green-600 hover:text-green-800 transition">Mark Verified</button>}
                </td>
              </tr>
            ))}
            {forms.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No forms uploaded yet. Click "Upload Form" to begin.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
