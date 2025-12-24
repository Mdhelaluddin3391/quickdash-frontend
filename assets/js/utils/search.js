document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[name="q"]');
    const searchForm = document.querySelector('.search-bar-row') || searchInput?.closest('form');
    
    if (!searchInput || !searchForm) return;

    let suggestBox = document.createElement('div');
    suggestBox.className = 'search-dropdown';
    suggestBox.style.display = 'none';
    searchForm.appendChild(suggestBox);

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);
        if (query.length < 2) { suggestBox.style.display = 'none'; return; }
        debounceTimer = setTimeout(() => fetchSuggestions(query), 300);
    });

    async function fetchSuggestions(query) {
        try {
            const results = await apiCall(`/catalog/suggest/?q=${encodeURIComponent(query)}`, 'GET', null, false);
            renderSuggestions(results);
        } catch (e) {}
    }

    function renderSuggestions(data) {
        if (!data || data.length === 0) { suggestBox.style.display = 'none'; return; }
        suggestBox.innerHTML = '';
        data.forEach(item => {
            const div = document.createElement('a');
            div.href = item.url || `/search_results.html?q=${encodeURIComponent(item.text)}`;
            div.className = 'suggest-item';
            div.innerHTML = `<div>${item.text} <small style="color:#888">${item.type || ''}</small></div>`;
            suggestBox.appendChild(div);
        });
        suggestBox.style.display = 'block';
    }
    
    // Hide on click outside
    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target)) suggestBox.style.display = 'none';
    });
});