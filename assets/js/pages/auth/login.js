/* assets/js/pages/auth/login.js */
document.addEventListener('DOMContentLoaded', () => {
    const phoneForm = document.getElementById('phone-form');
    const otpForm = document.getElementById('otp-form');
    const otpInputs = document.querySelectorAll('.otp-field');
    const countdownEl = document.getElementById('countdown');
    let userPhone = '';

    // 1. OTP Input Auto-focus logic
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === 1 && index < otpInputs.length - 1) otpInputs[index + 1].focus();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value.length === 0 && index > 0) otpInputs[index - 1].focus();
        });
    });

    // 2. Step 1: Send OTP
    if (phoneForm) {
        phoneForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            userPhone = document.getElementById('phone').value;
            
            // Basic validation
            if (!/^\d{10}$/.test(userPhone)) {
                return showToast("Enter a valid 10-digit number", "error");
            }

            try {
                // Correct endpoint from your backend notifications/urls.py
                await apiCall('/notifications/send-otp/', 'POST', { 
                    phone: `+91${userPhone}` 
                }, false);
                
                phoneForm.style.display = 'none';
                otpForm.style.display = 'block';
                document.getElementById('display-phone').innerText = userPhone;
                startTimer(30);
                showToast("OTP Sent Successfully", "success");
            } catch (error) { 
                showToast(error.message, "error"); 
            }
        });
    }

    // 3. Step 2: Verify & Login
    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let otpCode = '';
            otpInputs.forEach(i => otpCode += i.value);
            
            if (otpCode.length < 6) return showToast("Enter full OTP", "warning");
            
            try {
                // First verify the OTP
                await apiCall('/notifications/verify-otp/', 'POST', { 
                    phone: `+91${userPhone}`, 
                    otp: otpCode 
                }, false);

                // Then register/login the customer
                const regResponse = await apiCall('/auth/register/customer/', 'POST', { 
                    phone: `+91${userPhone}` 
                }, false);

                // Note: Your backend register view returns user_id, 
                // ensure your SimpleJWT logic is handled or fetch user details
                localStorage.setItem('user_phone', `+91${userPhone}`);
                
                // Fetch full profile to verify authentication
                const userProfile = await apiCall('/auth/me/', 'GET');
                localStorage.setItem('user', JSON.stringify(userProfile));
                
                showToast("Login Successful!", "success");
                setTimeout(() => window.location.href = '/index.html', 1000);
            } catch (error) { 
                showToast(error.message, "error"); 
            }
        });
    }

    function startTimer(duration) {
        let timer = duration;
        const interval = setInterval(() => {
            countdownEl.textContent = timer;
            if (--timer < 0) clearInterval(interval);
        }, 1000);
    }
});