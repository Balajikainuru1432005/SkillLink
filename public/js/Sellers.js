const steps = document.querySelectorAll(".step");
const formSteps = document.querySelectorAll(".form-step");
const progressBar = document.getElementById("progress-bar");

let currentStep = 0;

function updateProgressBar() {
    const progressPercentage = ((currentStep + 1) / steps.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    console.log(`Progress updated to ${progressPercentage}% at step ${currentStep + 1}`);
}

function showStep(stepIndex) {
    formSteps.forEach((step, index) => {
        step.classList.toggle("active", index === stepIndex);
    });
    steps.forEach((step, index) => {
        step.classList.toggle("active", index === stepIndex);
    });
    console.log(`Showing step ${stepIndex + 1}`);
    formSteps[stepIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const validatePhone = phone => /^\+?\d{10,12}$/.test(phone);
const validatePincode = pincode => /^\d{6}$/.test(pincode);
const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    const invalidDomains = ["000", "example"];
    const domain = email.split('@')[1]?.split('.')[0];
    return emailRegex.test(email) && !invalidDomains.includes(domain);
};
const validatePassword = password => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/.test(password);
const validateFile = (fileInput, allowedTypes, maxSizeMB, required = false) => {
    if (!fileInput.files || !fileInput.files.length) {
        console.log(`No file selected for ${fileInput.id}`);
        return !required;
    }
    const file = fileInput.files[0];
    const isValid = allowedTypes.includes(file.type) && file.size <= maxSizeMB * 1024 * 1024;
    console.log(`File validation for ${fileInput.id}: ${isValid ? 'Valid' : 'Invalid'} - Type: ${file.type}, Size: ${file.size / 1024 / 1024}MB`);
    return isValid;
};

function setupRealTimeValidation(inputId, errorId, validationFn, errorMessage, optional = false) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    
    input.addEventListener('input', () => {
        const value = input.value.trim();
        const isValid = optional ? (value === '' || (validationFn && validationFn(value))) : (validationFn ? validationFn(value) : value !== '');
        
        input.classList.toggle('error', !isValid);
        error.classList.toggle('show', !isValid);
        error.textContent = !isValid ? errorMessage : '';
        console.log(`${inputId} validation: ${isValid ? 'Valid' : 'Invalid'} - Value: ${value}`);
    });

    if (input.tagName === 'SELECT') {
        input.addEventListener('change', () => {
            const value = input.value.trim();
            const isValid = optional ? (value === '' || (validationFn && validationFn(value))) : (validationFn ? validationFn(value) : value !== '');
            
            input.classList.toggle('error', !isValid);
            error.classList.toggle('show', !isValid);
            error.textContent = !isValid ? errorMessage : '';
            console.log(`${inputId} (dropdown) validation on change: ${isValid ? 'Valid' : 'Invalid'} - Value: ${value}`);
        });
    }
}

async function checkEmailUniqueness(email) {
    try {
        console.log(`Checking email uniqueness for: ${email}`);
        const response = await fetch('/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        console.log(`Email check response: ${JSON.stringify(data)}`);
        return !data.exists;
    } catch (error) {
        console.error('Email check error:', error);
        return false;
    }
}

function validatePersonalDetails() {
    const fields = [
        { id: 'firstName', validator: val => val.trim() !== '', errorId: 'firstName-error', message: 'Please enter your first name' },
        { id: 'lastName', validator: val => val.trim() !== '', errorId: 'lastName-error', message: 'Please enter your last name' },
        { id: 'phone', validator: validatePhone, errorId: 'phone-error', message: 'Please enter a valid phone number (e.g., +91 9934930223)' },
        { id: 'email', validator: validateEmail, errorId: 'email-error', message: 'Please enter a valid email address' },
        { id: 'password', validator: validatePassword, errorId: 'password-error', message: 'Password must be 6+ chars with uppercase, number, and special char' },
        { id: 'retype-password', validator: val => val === document.getElementById('password').value, errorId: 'retype-password-error', message: 'Passwords do not match' },
        { id: 'flat', validator: val => val.trim() !== '', errorId: 'flat-error', message: 'Please enter your flat/house number' },
        { id: 'area', validator: val => val.trim() !== '', errorId: 'area-error', message: 'Please enter your area/street' },
        { id: 'landmark', validator: val => val.trim() !== '', errorId: 'landmark-error', message: 'Please enter a landmark' },
        { id: 'pincode', validator: validatePincode, errorId: 'pincode-error', message: 'Please enter a valid 6-digit pincode' },
        { id: 'town', validator: val => val.trim() !== '', errorId: 'town-error', message: 'Please enter your town/city' },
        { id: 'state', validator: val => val !== '', errorId: 'state-error', message: 'Please select a state' },
        { id: 'district', validator: val => {
            const stateSelect = document.getElementById('state');
            return stateSelect.value === '' || val !== '';
        }, errorId: 'district-error', message: 'Please select a district' },
        { id: 'profile-pic', validator: () => validateFile(document.getElementById('profile-pic'), ['image/jpeg', 'image/png'], 5, true), errorId: 'profile-pic-error', message: 'Please upload a valid profile picture (JPG, PNG, max 5MB)' }
    ];

    let isValid = true;
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.errorId);
        const value = field.id === 'profile-pic' ? input : input.value.trim();
        const fieldValid = field.validator(value);
        
        input.classList.toggle('error', !fieldValid);
        error.classList.toggle('show', !fieldValid);
        error.textContent = !fieldValid ? field.message : '';
        if (!fieldValid) {
            console.log(`Validation failed for ${field.id}: ${value}`);
            isValid = false;
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    console.log(`Personal details validation result: ${isValid}`);
    return isValid;
}

function validateProfessionalDetails() {
    const fields = [
        { id: 'shop-name', validator: val => val.trim() !== '', errorId: 'shop-name-error', message: 'Please enter your shop name' },
        { id: 'professional-phone', validator: validatePhone, errorId: 'professional-phone-error', message: 'Please enter a valid phone number', optional: true },
        { id: 'professional-email', validator: validateEmail, errorId: 'professional-email-error', message: 'Please enter a valid email address', optional: true },
        { id: 'flat-professional', validator: val => val.trim() !== '', errorId: 'flat-professional-error', message: 'Please enter your flat/house number' },
        { id: 'area-professional', validator: val => val.trim() !== '', errorId: 'area-professional-error', message: 'Please enter your area/street' },
        { id: 'landmark-professional', validator: val => val.trim() !== '', errorId: 'landmark-professional-error', message: 'Please enter a landmark' },
        { id: 'pincode-professional', validator: validatePincode, errorId: 'pincode-professional-error', message: 'Please enter a valid 6-digit pincode' },
        { id: 'town-professional', validator: val => val.trim() !== '', errorId: 'town-professional-error', message: 'Please enter your town/city' },
        { id: 'state-professional', validator: val => val !== '', errorId: 'state-professional-error', message: 'Please select a state' },
        { id: 'district-professional', validator: val => {
            const stateSelect = document.getElementById('state-professional');
            return stateSelect.value === '' || val !== '';
        }, errorId: 'district-professional-error', message: 'Please select a district' }
    ];

    let isValid = true;
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.errorId);
        const value = input.value.trim();
        const fieldValid = field.optional ? (value === '' || field.validator(value)) : field.validator(value);
        
        input.classList.toggle('error', !fieldValid);
        error.classList.toggle('show', !fieldValid);
        error.textContent = !fieldValid ? field.message : '';
        if (!fieldValid) {
            console.log(`Validation failed for ${field.id}: ${value}`);
            isValid = false;
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    isValid = isValid && validateShopPictures();

    const shopTypes = document.querySelectorAll('input[name="shop-type"]:checked');
    const hasShopType = shopTypes.length > 0;
    const shopTypeError = document.getElementById('shop-type-error');
    shopTypeError.classList.toggle('show', !hasShopType);
    shopTypeError.textContent = !hasShopType ? 'Please select at least one shop type' : '';
    if (!hasShopType) {
        document.querySelector('.checkbox-grid').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    isValid = isValid && hasShopType;

    console.log(`Professional details validation result: ${isValid}`);
    return isValid;
}

function validateShopPictures() {
    const shopPictures = document.querySelectorAll('.shop-picture');
    const error = document.getElementById('shop-pictures-error');
    let validFiles = 0;
    
    shopPictures.forEach(picture => {
        if (picture.files.length && validateFile(picture, ['image/jpeg', 'image/png'], 5, true)) {
            validFiles++;
        }
    });
    
    const isValid = validFiles >= 2;
    error.classList.toggle('show', !isValid);
    error.textContent = !isValid ? 'Please upload at least 2 valid shop pictures (JPG, PNG, max 5MB each)' : '';
    console.log(`Shop pictures validation: ${isValid} (${validFiles} valid files)`);
    if (!isValid) {
        document.getElementById('shop-pictures-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return isValid;
}

function addFileInput() {
    const container = document.getElementById("shop-pictures-container");
    const wrapper = document.createElement("div");
    wrapper.className = "file-input-wrapper";
    
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.className = "shop-picture";
    fileInput.name = "shopImages";
    fileInput.accept = ".jpg,.jpeg,.png";
    
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "🗑";
    deleteButton.onclick = () => removeFileInput(deleteButton);
    
    wrapper.appendChild(fileInput);
    wrapper.appendChild(deleteButton);
    container.appendChild(wrapper);
    
    fileInput.addEventListener('change', validateShopPictures);
    console.log('Added new shop picture input');
}

function removeFileInput(button) {
    const container = document.getElementById("shop-pictures-container");
    if (container.children.length > 2) {
        button.parentElement.remove();
        validateShopPictures();
        console.log('Removed shop picture input');
    } else {
        console.log('Cannot remove: Minimum 2 shop pictures required');
    }
}

function populateDistricts(stateSelectId, districtSelectId) {
    const stateSelect = document.getElementById(stateSelectId);
    const districtSelect = document.getElementById(districtSelectId);
    const error = document.getElementById(`${districtSelectId}-error`);

    if (!stateSelect || !districtSelect || !error) {
        console.error(`Cannot populate districts: Missing elements - stateSelect: ${stateSelectId}, districtSelect: ${districtSelectId}`);
        return;
    }

    const map = window.stateDistrictMap || {};
    console.log(`stateDistrictMap for ${districtSelectId}:`, map);

    // Initialize district dropdown state
    districtSelect.innerHTML = '<option value="">Select District</option>';
    if (!Object.keys(map).length) {
        console.warn(`stateDistrictMap is empty or undefined for ${districtSelectId}. Disabling district selection.`);
        districtSelect.disabled = true;
        districtSelect.innerHTML = '<option value="">Districts unavailable</option>';
        error.classList.add('show');
        error.textContent = 'Districts unavailable due to missing state data';
        return;
    }

    // Remove any existing change event listeners to prevent duplicates
    const newStateSelect = stateSelect.cloneNode(true);
    stateSelect.parentNode.replaceChild(newStateSelect, stateSelect);

    // Update reference to the new state select element
    const updatedStateSelect = document.getElementById(stateSelectId);

    // Initialize district dropdown based on current state value
    const initialState = updatedStateSelect.value;
    if (initialState && map[initialState]) {
        districtSelect.disabled = false;
        map[initialState].forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
        console.log(`Initialized ${districtSelectId} with ${map[initialState].length} districts for state: ${initialState}`);
    } else {
        districtSelect.disabled = true;
        districtSelect.innerHTML = '<option value="">Select a state first</option>';
        console.log(`Initialized ${districtSelectId} as disabled - no state selected or invalid state: ${initialState}`);
    }

    // Add change event listener for state updates
    updatedStateSelect.addEventListener('change', () => {
        const selectedState = updatedStateSelect.value;
        console.log(`State changed for ${stateSelectId}: ${selectedState}`);

        // Reset district dropdown
        districtSelect.innerHTML = '<option value="">Select District</option>';
        districtSelect.value = '';

        if (selectedState && map[selectedState]) {
            districtSelect.disabled = false;
            map[selectedState].forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
            console.log(`Populated ${districtSelectId} with ${map[selectedState].length} districts for state: ${selectedState}`);
        } else {
            districtSelect.disabled = true;
            districtSelect.innerHTML = '<option value="">Select a state first</option>';
            console.log(`Disabled ${districtSelectId} - no state selected or invalid state: ${selectedState}`);
        }

        // Clear any previous error state
        districtSelect.classList.remove('error');
        error.classList.remove('show');
        error.textContent = '';
    });

    // Trigger validation on district change
    districtSelect.addEventListener('change', () => {
        const districtValid = updatedStateSelect.value === '' || districtSelect.value !== '';
        districtSelect.classList.toggle('error', !districtValid);
        error.classList.toggle('show', !districtValid);
        error.textContent = !districtValid ? 'Please select a district' : '';
        console.log(`${districtSelectId} validation on change: ${districtValid ? 'Valid' : 'Invalid'} - Value: ${districtSelect.value}`);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log('DOM loaded, setting up validations...');
    setupRealTimeValidation('firstName', 'firstName-error', null, 'Please enter your first name');
    setupRealTimeValidation('lastName', 'lastName-error', null, 'Please enter your last name');
    setupRealTimeValidation('phone', 'phone-error', validatePhone, 'Please enter a valid phone number (e.g., +91 9934930223)');
    setupRealTimeValidation('email', 'email-error', validateEmail, 'Please enter a valid email address');
    setupRealTimeValidation('password', 'password-error', validatePassword, 'Password must be 6+ chars with uppercase, number, and special char');
    setupRealTimeValidation('retype-password', 'retype-password-error', val => val === document.getElementById('password').value, 'Passwords do not match');
    setupRealTimeValidation('flat', 'flat-error', null, 'Please enter your flat/house number');
    setupRealTimeValidation('area', 'area-error', null, 'Please enter your area/street');
    setupRealTimeValidation('landmark', 'landmark-error', null, 'Please enter a landmark');
    setupRealTimeValidation('pincode', 'pincode-error', validatePincode, 'Please enter a valid 6-digit pincode');
    setupRealTimeValidation('town', 'town-error', null, 'Please enter your town/city');
    setupRealTimeValidation('state', 'state-error', val => val !== '', 'Please select a state');
    setupRealTimeValidation('district', 'district-error', val => {
        const stateSelect = document.getElementById('state');
        return stateSelect.value === '' || val !== '';
    }, 'Please select a district');

    const profilePicInput = document.getElementById('profile-pic');
    profilePicInput.addEventListener('change', () => {
        const error = document.getElementById('profile-pic-error');
        const preview = document.getElementById('profilePicPreview');
        const isValid = validateFile(profilePicInput, ['image/jpeg', 'image/png'], 5, true);
        
        if (isValid && profilePicInput.files.length) {
            const reader = new FileReader();
            reader.onload = e => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Profile Picture">`;
            };
            reader.readAsDataURL(profilePicInput.files[0]);
        } else {
            preview.innerHTML = `<i class="bx bx-user"></i>`;
        }
        
        profilePicInput.classList.toggle('error', !isValid);
        error.classList.toggle('show', !isValid);
        error.textContent = !isValid ? 'Please upload a valid profile picture (JPG, PNG, max 5MB)' : '';
        console.log(`Profile picture changed: ${isValid ? 'Valid' : 'Invalid'}`);
    });

    setupRealTimeValidation('shop-name', 'shop-name-error', null, 'Please enter your shop name');
    setupRealTimeValidation('professional-phone', 'professional-phone-error', validatePhone, 'Please enter a valid phone number', true);
    setupRealTimeValidation('professional-email', 'professional-email-error', validateEmail, 'Please enter a valid email address', true);
    setupRealTimeValidation('flat-professional', 'flat-professional-error', null, 'Please enter your flat/house number');
    setupRealTimeValidation('area-professional', 'area-professional-error', null, 'Please enter your area/street');
    setupRealTimeValidation('landmark-professional', 'landmark-professional-error', null, 'Please enter a landmark');
    setupRealTimeValidation('pincode-professional', 'pincode-professional-error', validatePincode, 'Please enter a valid 6-digit pincode');
    setupRealTimeValidation('town-professional', 'town-professional-error', null, 'Please enter your town/city');
    setupRealTimeValidation('state-professional', 'state-professional-error', val => val !== '', 'Please select a state');
    setupRealTimeValidation('district-professional', 'district-professional-error', val => {
        const stateSelect = document.getElementById('state-professional');
        return stateSelect.value === '' || val !== '';
    }, 'Please select a district');

    document.getElementById('shop-pictures-container').addEventListener('change', validateShopPictures);

    ['govt-id', 'shop-registration', 'gst-registration'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            const error = document.getElementById(`${id}-error`);
            const isValid = validateFile(document.getElementById(id), ['application/pdf', 'image/jpeg', 'image/png'], 5, true);
            error.classList.toggle('show', !isValid);
            error.textContent = !isValid ? `Please upload a valid ${id.replace('-', ' ')} (PDF, JPG, PNG, max 5MB)` : '';
            console.log(`${id} validation: ${isValid ? 'Valid' : 'Invalid'}`);
        });
    });

    populateDistricts('state', 'district');
    populateDistricts('state-professional', 'district-professional');

    updateProgressBar();
    showStep(currentStep);
});

document.querySelectorAll(".next-btn").forEach(button => {
    button.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log(`Next button clicked, current step: ${currentStep + 1}`);

        if (currentStep === 0) {
            const email = document.getElementById('email').value.trim();
            const emailUnique = await checkEmailUniqueness(email);
            if (!emailUnique) {
                const emailError = document.getElementById('email-error');
                emailError.textContent = 'Email already used for another role';
                emailError.classList.add('show');
                console.log('Email check failed - duplicate email');
                alert('This email is already registered. Please use a different email.');
                return;
            }
            if (validatePersonalDetails() && currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
                updateProgressBar();
            } else {
                alert("Please complete all required personal details before proceeding.");
            }
        } else if (currentStep === 1) {
            if (validateProfessionalDetails() && currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
                updateProgressBar();
            } else {
                alert("Please complete all required professional details, including address and shop pictures, before proceeding.");
            }
        }
    });
});

