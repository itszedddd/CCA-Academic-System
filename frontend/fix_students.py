import re
import os

path = r'C:\Users\ender\Programming\Thesis_Project\frontend\src\pages\Students.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

correct_code = """          </div>
        </div>
      )}

      {showEdit && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Edit Student</h3>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label><input required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.first_name} onChange={e => setEditingStudent({...editingStudent, first_name:e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label><input required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.last_name} onChange={e => setEditingStudent({...editingStudent, last_name:e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grade Level</label>
                  <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.grade_level} onChange={e => setEditingStudent({...editingStudent, grade_level:e.target.value})}>
                    <option value="">None</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
                  <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.section || ''} onChange={e => setEditingStudent({...editingStudent, section:e.target.value})}>
                    <option value="">None</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Enrollment Status</label>
                  <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.enrollment_status} onChange={e => setEditingStudent({...editingStudent, enrollment_status:e.target.value})}>
                    {['Enrolled','Pending','Hold: Incomplete Req', 'Dropped', 'Transferred', 'Archived', 'Graduated', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">School Year</label>
                  <input className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.school_year || '2025-2026'} onChange={e => setEditingStudent({...editingStudent, school_year:e.target.value})} />
                </div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload New Profile Image</label><input type="file" accept="image/*" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" onChange={e => setEditingStudentFile(e.target.files[0])} /></div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}"""

# Replace the specific malformed block
bad_block = """          </div>
        </div>
      )}
          </div>
        </div>
      )}"""

content = content.replace(bad_block, correct_code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fix applied.")
