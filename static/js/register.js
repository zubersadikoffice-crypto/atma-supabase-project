document.addEventListener('DOMContentLoaded', async () => {
    const registerBtn = document.getElementById('registerBtn');
    const checkboxContainer = document.getElementById('checkbox_container');
    const countBadge = document.getElementById('selection_count');

    // 1. Initial Load: Load schemes from Supabase
    await loadSchemesAsCheckboxes();

    // 2. UI Update: Update selection count badge
    checkboxContainer.addEventListener('change', () => {
        const checkedCount = checkboxContainer.querySelectorAll('input:checked').length;
        countBadge.innerText = `${checkedCount} Scheme(s) Selected`;
        countBadge.className = checkedCount > 0 ? 'selection-badge active' : 'selection-badge';
    });

    // 3. Registration Logic
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            console.log("--- Registration Started ---");

            // Capture inputs
            const fullName = document.getElementById('full_name')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const password = document.getElementById('password')?.value;
            const confirmPass = document.getElementById('confirm_password')?.value;
            const selectedIDs = Array.from(checkboxContainer.querySelectorAll('input:checked')).map(cb => cb.value);

            // Basic Validation
            if (!fullName || !email || !password) return showDialog("Error", "All fields are required.");
            if (password !== confirmPass) return showDialog("Error", "Passwords do not match.");
            if (selectedIDs.length === 0) return showDialog("Error", "Select at least one scheme.");
            if (password.length < 6) return showDialog("Error", "Password must be 6+ characters.");

            // UI State
            registerBtn.innerText = "Processing...";
            registerBtn.disabled = true;

            try {
                console.log("Step 1: Attempting Supabase Auth Sign Up...");
                
                const { data: authData, error: authError } = await _supabase.auth.signUp({
                    email, 
                    password, 
                    options: { 
                        data: { full_name: fullName } // Sent to DB trigger via metadata
                    }
                });

                if (authError) throw authError;
                
                const userId = authData.user.id;
                console.log("Step 2: Auth Success. User UUID:", userId);

                // IMPORTANT: Wait for the DB Trigger to finish creating the profile
                console.log("Step 3: Waiting for DB trigger...");
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 4: Link selected schemes to the new user
                console.log("Step 4: Linking schemes to user_schemes table...");
                const schemeLinks = selectedIDs.map(id => ({
                    user_id: userId,
                    scheme_id: parseInt(id)
                }));

                const { error: linkError } = await _supabase.from('user_schemes').insert(schemeLinks);
                
                if (linkError) {
                    console.error("Link Error Details:", linkError);
                    throw new Error("Auth succeeded, but could not link schemes. Please contact admin.");
                }

                console.log("Step 5: Registration Complete.");
                showDialog("Success", "Account created successfully! Redirecting...", true);
                
                // Final Redirect
                setTimeout(() => window.location.href = "/dashboard", 2000);

            } catch (err) {
                console.error("CRITICAL ERROR DURING SIGNUP:", err.message);
                showDialog("Registration Failed", err.message);
                
                // Reset UI so user can try again
                registerBtn.innerText = "Create Account";
                registerBtn.disabled = false;
            }
        });
    }
});

// Helper: Load schemes from Supabase as Checkboxes
async function loadSchemesAsCheckboxes() {
    const container = document.getElementById('checkbox_container');
    try {
        console.log("Fetching schemes list...");
        const { data, error } = await _supabase.from('schemes').select('id, scheme_name').order('scheme_name');
        
        if (error) throw error;

        container.innerHTML = data.map(s => `
            <div class="scheme-item">
                <input type="checkbox" id="s_${s.id}" value="${s.id}">
                <label for="s_${s.id}">${s.scheme_name}</label>
            </div>
        `).join('');
        
        console.log("Schemes loaded successfully.");
    } catch (e) {
        console.error("Failed to load schemes:", e.message);
        container.innerHTML = '<p style="color:red; padding:10px;">Failed to load schemes from database.</p>';
    }
}

// Dialog Logic
function showDialog(title, message, isSuccess = false) {
    const titleEl = document.getElementById('dialogTitle');
    const msgEl = document.getElementById('dialogMessage');
    const overlay = document.getElementById('statusOverlay');
    const dialog = document.getElementById('statusDialog');

    if (titleEl && msgEl && overlay && dialog) {
        titleEl.innerText = title;
        msgEl.innerText = message;
        titleEl.style.color = isSuccess ? "#10b981" : "#ef4444";
        overlay.style.display = 'block';
        dialog.style.display = 'block';
    } else {
        alert(`${title}: ${message}`);
    }
}

// Global function for the "Okay" button
window.closeDialog = () => {
    document.getElementById('statusOverlay').style.display = 'none';
    document.getElementById('statusDialog').style.display = 'none';
};