document.querySelectorAll(".prev-btn").forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
            updateProgressBar();
            console.log(`Moved back to step ${currentStep + 1}`);
        }
    });
});

document.getElementById("submit-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    console.log('Submit button clicked');

    if (!validatePersonalDetails() || !validateProfessionalDetails()) {
        alert("Please complete all previous steps correctly before submitting.");
        return;
    }

    const govtIdValid = validateFile(document.getElementById('govt-id'), ['application/pdf', 'image/jpeg', 'image/png'], 5, true);
    const shopRegValid = validateFile(document.getElementById('shop-registration'), ['application/pdf', 'image/jpeg', 'image/png'], 5, true);
    const gstRegValid = validateFile(document.getElementById('gst-registration'), ['application/pdf', 'image/jpeg', 'image/png'], 5, true);

    if (!govtIdValid || !shopRegValid || !gstRegValid) {
        console.log('Document validation failed');
        alert("Please upload all required documents before submitting.");
        return;
    }

    const formData = new FormData();
    formData.append('firstName', document.getElementById('firstName').value.trim());
    formData.append('lastName', document.getElementById('lastName').value.trim());
    formData.append('phone', document.getElementById('phone').value.trim());
    formData.append('email', document.getElementById('email').value.trim());
    formData.append('password', document.getElementById('password').value.trim());
    
    const profilePicInput = document.getElementById('profile-pic');
    if (profilePicInput.files && profilePicInput.files[0]) {
        formData.append('profilePhoto', profilePicInput.files[0]);
    }

    formData.append('shopName', document.getElementById('shop-name').value.trim());
    formData.append('professionalPhone', document.getElementById('professional-phone').value.trim());
    formData.append('professionalEmail', document.getElementById('professional-email').value.trim());
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('shopTypes', JSON.stringify(Array.from(document.querySelectorAll('input[name="shop-type"]:checked')).map(input => input.value)));

    const personalAddress = [
        document.getElementById('flat').value.trim(),
        document.getElementById('area').value.trim(),
        document.getElementById('landmark').value.trim(),
        document.getElementById('town').value.trim(),
        `${document.getElementById('state').value} - ${document.getElementById('pincode').value.trim()}`,
        document.getElementById('district').value
    ].filter(val => val).join(', ');
    formData.append('personalAddress', personalAddress);
    console.log(`Formatted personal address: ${personalAddress}`);

    const professionalAddress = [
        document.getElementById('flat-professional').value.trim(),
        document.getElementById('area-professional').value.trim(),
        document.getElementById('landmark-professional').value.trim(),
        document.getElementById('town-professional').value.trim(),
        `${document.getElementById('state-professional').value} - ${document.getElementById('pincode-professional').value.trim()}`,
        document.getElementById('district-professional').value
    ].filter(val => val).join(', ');
    formData.append('professionalAddress', professionalAddress);
    console.log(`Formatted professional address: ${professionalAddress}`);

    document.querySelectorAll('.shop-picture').forEach(input => {
        if (input.files && input.files[0]) {
            formData.append('shopImages', input.files[0]);
        }
    });
    formData.append('govtId', document.getElementById('govt-id').files[0]);
    formData.append('shopRegistration', document.getElementById('shop-registration').files[0]);
    formData.append('gstRegistration', document.getElementById('gst-registration').files[0]);
    formData.append('role', 'seller');

    try {
        console.log('Submitting form data...');
        const response = await fetch('/signup', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('Server response:', data);
        if (response.ok) {
            alert('Seller signup successful! Redirecting to login...');
            window.location.href = '/login';
        } else {
            console.error('Signup error:', data.error);
            alert('Error: ' + (data.error || 'An error occurred during signup. Please try again.'));
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Network error: Unable to connect to the server. Please check your connection and try again.');
    }
});