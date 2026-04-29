/** * APP CONTROLLER: Coordination and Event Handling
 */

let currentDeleteId = null;

// Initial setup on page load
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Storage Check
    if (!checkStorageAccess()) {
        showToast("Storage blocked!", "error");
        return;
    }

    // 2. Auth Check
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) { window.location.href = "/login"; return; }

    // 3. Load View
    handleRefresh();
});

// Master function to refresh data
async function handleRefresh() {
    const fyId = sessionStorage.getItem('activeYearId');
    const scId = sessionStorage.getItem('activeSchemeId');

    if (!fyId || !scId) {
        showMissingContextError();
        return;
    }

    try {
        uiToggleLoading(true);
        // Step 1: Update the Header Names
        const context = await apiGetContextLabels(fyId, scId);
        document.getElementById('activeContextText').innerHTML = 
            `<span class="highlight-scheme">${context.scheme.scheme_name}</span> (${context.year.year_label})`;

        // Step 2: Fetch and Draw Table
        const activities = await apiGetActivities(fyId, scId);
        uiRenderTable(activities);
        showToast("Data Synced", "success");
    } catch (err) {
        showToast("Sync Failed", "error");
        console.error(err);
    }
}

/**
 * UTILITY: Verifies if the browser is allowing sessionStorage.
 * This prevents the "Tracking Prevention" error from breaking the app.
 */
function checkStorageAccess() {
    try {
        const testKey = '__storage_test__';
        sessionStorage.setItem(testKey, testKey);
        sessionStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

// Delete Handler
async function handleFinalDelete() {
    if (!currentDeleteId) return;
    try {
        showToast("Deleting...", "info");
        await apiDeleteActivity(currentDeleteId);
        showToast("Deleted!", "success");
        closeModal();
        handleRefresh(); // Refresh UI after delete
    } catch (err) {
        showToast("Delete Failed", "error");
    }
}



/** * DATA ENGINE: Pure database operations 
 */

// Fetches raw activity data from Supabase
async function apiGetActivities(fyId, scId) {
    const { data, error } = await _supabase
        .from('activities')
        .select('*')
        .eq('financial_year_id', Number(fyId))
        .eq('scheme_id', Number(scId))
        .order('activity_code', { ascending: true });

    if (error) throw error;
    return data;
}

// Deletes a specific activity by ID
async function apiDeleteActivity(id) {
    const { error } = await _supabase
        .from('activities')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
}

// Fetches labels for the Header UI
async function apiGetContextLabels(yearId, schemeId) {
    const [yearRes, schemeRes] = await Promise.all([
        _supabase.from('financial_years').select('year_label').eq('id', Number(yearId)).maybeSingle(),
        _supabase.from('schemes').select('scheme_name').eq('id', Number(schemeId)).maybeSingle()
    ]);
    return { year: yearRes.data, scheme: schemeRes.data };
}


/** * UI RENDERER: DOM Manipulation and Notifications
 */

function uiToggleLoading(isLoading) {
    const tbody = document.getElementById('activityBody');
    if (isLoading) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Filtering records...</td></tr>`;
    }
}

function uiRenderTable(data) {
    const tbody = document.getElementById('activityBody');
    const recordCount = document.getElementById('recordCount');

    if (recordCount) recordCount.innerText = `${data?.length || 0} Total`;

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No activities found.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(act => `
        <tr>
            <td><span class="code-pill">${act.activity_code}</span></td>
            <td style="font-weight: 600;">${act.activity_name}</td>
            <td class="desc-cell">${act.description || '---'}</td>
            <td>
                <div class="action-flex">
                    <button class="btn-edit" onclick="editActivity('${act.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
                    <button class="btn-delete" onclick="confirmDelete('${act.id}')"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
}