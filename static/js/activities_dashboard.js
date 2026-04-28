let currentDeleteId = null;

document.addEventListener('DOMContentLoaded', async () => {
    loadFilters();
    
    document.getElementById('fetchBtn').addEventListener('click', fetchActivities);
});

async function loadFilters() {
    const [years, schemes] = await Promise.all([
        _supabase.from('financial_years').select('*'),
        _supabase.from('schemes').select('*')
    ]);

    const fySelect = document.getElementById('fySelect');
    fySelect.innerHTML = years.data.map(y => `<option value="${y.id}">${y.year_label}</option>`).join('');

    const scSelect = document.getElementById('schemeSelect');
    scSelect.innerHTML = schemes.data.map(s => `<option value="${s.id}">${s.scheme_name}</option>`).join('');
}

async function fetchActivities() {
    const fyId = document.getElementById('fySelect').value;
    const scId = document.getElementById('schemeSelect').value;

    const { data, error } = await _supabase
        .from('activities')
        .select('*')
        .eq('financial_year_id', fyId)
        .eq('scheme_id', scId);

    const tbody = document.getElementById('activityBody');
    document.getElementById('recordCount').innerText = `${data?.length || 0} Total`;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No activities found for this selection.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(act => `
        <tr>
            <td><strong>${act.activity_code}</strong></td>
            <td>${act.activity_name}</td>
            <td style="color: #8e8e8e; font-size: 0.8rem;">${act.description || 'N/A'}</td>
            <td>
                <button class="btn-edit" onclick="editActivity('${act.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="btn-delete" onclick="confirmDelete('${act.id}')"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        </tr>
    `).join('');
}

// DELETE LOGIC
function confirmDelete(id) {
    currentDeleteId = id;
    document.getElementById('confirmModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

document.getElementById('confirmBtn').addEventListener('click', async () => {
    const { error } = await _supabase.from('activities').delete().eq('id', currentDeleteId);
    
    if (!error) {
        closeModal();
        fetchActivities(); // Refresh list
    } else {
        alert("Error deleting: " + error.message);
    }
});

// EDIT REDIRECT
function editActivity(id) {
    // Redirect to your edit page (you'll need to create this route/template)
    window.location.href = `/edit_activity/${id}`;
}