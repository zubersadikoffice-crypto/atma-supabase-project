from flask import Flask, render_template, redirect, url_for, send_from_directory
import os

# Vercel needs the path to be relative to the 'api' folder
# '..' moves up to the root where 'static' and 'templates' live
app = Flask(__name__, 
            static_folder='../static', 
            template_folder='../templates')

# --- ROUTING ---

@app.route('/')
def index():
    # Redirect base URL to login
    return redirect(url_for('login_page'))

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/dashboard')
def dashboard_page():
    # This will be your main hub for State/District data
    return render_template('dashboard.html')

@app.route('/add_activity')
def add_activity_page():
    # This will be your main hub for State/District data
    return render_template('add_activity.html')

@app.route('/manage_activity')
def manage_activity_page():
    # This will be your main hub for State/District data
    return render_template('activities_dashboard.html')

@app.route('/edit_activity/<int:activity_id>')
def edit_activity_page(activity_id):
    # This route accepts the ID and renders the edit template
    return render_template('edit_activity.html')

@app.route('/logout')
def logout_page():
    return render_template('logout.html')

# --- STATIC FILE SERVING ---
@app.route('/static/<path:filename>')
def custom_static(filename):
    return send_from_directory(app.static_folder, filename)

# CRITICAL: For Vercel, we do NOT use app.run() at the bottom.
# But we keep this block so it still works in GitHub Codespaces.
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)