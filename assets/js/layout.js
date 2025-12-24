document.addEventListener("DOMContentLoaded", () => {
    // 1. Load Navbar
    fetch('/components/navbar.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('navbar-placeholder').innerHTML = html;
            
            // Highlight active link
            const currentPath = window.location.pathname;
            document.querySelectorAll('.nav-item').forEach(link => {
                if (link.getAttribute('href') === currentPath) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Initialize Global Scripts that depend on Navbar
            if (window.updateGlobalCartCount) window.updateGlobalCartCount();
            if (window.bindNavbarLocationClick) window.bindNavbarLocationClick();
            if (window.initGlobalLocationWidget) window.initGlobalLocationWidget();
            if (window.loadNavbarCategories) window.loadNavbarCategories();
        });

    // 2. Load Footer
    fetch('/components/footer.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('footer-placeholder').innerHTML = html;
            
            // Update Copyright Year
            const yearSpan = document.querySelector('.copyright-year');
            if(yearSpan) yearSpan.innerText = new Date().getFullYear();
        });
});