from flask import Flask, render_template, request, redirect, session, jsonify, url_for, flash
from dotenv import load_dotenv

import mysql.connector
import os

import helpers

load_dotenv()

app = Flask(__name__, static_folder='../client', template_folder='../client/pages')

app.secret_key = os.environ.get('SECRET_KEY')
db_password = os.environ.get('DB_PASSWORD')


# -------------------- API --------------------
@app.route('/api/applications')
def get_applications():
    user_id = session.get('user_id')
    
    query = f"""
    SELECT application_id, application_status, submit_date, title, job_description, post_date, field, position, wage, job_start, company_name, industry, website, phone
    FROM applications
    LEFT JOIN job_postings ON applications.posting_id = job_postings.posting_id
    LEFT JOIN companies ON job_postings.company_id = companies.company_id
    WHERE user_id = {user_id};
    """
    
    results = helpers.execute_query(query)
    
    # Convert the results to a list of dictionaries for JSON serialization
    applications = []
    for row in results:
        application = {
            'id': row[0], 
            'status': row[1], 
            'submit_date': row[2], 
            'title': row[3], 
            'description': row[4],
            'post_date': row[5], 
            'field': row[6], 
            'position': row[7], 
            'wage': row[8], 
            'start_date': row[9], 
            'company_name': row[10], 
            'industry': row[11], 
            'website': row[12], 
            'phone': row[13]
        }
        applications.append(application)

    # Return the applications as a JSON response
    return jsonify(applications)


@app.route('/api/interviews')
def get_interviews():
    user_id = session.get('user_id')
    
    query = f"""
    SELECT interview_id, applications.application_id, company_name, title, interview_date, modality, meeting_location
    FROM users 
    JOIN applications ON applications.user_id = users.user_id
    RIGHT JOIN interviews ON interviews.application_id = applications.application_id
    JOIN job_postings ON applications.posting_id = job_postings.posting_id
    JOIN companies ON job_postings.company_id = companies.company_id
    WHERE users.user_id = {user_id};
    """
    
    results = helpers.execute_query(query)
    
    # Convert the results to a list of dictionaries for JSON serialization
    applications = []
    for row in results:
        application = {
            'id': row[0], 
            'application_id': row[1],
            'company': row[2], 
            'title': row[3], 
            'date': row[4], 
            'modality': row[5],
            'location': row[6] 
        }
        applications.append(application)

    # Return the applications as a JSON response
    return jsonify(applications)


# Could update to find keys in one query, also could switch
@app.route('/api/update_application', methods=['POST'])
def update_application():
    data = request.get_json()

    conn = new_db_connection()
    cursor = conn.cursor()

    try:
        # Replace all empties with NULL string for SQL
        for key in data:
            if not data[key]:
                data[key] = "NULL"
            else:
                if key == 'wage':
                    data[key] = f"{data[key]}"
                elif key == 'phone':
                    data[key] = ''.join(filter(str.isdigit, data[key]))
                else:
                    data[key] = f"'{data[key]}'"
        
        # Retrieve the posting ID based on the application ID
        sql = f"""
        SELECT posting_id FROM applications
        WHERE application_id = {data["application_id"]};
        """
        cursor.execute(sql)
        result = cursor.fetchone()
        posting_id = result[0]
        
        # Retrieve the company ID based on the posting ID
        sql = f"""
        SELECT company_id FROM job_postings
        WHERE posting_id = {posting_id};
        """
        cursor.execute(sql)
        result = cursor.fetchone()
        company_id = result[0]
        
        # Update the job posting, company, and application records
        sql = f"""
        UPDATE job_postings 
        SET title = {data["title"]}, 
            job_description = {data["description"]}, 
            post_date = {data["post_date"]}, 
            field = {data["field"]}, 
            position = {data["position"]}, 
            wage = {data["wage"]}, 
            job_start = {data["start_date"]}
        WHERE posting_id = {posting_id};
        """ 
        cursor.execute(sql)
        
        sql = f"""
        UPDATE companies SET 
            company_name = {data["company_name"]}, 
            industry = {data["industry"]}, 
            website = {data["website"]}, 
            phone = {data["phone"]}
        WHERE company_id = {company_id};
        """
        cursor.execute(sql)
        
        sql = f"""
        UPDATE applications 
        SET application_status = {data["status"]}, 
            submit_date = {data["submit_date"]}
        WHERE application_id = {data["application_id"]};
        """
        cursor.execute(sql)
        
        # Commit changes to the database
        conn.commit()

        return get_applications()

    except mysql.connector.Error as error:
        print(f"Error: {error}")
        return "An error occurred while processing your request", 500
    
    finally:
        cursor.close()
        conn.close()


