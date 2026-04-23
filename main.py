from flask import Flask, render_template, send_from_directory, redirect, url_for
import os

app = Flask(__name__, 
            static_folder='static', 
            template_folder='templates')

# --- ROUTING ---

@app.route('/')
def index():
    # Redirect base URL to login page
    return redirect(url_for('login_page'))

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/dashboard')
def dashboard_page():
    return render_template('dashboard.html')

@app.route('/logout')
def logout_page():
    return render_template('logout.html')

# --- STATIC FILE SERVING ---
# This ensures your CSS/JS can be found even if the paths get tricky
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    # Use port 8080 for GitHub Codespaces compatibility
    app.run(host='0.0.0.0', port=8080, debug=True)