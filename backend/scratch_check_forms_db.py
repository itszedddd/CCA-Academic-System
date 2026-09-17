import sqlalchemy
e = sqlalchemy.create_engine('postgresql://cca_db_l21e_user:B2g65PhdGG7DmRgSN3DQOgHTkTITGpcj@dpg-dalmcp942hec73cvublg-a.singapore-postgres.render.com/cca_db_l21e')
with e.connect() as c:
    # Check admission user and their hashed password
    res = c.execute(sqlalchemy.text("SELECT id, username, role, hashed_password FROM users WHERE username = 'admission'")).fetchall()
    print('Admission user:', [(r[0], r[1], r[2], r[3][:30]+'...') for r in res])
    
    # Check enrollment forms count
    res2 = c.execute(sqlalchemy.text("SELECT COUNT(*) FROM enrollment_forms")).fetchone()
    print('Total enrollment forms in DB:', res2[0])
    
    # Check recent enrollment forms
    res3 = c.execute(sqlalchemy.text("SELECT id, student_id, status, form_type FROM enrollment_forms ORDER BY id DESC LIMIT 5")).fetchall()
    print('Recent forms:')
    for r in res3:
        print(f'  Form #{r[0]}: student_id={r[1]} status={r[2]} type={r[3]}')
