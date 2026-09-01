import re

path = r'C:\Users\ender\Programming\Thesis_Project\frontend\src\pages\StudentClearance.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add states
states_hook = """  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedCards, setExpandedCards] = useState(new Set()); // Track expanded state
  const [gradeFilter, setGradeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');"""
content = re.sub(r"  const \[statusFilter, setStatusFilter\] = useState\('All'\);\n  const \[expandedCards, setExpandedCards\] = useState\(new Set\(\)\);.*", states_hook, content)

# Add Print function
print_func = """  const handlePrint = (clearance) => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="text-align: center; color: #1e3a8a;">Student Clearance</h1>
        <h3 style="text-align: center;">${clearance.student?.last_name || ''}, ${clearance.student?.first_name || ''}</h3>
        <p style="text-align: center;">Grade: ${clearance.student?.grade_level || 'N/A'} - ${clearance.student?.section || 'N/A'}</p>
        <p style="text-align: center;">School Year: ${clearance.school_year} | Term: ${clearance.term}</p>
        <p style="text-align: center; font-weight: bold; color: ${clearance.status === 'Cleared' ? 'green' : 'red'};">Status: ${clearance.status}</p>
        <hr style="margin: 20px 0;" />
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Department</th>
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Status</th>
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${clearance.items.map(i => `
              <tr>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${i.department}</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${i.status}</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${i.remarks || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
           <div>
              <p>_________________________</p>
              <p>Student Signature</p>
           </div>
           <div>
              <p>_________________________</p>
              <p>Registrar Signature</p>
           </div>
        </div>
      </div>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };
"""

content = content.replace("  const filteredStudents = students.filter(s => {", print_func + "\n  const filteredStudents = students.filter(s => {")

# Update filters logic
filter_logic = """     if (statusFilter !== 'All' && c.status !== statusFilter) return false;
     if (gradeFilter !== 'All' && c.student?.grade_level !== gradeFilter) return false;
     """
content = content.replace("     if (statusFilter !== 'All' && c.status !== statusFilter) return false;", filter_logic)

# Update filters UI
filters_ui = """        <select 
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
        >
          <option value="All">All Grades</option>
          {['Pre-Kinder', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <input 
          type="date"
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <select 
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >"""
content = content.replace("""        <select 
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >""", filters_ui)


# Update Generate PDF button
print_btn = """              <button onClick={(e) => { e.stopPropagation(); handlePrint(clearance); }} className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold px-3 py-1 rounded-full mr-3 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print
              </button>
              <span className={`inline-flex px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full"""
content = content.replace("""              <span className={`inline-flex px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full""", print_btn)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
