document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('msg-input');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = input.value.trim();
        if(!msg) return;

        appendMessage(msg, 'user');
        input.value = '';

        // Simulate reply
        setTimeout(() => {
            appendMessage("Thank you. An agent will join shortly.", 'staff');
        }, 1000);
    });

    function appendMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.innerHTML = `<div class="bubble">${text}<span class="time">Just now</span></div>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});