document.addEventListener('DOMContentLoaded', () => {

    // 1. Search Bar Logic
    const input = document.querySelector('.search-bar-row input');
    const searchBar = document.querySelector('.search-bar-row');
    if (input && searchBar) {
        // Focus: Jab click karein
        input.addEventListener('focus', () => {
            searchBar.style.backgroundColor = '#fff';
        });
        // Blur: Jab kahin aur click karein
        input.addEventListener('blur', () => {
            searchBar.style.backgroundColor = 'var(--light)';
        });
    }

    // 2. Promo Card Auto-Swipe Logic
    const scrollBanner = document.querySelector('.scroll-banner');
    if (scrollBanner) {
        let currentCardIndex = 0;
        const promoCards = scrollBanner.querySelectorAll('.promo-card');
        if (promoCards.length > 1) {
            setInterval(() => {
                currentCardIndex = (currentCardIndex + 1) % promoCards.length;
                const nextCard = promoCards[currentCardIndex];
                
                // Card ke left position tak scroll karein
                scrollBanner.scroll({
                    left: nextCard.offsetLeft,
                    behavior: 'smooth'
                });
            }, 3000); // Har 3 second mein
        }
    }

    // 3. Cart Update Logic (Frontend Animation Only - Backend sync utils/home.js karega)
    const allAddButtons = document.querySelectorAll('.add-to-cart');
    const cartCountElement = document.querySelector('.cart-count');

    if(cartCountElement) {
        let currentCartCount = parseInt(cartCountElement.innerText);

        allAddButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                // Note: Asli logic window.addToCart (home.js) sambhal raha hai, yeh sirf visual animation ke liye hai
                // Agar backend integration hai toh ise hata bhi sakte hain
                
                // Button ko animate karein
                cartCountElement.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    cartCountElement.style.transform = 'scale(1)';
                }, 200);
            });
        });
    }
});