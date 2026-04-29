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

@app.route('/new_activity')
def new_activity_page():
    # This will be your main hub for State/District data
    return render_template('new_activity.html')

@app.route('/activity')
def activity_page():
    # This will be your main hub for State/District data
    return render_template('activity.html')

@app.route('/activity_idea')
def activity_idea_page():
    # This will be your main hub for State/District data
    return render_template('activity_idea.html')

@app.route('/dashboard_idea')
def dashboard_idea_page():
    # This will be your main hub for State/District data
    return render_template('dashboard_idea.html')

@app.route('/edit_activity/<activity_id>')
def edit_activity_page(activity_id):
    # Pass the ID to the template so your JS on that page knows which record to fetch
    return render_template('edit_activity.html', activity_id=activity_id)

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