document.getElementById('forgotPasswordForm').addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('emailOrPhoneError').textContent = '';
    const emailOrPhone = document.getElementById('emailOrPhone').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!emailOrPhone) {
        document.getElementById('emailOrPhoneError').textContent = 'Please enter your email or phone number.';
    } else if (!emailRegex.test(emailOrPhone) && !phoneRegex.test(emailOrPhone)) {
        document.getElementById('emailOrPhoneError').textContent = 'Please enter a valid email or phone number.';
    } else {
        alert('A password reset link has been sent to your email or phone.');
    }
});