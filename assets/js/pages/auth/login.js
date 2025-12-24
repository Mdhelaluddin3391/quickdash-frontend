document.addEventListener('DOMContentLoaded', () => {
    const phoneForm = document.getElementById('phone-form');
    const otpForm = document.getElementById('otp-form');
    const otpInputs = document.querySelectorAll('.otp-field');
    let userPhone = '';

    // OTP Input Auto-focus logic
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === 1 && index < otpInputs.length - 1) otpInputs[index + 1].focus();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value.length === 0 && index > 0) otpInputs[index - 1].focus();
        });
    });

    if (phoneForm) {
        phoneForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            userPhone = document.getElementById('phone').value;
            try {
                await apiCall('/auth/otp/send/', 'POST', { phone: userPhone, role: 'CUSTOMER' }, false);
                phoneForm.style.display = 'none';
                otpForm.style.display = 'block';
                document.getElementById('display-phone').innerText = userPhone;
            } catch (error) { alert(error.message); }
        });
    }

    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let otpCode = '';
            otpInputs.forEach(i => otpCode += i.value);
            
            try {
                const response = await apiCall('/auth/otp/login/', 'POST', { 
                    phone: userPhone, otp: otpCode, role: 'CUSTOMER' 
                }, false);
                
                localStorage.setItem('access_token', response.access);
                localStorage.setItem('refresh_token', response.refresh);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                window.location.href = '/index.html';
            } catch (error) { alert(error.message); }
        });
    }
});