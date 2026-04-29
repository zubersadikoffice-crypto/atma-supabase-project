document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check if _supabase exists
    if (typeof _supabase === 'undefined') {
        console.error("Supabase client not found. Ensure auth.js is loaded correctly.");
        return;
    }

    // 2. Load dropdown data AND handle dashboard parameters
    // We use 'await' here to ensure selections happen AFTER the list is built
    await loadDropdownData();

    // 3. Handle Form Submission
    const form = document.getElementById('activityForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        handleActivitySubmission();
    });
});

async function loadDropdownData() {
    try {
        const [yearsResponse, schemesResponse] = await Promise.all([
            _supabase.from('financial_years').select('id, year_label').order('year_label', { ascending: false }),
            _supabase.from('schemes').select('id, scheme_name').order('scheme_name', { ascending: true })
        ]);

        const fySelect = document.getElementById('fySelect');
        const schemeSelect = document.getElementById('schemeSelect');

        // Populate Financial Years
        fySelect.innerHTML = '<option value="" disabled selected>Select Year</option>';
        if (yearsResponse.data) {
            yearsResponse.data.forEach(yr => {
                fySelect.innerHTML += `<option value="${yr.id}">${yr.year_label}</option>`;
            });
        }

        // Populate Schemes
        schemeSelect.innerHTML = '<option value="" disabled selected>Select Scheme</option>';
        if (schemesResponse.data) {
            schemesResponse.data.forEach(sc => {
                schemeSelect.innerHTML += `<option value="${sc.id}">${sc.scheme_name}</option>`;
            });
        }

        // --- NEW LOGIC: GET DATA FROM URL ---
        const urlParams = new URLSearchParams(window.location.search);
        const yearParam = urlParams.get('year');
        const schemeParam = urlParams.get('scheme');

        if (yearParam) {
            fySelect.value = yearParam;
            fySelect.disabled = true; // Block changes
        }

        if (schemeParam) {
            schemeSelect.value = schemeParam;
            schemeSelect.disabled = true; // Block changes
        }
        // ------------------------------------

    } catch (err) {
        console.error("Data Load Error:", err);
    }
}

async function handleActivitySubmission() {
    const btn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const msg = document.getElementById('responseMsg');

    btn.disabled = true;
    btnText.innerText = "Processing...";
    msg.innerText = "";

    // IMPORTANT: .value still works even if the element is .disabled
    const payload = {
        financial_year_id: parseInt(document.getElementById('fySelect').value),
        scheme_id: parseInt(document.getElementById('schemeSelect').value),
        activity_code: document.getElementById('activityCode').value.trim(),
        activity_name: document.getElementById('activityName').value.trim(),
        description: document.getElementById('description').value.trim() || null
    };

    const { error } = await _supabase.from('activities').insert([payload]);

    if (error) {
        msg.style.color = "#e11d48";
        msg.innerText = "Error: " + error.message;
        btn.disabled = false;
        btnText.innerText = "Try Again";
    } else {
        msg.style.color = "#10b981";
        msg.innerText = "Success! Activity recorded.";
        
        // Don't reset if fields are disabled, or you'll lose the Year/Scheme selection
        document.getElementById('activityCode').value = "";
        document.getElementById('activityName').value = "";
        document.getElementById('description').value = "";
        
        setTimeout(() => {
            btn.disabled = false;
            btnText.innerText = "Add Activity";
        }, 2000);
    }
}