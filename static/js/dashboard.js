async function loadSchemes() {
    const { data, error } = await _supabase
        .from('Blocks') // Using your Blocks table as an example
        .select('*');

    if (data) {
        const container = document.getElementById('scheme-list');
        container.innerHTML = data.map(item => `
            <div class="scheme-card">
                <h3>${item.name}</h3>
                <p>${item.description || 'No description'}</p>
            </div>
        `).join('');
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await _supabase.auth.signOut();
    window.location.href = 'login.html';
});

loadSchemes();