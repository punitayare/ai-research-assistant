import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    port=os.getenv("DB_PORT"),
    sslmode="require"
)

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS study_documents (
    id BIGSERIAL PRIMARY KEY,
    filename TEXT UNIQUE NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);
""")

conn.commit()

print("study_documents table created successfully!")

cursor.close()
conn.close()