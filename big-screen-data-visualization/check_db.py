import sqlite3

conn = sqlite3.connect("backend/situational_dashboard.db")
cursor = conn.cursor()
cursor.execute("SELECT id, dashboard_id, type, position FROM widgets")
rows = cursor.fetchall()
print("ID | DASH_ID | TYPE | POSITION")
for r in rows:
    print(f"{r[0]} | {r[1]} | {r[2]} | {r[3]}")
conn.close()