@app.route('/api/create_application', methods=['POST'])
def create_application():
    data = request.get_json()

    conn = new_db_connection()
    cursor = conn.cursor()

    try:
        
        # Replace all empties with NULL string for sql
        for key in data:
            if not data[key]:
                data[key] = "NULL"
            else:
                if key == 'wage':
                    data[key] = f"{data[key]}"
                elif key == 'phone':
                    data[key] = ''.join(filter(str.isdigit, data[key]))
                else:
                    data[key] = f"'{data[key]}'"
        
        # Insert into companies table
        sql = f"""
        INSERT INTO companies (company_name, industry, website, phone)
        VALUES ({data["company_name"]}, {data["industry"]}, {data["website"]}, {data["phone"]});
        """
        cursor.execute(sql)
        company_id = cursor.lastrowid

        # Insert into job_postings table
        sql = f"""
        INSERT INTO job_postings (company_id, title, job_description, post_date, field, position, wage, job_start)
        VALUES ({company_id}, {data["title"]}, {data["description"]}, {data["post_date"]}, {data["field"]}, {data["position"]}, {data["wage"]}, {data["start_date"]});
        """
        cursor.execute(sql)
        posting_id = cursor.lastrowid

        # Insert into applications table
        sql = f"""
        INSERT INTO applications (user_id, posting_id, application_status, submit_date)
        VALUES ({data["user_id"]}, {posting_id}, {data["status"]}, {data["submit_date"]});
        """
        cursor.execute(sql)

        # Commit changes to the database
        conn.commit()

        return get_applications()

    except mysql.connector.Error as error:
        print(f"Error: {error}")
        return "An error occurred while processing your request", 500
    
    finally:
        cursor.close()
        conn.close()
        
        
@app.route('/api/delete_application', methods=['POST'])
def delete_application():
    id = request.get_json()["application_id"]
    
    conn = new_db_connection()
    cursor = conn.cursor()
    
    try:
        sql = f"CALL delete_application({id});"
        cursor.execute(sql)
        conn.commit()
        return get_applications()
        
    except mysql.connector.Error as error:
        print(f"Error: {error}")
        return "An error occurred while processing your request", 500
    
    finally:
        cursor.close()
        conn.close()
        
        
@app.route('/api/create_interview', methods=['POST'])
def create_interview():
    data = request.get_json()
    
    for key in data:
        if not data[key]:
            data[key] = "NULL"
        else:
            data[key] = f"'{data[key]}'"
    
    conn = new_db_connection()
    cursor = conn.cursor()
    
    try:
        sql = f"""
        INSERT INTO interviews (application_id, interview_date, modality, meeting_location)
        VALUES ({data["application_id"]}, {data["interview_date"]}, {data["modality"]}, {data["meeting_location"]});
        """
        cursor.execute(sql)
        conn.commit()
        return get_interviews()
        
    except mysql.connector.Error as error:
        print(f"Error: {error}")
        return "An error occurred while processing your request", 500
    
    finally:
        cursor.close()
        conn.close()


@app.route('/api/update_interview', methods=['POST'])
def update_interview():
    data = request.get_json()
    
    for key in data:
        if not data[key]:
            data[key] = "NULL"
        else:
            data[key] = f"'{data[key]}'"

    conn = new_db_connection()
    cursor = conn.cursor()

    try:
        # Build the SQL update statement using the data from the request
        sql = f"""
        UPDATE interviews
        SET interview_date = {data['interview_date']},
            modality = {data['modality']},
            meeting_location = {data['meeting_location']}
        WHERE interview_id = {data['id']}
        """
        cursor.execute(sql)
        conn.commit()
        return get_interviews()

    except mysql.connector.Error as error:
        print(f"Error: {error}")
        return "An error occurred while processing your request", 500

    finally:
        cursor.close()
        conn.close()


@app.route('/api/delete_interview', methods=['POST'])
def delete_interview():
    id = request.get_json()["id"]

    conn = new_db_connection()
    cursor = conn.cursor()

    try:
        sql = f"DELETE FROM interviews WHERE interview_id = {id}"
        cursor.execute(sql)
        conn.commit()
        return get_interviews()

    except mysql.connector.Error as error:
        print(f"Error: {error}")
        return "An error occurred while processing your request", 500

    finally:
        cursor.close()
        conn.close()
   
   
