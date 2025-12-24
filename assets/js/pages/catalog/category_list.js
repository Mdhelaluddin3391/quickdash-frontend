document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('category-grid');
    try {
        const response = await apiCall('/catalog/categories/?page_size=100');
        const categories = response.results || response;
        
        grid.innerHTML = categories.filter(c => !c.parent).map(cat => `
            <a href="/search_results.html?slug=${cat.slug}" class="cat-card">
                <img src="${cat.icon_url || 'https://via.placeholder.com/50'}" class="cat-img" style="width:60px;height:60px;">
                <div class="cat-name">${cat.name}</div>
            </a>
        `).join('');
    } catch (e) {
        grid.innerHTML = '<p class="text-center">Failed to load categories.</p>';
    }
});