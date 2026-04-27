// This ensures the script waits for the HTML to be ready
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');

    // High-level check: only run if the button exists on this page
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert("Please enter both email and password.");
                return;
            }

            // Visual feedback for the user
            loginBtn.innerText = "Authenticating...";
            loginBtn.disabled = true;

            const { data, error } = await _supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert("Login Error: " + error.message);
                loginBtn.innerText = "Secure Login";
                loginBtn.disabled = false;
            } else {
                // Success: Redirect to the Flask dashboard route
                window.location.href = '/dashboard';
            }
        });
    } else {
        console.warn("loginBtn not found. If this isn't the login page, you can ignore this.");
    }
});