@app.route('/api/user', methods=['GET'])
def user_info():     
    user_id = session.get('user_id')
    
    query = f"SELECT * FROM users WHERE user_id = {user_id}"
    
    results = helpers.execute_query(query)
    
    user = {
        'id': results[0][0], 
        'user_password': results[0][1], 
        'email': results[0][2], 
        'f_name': results[0][3], 
        'l_name': results[0][4],
        'phone': results[0][5]
    }

    return jsonify(user)

        
@app.route('/api/update_user', methods=['POST'])
def update_user():
    print(request.form)
    try:
        user_id = session.get('user_id')
        # Get the form data from the request object
        first_name = request.form.get('f_name')
        last_name = request.form.get('l_name')
        email = request.form.get('email')
        password = request.form.get('password')
        phone = ''.join(filter(str.isdigit, request.form.get('phone')))
        
        print(phone)
        # Perform input validation
        if not first_name or not last_name or not email or not password:
            return "Please fill out all required fields", 400
        
        
        # get existing email
        conn = new_db_connection()

        cursor = conn.cursor()

        query = "SELECT email FROM users WHERE user_id = %s"
        values = (user_id,)
        cursor.execute(query, values)

        result = cursor.fetchone()
        existing_email = result[0]

        cursor.close()
        conn.close()
        
        
        if email != existing_email:
            # Check if the email already exists
            conn = new_db_connection()
            cursor = conn.cursor()
            query = "SELECT * FROM users WHERE email=%s"
            cursor.execute(query, (email,))
            existing_user = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if existing_user:
                flash('An account with that email address already exists.', 'error')
                return redirect('/account')
        
        # Update user account
        conn = new_db_connection()
        cursor = conn.cursor()
        
        query = "UPDATE users SET f_name = %s, l_name = %s, email = %s, user_password = %s, phone = %s WHERE user_id = %s"
        values = (first_name, last_name, email, password, phone, user_id)
        cursor.execute(query, values)
        conn.commit()
        
        
        # Redirect the user to the login page
        return redirect('/account')
    
    except:
        flash('An error occurred. Please try again.', 'error')
        return redirect('/account')
    
    finally:
        cursor.close()
        conn.close()
        
        
@app.route('/api/delete_user', methods=['POST'])
def delete_user():
    
    return
    

# -------------------- HYBRID --------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        if helpers.is_valid_credentials(email, password):
            conn = new_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
            user_id = cursor.fetchone()[0]
            cursor.close()
            conn.close()

            session['user_id'] = user_id

            # Redirect the user to the dashboard
            return redirect('/dashboard')
        else:
            # If the credentials are invalid, show an error message
            return render_template('login/index.html', error='Invalid email or password')
        # If the request method is GET, show the login form
    
    # If GET, return the login page
    return render_template('login/index.html')


@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user_id', None)
    return redirect('/')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        try:
            # Get the form data from the request object
            first_name = request.form.get('first_name')
            last_name = request.form.get('last_name')
            email = request.form.get('email')
            password = request.form.get('password')
            
            # Perform input validation
            if not first_name or not last_name or not email or not password:
                return "Please fill out all required fields", 400
            
            # Check if the user already exists
            conn = new_db_connection()
            cursor = conn.cursor()
            query = "SELECT * FROM users WHERE email=%s"
            cursor.execute(query, (email,))
            existing_user = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if existing_user:
                return "An account with that email address already exists", 400
            
            # Create a new user account
            conn = new_db_connection()
            cursor = conn.cursor()
            query = "INSERT INTO users (f_name, l_name, email, user_password) VALUES (%s, %s, %s, %s)"
            values = (first_name, last_name, email, password)
            cursor.execute(query, values)
            conn.commit()
            
            
            # Redirect the user to the login page
            return redirect(url_for('login'))
        
        except:
            return "The request could not be completed", 500
        
        finally:
            cursor.close()
            conn.close()
        
    # If GET, return the signup page
    return render_template('signup/index.html')


# -------------------- STATIC --------------------


@app.route('/account')
def account():
    if not session.get('user_id'):
        return redirect('/')
    user_id = session.get('user_id')
    
    return render_template('account/index.html', user_id=user_id)


@app.route('/dashboard')
def dashboard():
    if not session.get('user_id'):
        return redirect('/')
    user_id = session.get('user_id')
    
    return render_template('dashboard/index.html', user_id=user_id)


@app.route('/')
def index():
    return redirect('/login')


# -------------------- HELPERS --------------------

def new_db_connection():
    return mysql.connector.connect(
        host = 'tvcpw8tpu4jvgnnq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user = 'zmisv7zova93dpr5',
        password = db_password,
        database = 'emm8upo3c4p4gcgr'
    )
