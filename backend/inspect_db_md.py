import sqlite3
import os

def inspect_db_to_md(db_path, out_file):
    if not os.path.exists(db_path):
        out_file.write(f"## Database: {os.path.basename(db_path)} (Not Found)\n\n")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    out_file.write(f"## Database: `{os.path.basename(db_path)}` ({os.path.getsize(db_path)} bytes)\n\n")
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        out_file.write(f"### Table: `{table_name}` ({count} rows)\n")
        
        if count > 0:
            cursor.execute(f"PRAGMA table_info({table_name})")
            cols = [col[1] for col in cursor.fetchall()]
            
            out_file.write("| " + " | ".join(cols) + " |\n")
            out_file.write("|" + "|".join(["---"] * len(cols)) + "|\n")
            
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
            rows = cursor.fetchall()
            for row in rows:
                safe_row = [str(val).replace('\n', ' ') for val in row]
                out_file.write("| " + " | ".join(safe_row) + " |\n")
        out_file.write("\n")
    conn.close()

with open('db_report.md', 'w', encoding='utf-8') as f:
    f.write("# Database Summary\n\n")
    inspect_db_to_md('cca.db', f)
    inspect_db_to_md('sis.db', f)

print("Markdown report created at db_report.md")
