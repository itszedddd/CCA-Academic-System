import sqlalchemy
e = sqlalchemy.create_engine('postgresql://cca_db_l21e_user:B2g65PhdGG7DmRgSN3DQOgHTkTITGpcj@dpg-dalmcp942hec73cvublg-a.singapore-postgres.render.com/cca_db_l21e')
with e.connect() as c:
    res = c.execute(sqlalchemy.text("SELECT id, username, role FROM users WHERE username = 'admission'")).fetchall()
    print('Admission users:', res)
    res2 = c.execute(sqlalchemy.text("SELECT id, username, role FROM users WHERE username = 'registrar'")).fetchall()
    print('Registrar users:', res2)
