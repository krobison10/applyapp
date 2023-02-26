from flask import Flask, render_template, request, url_for

# to run, use the command 'flask run' in this directory
app = Flask(__name__, static_folder='../client', template_folder='../client/pages')


# access at address
@app.route('/')
def index():
    return render_template('test_page/index.html')


# access at <address>/hello?name=<yourname>
@app.route('/hello')
def hello():
    name = request.args.get('name', 'World')
    return f'Hello, {name}!'


@app.route('/react-test')
def react_test():
    return render_template('react_test/index.html')



# access at <address>/hi
@app.route('/hi')
def hi():
    return 'Hi, World'
