const Validators = {
    isValidPhone: (phone) => /^(?:\+91|91)?[6-9]\d{9}$/.test(phone),
    isValidOTP: (otp) => /^\d{6}$/.test(otp),
    isValidPincode: (pincode) => /^[1-9][0-9]{5}$/.test(pincode),
    isRequired: (value) => value && value.trim().length > 0,
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
};