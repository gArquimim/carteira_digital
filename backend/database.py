import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

conn = mysql.connector.connect(
    host = os.getenv("DB_HOST"),
    user = os.getenv("DB_USER"),
    password = os.getenv("DB_PASSWORD"),
    database = os.getenv("DB_NAME")
)
cursor = conn.cursor(buffered=True)

cursor.execute("""CREATE TABLE IF NOT EXISTS users(
               id INT AUTO_INCREMENT PRIMARY KEY ,
               name VARCHAR(100) NOT NULL,
               email VARCHAR(255) NOT NULL UNIQUE,
               password_hash VARCHAR(255) NOT NULL
               )""")

cursor.execute("""CREATE TABLE IF NOT EXISTS transactions(
               id INT AUTO_INCREMENT PRIMARY KEY,
               user_id INT NOT NULL,
               type ENUM('income','expense') NOT NULL,
               value DECIMAL(10,2) NOT NULL,
               date DATETIME DEFAULT CURRENT_TIMESTAMP,
               description VARCHAR(100),
               INDEX (user_id),
               FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
               )""")
