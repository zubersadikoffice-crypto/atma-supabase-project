// static/js/register.js

document.getElementById('registerBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Show a loading state
    const btn = document.getElementById('registerBtn');
    btn.innerText = "Registering...";
    btn.disabled = true;

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
    });

    btn.innerText = "Sign Up";
    btn.disabled = false;

    if (error) {
        // If you see "Storage" errors in the console here, 
        // it's just a warning; check if the 'error' object actually contains a message.
        alert("Error: " + error.message);
    } else {
        alert("Success! Please check your email for the confirmation link.");
        window.location.href = "/login"; // Use the Flask route
    }
});