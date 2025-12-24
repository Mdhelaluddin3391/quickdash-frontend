document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('ast-btn');
    const box = document.getElementById('ast-box');
    const close = document.getElementById('ast-close');
    const sendBtn = document.getElementById('ast-send');
    const input = document.getElementById('ast-input');
    const msgArea = document.getElementById('ast-msgs');

    if (!btn || !box) return;

    btn.addEventListener('click', () => {
        if (box.style.display === 'none' || !box.classList.contains('active')) {
            box.style.display = 'flex';
            setTimeout(() => box.classList.add('active'), 10);
        } else {
            box.classList.remove('active');
            setTimeout(() => box.style.display = 'none', 300);
        }
    });

    if (close) close.addEventListener('click', () => {
        box.classList.remove('active');
        setTimeout(() => box.style.display = 'none', 300);
    });

    async function handleSend() {
        const text = input.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        input.value = '';

        try {
            const res = await apiCall('/catalog/assistant/chat/', 'POST', { message: text });
            addMessage(res.reply, 'bot');
            if (res.action === 'cart_updated') {
                if (window.updateGlobalCartCount) window.updateGlobalCartCount();
            }
        } catch (e) {
            addMessage("Connection issue. Please try again.", 'bot');
        }
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `msg-row ${sender}`;
        div.innerHTML = `<div class="msg-bubble ${sender}">${text.replace(/\n/g, '<br>')}</div>`;
        msgArea.appendChild(div);
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
});