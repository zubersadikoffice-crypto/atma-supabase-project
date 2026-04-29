document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initial Session Guard
    const { data: { session }, error } = await _supabase.auth.getSession();
    
    if (!session || error) {
        window.location.href = "/login";
        return;
    }

    const user = session.user;
    
    // 2. Set Profile Info
    const welcomeEl = document.getElementById('welcomeText');
    const emailEl = document.getElementById('userEmail');

    if (welcomeEl) welcomeEl.innerText = `Welcome, ${user.user_metadata.full_name || 'Officer'}`;
    if (emailEl) emailEl.innerText = user.email;

    // 3. Load Dynamic Filters
    // We use await to ensure dropdowns are full before we try to read them
    await Promise.all([loadYears(), loadUserSchemes(user.id)]);

    // 4. Instant Update & Persistence Logic
    const yearSelect = document.getElementById('yearSelect');
    const schemeSelect = document.getElementById('schemeSelect');

    const handleAutoUpdate = () => {
        const yearId = yearSelect.value; 
        const schemeId = schemeSelect.value;
        const yearText = yearSelect.selectedOptions[0]?.text;
        const schemeText = schemeSelect.selectedOptions[0]?.text;

        // Check if both are selected and not in "Loading..." state
        if (yearId && schemeId && !yearText.includes('...') && !schemeText.includes('...')) {
            
            // --- CRITICAL: Save to sessionStorage so Activity Manager can see them ---
            sessionStorage.setItem('activeYearId', yearId);
            sessionStorage.setItem('activeSchemeId', schemeId);

            const statusBox = document.getElementById('viewStatusText');
            if (statusBox) {
                statusBox.classList.remove('empty-state');
                statusBox.innerHTML = `
                    <div class="view-active-text">
                        Viewing Data for <span class="highlight-scheme">${schemeText}</span> 
                        during the <span class="highlight-year">${yearText}</span> cycle.
                    </div>
                `;
            }
        }
    };

    // Attach listeners to both dropdowns for instant updates
    yearSelect.addEventListener('change', handleAutoUpdate);
    schemeSelect.addEventListener('change', handleAutoUpdate);

    // 5. Restore previous selection if user returns to dashboard
    const savedYear = sessionStorage.getItem('activeYearId');
    const savedScheme = sessionStorage.getItem('activeSchemeId');
    
    if (savedYear) yearSelect.value = savedYear;
    if (savedScheme) schemeSelect.value = savedScheme;

    // Trigger update once on load to populate the text
    handleAutoUpdate();

    // 6. Logout Logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            sessionStorage.clear(); // Clear context on logout
            await _supabase.auth.signOut();
            window.location.href = "/login";
        });
    }
});

/**
 * Fetches years from financial_years table
 */
async function loadYears() {
    const yearSelect = document.getElementById('yearSelect');
    try {
        const { data, error } = await _supabase
            .from('financial_years')
            .select('*')
            .order('year_label', { ascending: false });

        if (error) throw error;
        yearSelect.innerHTML = data.map(y => `<option value="${y.id}">${y.year_label}</option>`).join('');
    } catch (e) {
        yearSelect.innerHTML = '<option disabled>Error</option>';
    }
}

/**
 * Fetches schemes assigned to the specific user
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
            schemeSelect.innerHTML = '<option disabled>No Schemes Assigned</option>';
        }
    } catch (e) {
        console.error(e);
        schemeSelect.innerHTML = '<option disabled>Error</option>';
    }
}