// Get Activity ID from the URL path
const pathParts = window.location.pathname.split('/');
const activityId = pathParts[pathParts.length - 1];

document.addEventListener('DOMContentLoaded', async () => {
    if (!activityId) {
        alert("Invalid Activity ID");
        return;
    }

    await loadData();

    document.getElementById('editForm').addEventListener('submit', handleUpdate);
});

async function loadData() {
    const msg = document.getElementById('responseMsg');
    
    // 1. Fetch current activity details
    const { data: activity, error } = await _supabase
        .from('activities')
        .select(`
            *,
            financial_years(year_label),
            schemes(scheme_name)
        `)
        .eq('id', activityId)
        .single();

    if (error || !activity) {
        msg.innerHTML = "Error loading activity data.";
        return;
    }

    // 2. Populate Fields
    document.getElementById('displayCode').innerText = activity.activity_code;
    document.getElementById('activityCode').value = activity.activity_code;
    document.getElementById('activityName').value = activity.activity_name;
    document.getElementById('description').value = activity.description || "";

    // 3. Populate Disabled Dropdowns for context
    document.getElementById('fySelect').innerHTML = `<option>${activity.financial_years.year_label}</option>`;
    document.getElementById('schemeSelect').innerHTML = `<option>${activity.schemes.scheme_name}</option>`;
}

async function handleUpdate(e) {
    e.preventDefault();
    
    const btn = document.getElementById('updateBtn');
    const btnText = document.getElementById('btnText');
    const msg = document.getElementById('responseMsg');

    btn.disabled = true;
    btnText.innerText = "Updating...";

    const updatedData = {
        activity_code: document.getElementById('activityCode').value.trim(),
        activity_name: document.getElementById('activityName').value.trim(),
        description: document.getElementById('description').value.trim() || null
    };

    const { error } = await _supabase
        .from('activities')
        .update(updatedData)
        .eq('id', activityId);

    if (error) {
        msg.style.color = "#ef4444";
        msg.innerText = "Update Failed: " + error.message;
        btn.disabled = false;
        btnText.innerText = "Save Changes";
    } else {
        msg.style.color = "#10b981";
        msg.innerText = "Changes saved successfully!";
        
        // Wait and redirect back to dashboard
        setTimeout(() => {
            window.location.href = "/manage_activity"; 
        }, 1500);
    }
}