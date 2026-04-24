from flask import Flask, render_template, redirect, url_for, send_from_directory
import os

app = Flask(__name__, 
            static_folder='static', 
            template_folder='templates')

# --- ROUTING ---

@app.route('/')
def index():
    return redirect(url_for('login_page'))

@app.route('/login')
def login_page():
    # Flask looks in the /templates folder automatically
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

# --- FIX FOR PATHS ---
# This ensures that your 'auth.js' and other assets load correctly 
# regardless of how the browser requests them.
@app.route('/static/<path:filename>')
def custom_static(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    # Running on 8080 is perfect for GitHub Codespaces
    app.run(host='0.0.0.0', port=8080, debug=True)