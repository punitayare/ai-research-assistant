import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="ai-research-assistant",
    user="postgres",
    password="new_password123",
    port=5432
)

cursor = conn.cursor()