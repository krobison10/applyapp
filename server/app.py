from flask import Flask, render_template, request, redirect, session, jsonify, url_for
import mysql.connector

import helpers

app = Flask(__name__, static_folder='../client', template_folder='../client/pages')
app.secret_key = '!U!Lc?U+E5imA@asozly'


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://zmisv7zova93dpr5:soduf1rla58j8elj@tvcpw8tpu4jvgnnq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/emm8upo3c4p4gcgr'


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
    SELECT interview_id, company_name, title, interview_date, modality, meeting_location
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
            'company': row[1], 
            'title': row[2], 
            'date': row[3], 
            'modality': row[4],
            'location': row[5] 
        }
        applications.append(application)

    # Return the applications as a JSON response
    return jsonify(applications)
    

# -------------------- HYBRID --------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        if helpers.is_valid_credentials(email, password):
            conn = mysql.connector.connect(
                host='tvcpw8tpu4jvgnnq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
                user='zmisv7zova93dpr5',
                password='soduf1rla58j8elj',
                database='emm8upo3c4p4gcgr'
            )
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


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        return
    
    # If GET, return the login page
    return render_template('login/index.html')


# -------------------- STATIC --------------------


@app.route('/dashboard')
def dashboard():
    user_id = session.get('user_id')
    
    return render_template('dashboard/index.html', user_id=user_id)


@app.route('/')
def index():
    return redirect('/login')
