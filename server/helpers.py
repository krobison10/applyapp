from flask import jsonify
import mysql.connector


def is_valid_credentials(email, password):
    conn = mysql.connector.connect(
        host='tvcpw8tpu4jvgnnq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com	',
        user='zmisv7zova93dpr5',
        password='soduf1rla58j8elj',
        database='emm8upo3c4p4gcgr'
    )
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user is None:
        return False

    stored_password = user[1]
    return stored_password == password


def execute_query(query):
    conn = mysql.connector.connect(
        host='tvcpw8tpu4jvgnnq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user='zmisv7zova93dpr5',
        password='soduf1rla58j8elj',
        database='emm8upo3c4p4gcgr'
    )
    cursor = conn.cursor()
    cursor.execute(query)
    results = cursor.fetchall()
    
    cursor.close()
    conn.close()

    return results
