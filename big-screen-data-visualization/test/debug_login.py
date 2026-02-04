import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def check_admin():
    db_path = "situational_dashboard.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT username, hashed_password FROM users WHERE username='admin'")
    user = cursor.fetchone()

    if user:
        username, hashed_password = user
        print(f"User found: {username}")
        print(f"Hashed password: {hashed_password}")

        # Verify password
        is_correct = pwd_context.verify("admin_password", hashed_password)
        print(f"Password 'admin_password' verification: {is_correct}")
    else:
        print("User 'admin' not found in database.")

    conn.close()


if __name__ == "__main__":
    check_admin()
