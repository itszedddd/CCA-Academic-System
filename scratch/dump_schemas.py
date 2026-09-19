import sqlite3
import json

def get_schema(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in c.fetchall()]
    schema = {}
    for t in tables:
        c.execute(f"PRAGMA table_info({t})")
        schema[t] = [r["name"] for r in c.fetchall()]
    conn.close()
    return schema

sis_schema = get_schema('backend/sis.db')
cca_schema = get_schema('backend/cca.db')

with open('scratch/schemas.json', 'w') as f:
    json.dump({'sis': sis_schema, 'cca': cca_schema}, f, indent=2)
