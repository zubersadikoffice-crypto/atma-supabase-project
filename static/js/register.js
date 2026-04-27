// Wrap everything in this function
document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('registerBtn');

    // Add a check to prevent errors if the button isn't on this specific page
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const level = document.getElementById('admin_level').value;
            const unit = document.getElementById('unit_name').value;

            // ... rest of your registration logic ...
            console.log("Attempting to register:", email);
            
            const { data, error } = await _supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { admin_level: level, unit: unit }
                }
            });

            if (error) alert(error.message);
            else alert("Check your email!");
        });
    }
});