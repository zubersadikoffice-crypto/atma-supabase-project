document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initial Session Guard
    const { data: { session }, error } = await _supabase.auth.getSession();
    
    if (!session || error) {
        window.location.href = "/login";
        return;
    }

    const user = session.user;
    
    // 2. Set Profile Info
    document.getElementById('welcomeText').innerText = `Welcome, ${user.user_metadata.full_name || 'Officer'}`;
    document.getElementById('userEmail').innerText = user.email;

    // 3. Load Dynamic Filters
    await loadYears();
    await loadUserSchemes(user.id);

    // 4. Update View Logic
    document.getElementById('updateViewBtn').addEventListener('click', () => {
        const year = document.getElementById('yearSelect').selectedOptions[0].text;
        const scheme = document.getElementById('schemeSelect').selectedOptions[0].text;
        
        document.getElementById('viewStatusText').innerHTML = 
            `Viewing Data for <strong>${scheme}</strong> during the <strong>${year}</strong> cycle.`;
    });

    // 5. Logout Logic
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const { error } = await _supabase.auth.signOut();
        if (error) {
            console.error("Logout Error:", error.message);
        } else {
            window.location.href = "/login";
        }
    });
});

/** * Fetches years from academic_years table 
 */
async function loadYears() {
    const yearSelect = document.getElementById('yearSelect');
    try {
        const { data, error } = await _supabase
            .from('academic_years')
            .select('*')
            .order('year_label', { ascending: false });

        if (error) throw error;
        yearSelect.innerHTML = data.map(y => `<option value="${y.id}">${y.year_label}</option>`).join('');
    } catch (e) {
        yearSelect.innerHTML = '<option disabled>Error loading years</option>';
    }
}

/** * Fetches ONLY the schemes assigned to this user in user_schemes table
 */
async function loadUserSchemes(userId) {
    const schemeSelect = document.getElementById('schemeSelect');
    try {
        const { data, error } = await _supabase
            .from('user_schemes')
            .select('scheme_id, schemes(scheme_name)')
            .eq('user_id', userId);

        if (error) throw error;

        if (data && data.length > 0) {
            schemeSelect.innerHTML = data.map(item => 
                `<option value="${item.scheme_id}">${item.schemes.scheme_name}</option>`
            ).join('');
        } else {
            schemeSelect.innerHTML = '<option disabled>No assigned schemes found.</option>';
        }
    } catch (e) {
        console.error(e);
        schemeSelect.innerHTML = '<option disabled>Error loading schemes</option>';
    }
}