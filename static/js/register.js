document.getElementById('registerBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const level = document.getElementById('level').value;
    const unitName = document.getElementById('unit_name').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (!level || !unitName) {
        alert("Please select your Level and Unit Name.");
        return;
    }

    const btn = document.getElementById('registerBtn');
    btn.innerText = "Registering...";
    btn.disabled = true;

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                admin_level: level,
                unit: unitName
            }
        }
    });

    btn.innerText = "Sign Up";
    btn.disabled = false;

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Success! Check your email for the confirmation link.");
        // Redirect back to login file
        window.location.href = "/login";
    }
});