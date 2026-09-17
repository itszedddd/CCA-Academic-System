import sqlalchemy
e = sqlalchemy.create_engine('postgresql://cca_db_l21e_user:B2g65PhdGG7DmRgSN3DQOgHTkTITGpcj@dpg-dalmcp942hec73cvublg-a.singapore-postgres.render.com/cca_db_l21e')
with e.connect() as c:
    print(c.execute(sqlalchemy.text("SELECT first_name, last_name FROM students")).fetchall())
