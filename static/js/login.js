document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Login Failed: " + error.message);
    } else {
        // Redirecting to dashboard inside the same templates folder
        window.location.href = '/dashboard';
    }
});