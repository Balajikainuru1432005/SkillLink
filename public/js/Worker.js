const stateDistrictMap = {
    "Telangana": ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Chithoor"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"]
};

const stateSelect = document.getElementById('state');
const districtSelect = document.getElementById('district');

stateSelect.addEventListener('change', function () {
    const selectedState = stateSelect.value;
    districtSelect.innerHTML = '<option value="">Select District</option>';

    if (selectedState) {
        districtSelect.disabled = false;
        stateDistrictMap[selectedState].forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    } else {
        districtSelect.disabled = true;
    }
});

// Validation Functions
function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)(?=.{6,})/;
    return regex.test(password);
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    const validDomains = ["com", "in", "org", "net", "edu", "gov"];
    const domain = email.split('.').pop();
    return regex.test(email) && validDomains.includes(domain);
}

function validatePhone(phone) {
    const regex = /^\d{10}$/;
    return regex.test(phone);
}

function validatePincode(pincode) {
    const regex = /^\d{6}$/;
    return regex.test(pincode);
}

function validatePriceRange(minInput, maxInput) {
    const minPrice = parseInt(minInput.value.trim());
    const maxPrice = parseInt(maxInput.value.trim());
    const priceError = minInput.parentNode.querySelector('.validation-message') || document.createElement('div');
    priceError.classList.add('validation-message');

    if (isNaN(minPrice) || isNaN(maxPrice) || minPrice < 0 || maxPrice < 0) {
        minInput.classList.add("error");
        maxInput.classList.add("error");
        minInput.classList.remove("valid");
        maxInput.classList.remove("valid");
        priceError.style.display = "block";
        priceError.textContent = "Please enter valid positive numbers.";
        return false;
    } else if (minPrice >= maxPrice) {
        minInput.classList.add("error");
        maxInput.classList.add("error");
        minInput.classList.remove("valid");
        maxInput.classList.remove("valid");
        priceError.style.display = "block";
        priceError.textContent = "Min price must be less than max price.";
        return false;
    } else {
        minInput.classList.remove("error");
        maxInput.classList.remove("error");
        minInput.classList.add("valid");
        maxInput.classList.add("valid");
        priceError.style.display = "none";
        return true;
    }
}

function validateFile(fileInput, allowedTypes, maxSizeMB) {
    if (!fileInput.files || fileInput.files.length === 0) return false;
    const file = fileInput.files[0];
    return allowedTypes.includes(file.type) && file.size <= maxSizeMB * 1024 * 1024;
}

// File Preview Function
function setupFilePreview(inputId, previewId, errorId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const error = document.getElementById(errorId);

    if (input && preview) {
        input.addEventListener('change', function () {
            const file = input.files[0];
            if (file) {
                if (!validateFile(input, ['image/jpeg', 'image/png', 'application/pdf'], 5)) {
                    preview.innerHTML = `<i class="bx bx-file"></i>`;
                    error.style.display = "block";
                    error.textContent = `Please upload a valid file for ${inputId} (JPG/PNG/PDF, max 5MB).`;
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    if (file.type.startsWith('image/')) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="${inputId} Preview" style="max-width: 200px; max-height: 200px;">`;
                    } else if (file.type === 'application/pdf') {
                        preview.innerHTML = `<p>PDF selected: ${file.name}</p>`;
                    }
                };
                reader.readAsDataURL(file);
                error.style.display = "none";
            } else {
                preview.innerHTML = `<i class="bx bx-file"></i>`;
                error.style.display = "block";
                error.textContent = `No file selected for ${inputId}.`;
            }
        });
    }
}

// Initialize File Previews
setupFilePreview('profilePhoto', 'selfiePreview', 'selfieError');
setupFilePreview('govt-id', 'govtIdPreview', 'govtIdError');
setupFilePreview('selfie-id', 'selfieIdPreview', 'selfieIdError');
setupFilePreview('driving-license', 'drivingLicensePreview', 'drivingLicenseError');
setupFilePreview('degreeCertificate', 'degreeCertificatePreview', 'degreeCertificateError');
setupFilePreview('intermediateCertificate', 'intermediateCertificatePreview', 'intermediateCertificateError');
setupFilePreview('tenthCertificate', 'tenthCertificatePreview', 'tenthCertificateError');

// Real-Time Validation
document.getElementById("email").addEventListener("input", function () {
    const email = this.value.trim();
    const emailError = document.getElementById("emailError");
    if (!validateEmail(email)) {
        this.classList.add("error");
        this.classList.remove("valid");
        emailError.style.display = "block";
        emailError.textContent = "Please enter a valid email address (e.g., example@domain.com).";
    } else {
        this.classList.remove("error");
        this.classList.add("valid");
        emailError.style.display = "none";
    }
});

document.getElementById("Password").addEventListener("input", function () {
    const password = this.value;
    const passwordError = document.getElementById("passwordError");
    if (!validatePassword(password)) {
        this.classList.add("error");
        this.classList.remove("valid");
        passwordError.style.display = "block";
    } else {
        this.classList.remove("error");
        this.classList.add("valid");
        passwordError.style.display = "none";
    }
});

document.getElementById("retypePassword").addEventListener("input", function () {
    const retypePassword = this.value;
    const password = document.getElementById("Password").value;
    const retypePasswordError = document.getElementById("retypePasswordError");
    if (retypePassword !== password) {
        this.classList.add("error");
        this.classList.remove("valid");
        retypePasswordError.style.display = "block";
    } else {
        this.classList.remove("error");
        this.classList.add("valid");
        retypePasswordError.style.display = "none";
    }
});

document.getElementById("phone").addEventListener("input", function () {
    const phone = this.value;
    const phoneError = document.getElementById("phoneError");
    if (!validatePhone(phone)) {
        this.classList.add("error");
        this.classList.remove("valid");
        phoneError.style.display = "block";
    } else {
        this.classList.remove("error");
        this.classList.add("valid");
        phoneError.style.display = "none";
    }
});

document.getElementById("pincode").addEventListener("input", function () {
    const pincode = this.value;
    const pincodeError = document.getElementById("pincodeError");
    if (!validatePincode(pincode)) {
        this.classList.add("error");
        this.classList.remove("valid");
        pincodeError.style.display = "block";
    } else {
        this.classList.remove("error");
        this.classList.add("valid");
        pincodeError.style.display = "none";
    }
});

document.getElementById("professional-phone").addEventListener("input", function () {
    const phone = this.value;
    const phoneError = document.getElementById("professional-phone-error");
    if (phone && !validatePhone(phone)) {
        this.classList.add("error");
        this.classList.remove("valid");
        phoneError.style.display = "block";
        phoneError.textContent = "Phone number must be 10 digits long.";
    } else {
        this.classList.remove("error");
        this.classList.add("valid");
        phoneError.style.display = "none";
    }
});

document.getElementById("professional-email").addEventListener("input", function () {
    const email = this.value;
    const emailError = document.getElementById("professional-email-error");
    if (email && !validateEmail(email)) {
        this.classList.add("error");
        this.classList.remove("valid");
        emailError.style.display = "block";
        emailError.textContent = "Please enter a valid email address.";
    } else {
        this.classList.remove("error");
        this.classList.add("valid");
        emailError.style.display = "none";
    }
});

document.getElementById("years-of-experience").addEventListener("input", function () {
    const experience = this.value;
    const experienceError = document.getElementById("experienceError");
    if (isNaN(experience) || experience < 0) {
        this.classList.add("error");
        this.classList.remove("valid");
        experienceError.style.display = "block";
    } else {
        this.classList.remove("error");
        this.classList.add("valid");
        experienceError.style.display = "none";
    }
});

document.querySelectorAll('.price-input').forEach((input, index, inputs) => {
    const priceError = document.createElement('div');
    priceError.classList.add('validation-message');
    input.parentNode.insertBefore(priceError, input.nextSibling.nextSibling);

    input.addEventListener('input', function () {
        const pairIndex = Math.floor(index / 2) * 2;
        const minInput = inputs[pairIndex];
        const maxInput = inputs[pairIndex + 1];
        if (minInput && maxInput) validatePriceRange(minInput, maxInput);
    });
});

// Skill Logic
function enforcePrimarySkillSelection() {
    const primarySkills = document.querySelectorAll('input[name="primarySkill"]');
    return Array.from(primarySkills).some(skill => skill.checked);
}

function isDriverSelected() {
    return document.querySelector('input[name="primarySkill"][value="Driver"]:checked');
}

function toggleDrivingLicenseUpload() {
    const drivingLicenseContainer = document.getElementById("driving-license-container");
    drivingLicenseContainer.style.display = isDriverSelected() ? "block" : "none";
}

function toggleElectricianSubSkills() {
    const electricianSubSkills = document.getElementById("electrician-sub-skills");
    const generalElectricalList = document.getElementById("general-electrical-list");
    const appliancesElectricalList = document.getElementById("appliances-electrical-list");
    const electricianSelected = document.querySelector('input[name="primarySkill"][value="Electrician"]:checked');

    electricianSubSkills.style.display = electricianSelected ? "block" : "none";
    generalElectricalList.style.display = document.querySelector('input[name="electricianSubSkills"][value="General Electrical"]:checked') ? "block" : "none";
    appliancesElectricalList.style.display = document.querySelector('input[name="electricianSubSkills"][value="Appliances Electrical"]:checked') ? "block" : "none";
}

function displayWorksForProfession(profession) {
    const worksSection = document.getElementById("works-section");
    worksSection.innerHTML = "";

    const worksList = document.createElement("ul");
    worksList.classList.add("active");

    const works = {
        "Carpenter": ["Furniture Repair & Assembly", "Installations & Hangers", "Doors & Windows"],
        "Plumber": ["Repairs & Fixes", "Installations & Replacements", "Appliance & Fixture Services"],
        "Mechanical": ["Vehicle Repairs & Servicing", "Electrical & Wiring Work", "Installation & Customization"],
        "Painter": ["Wall & Home Painting", "Wood & Metal Painting", "Industrial & Custom Painting"],
        "Driver": ["Car Driving"]
    };

    works[profession].forEach(work => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `${work} <div class="price-range-container">
                                <input type="number" class="price-input" placeholder="Min Price" data-service="${work}">
                                <span>-</span>
                                <input type="number" class="price-input" placeholder="Max Price" data-service="${work}">
                              </div>`;
        worksList.appendChild(listItem);
    });

    worksSection.appendChild(worksList);

    document.querySelectorAll('.price-input').forEach((input, index, inputs) => {
        const priceError = document.createElement('div');
        priceError.classList.add('validation-message');
        input.parentNode.insertBefore(priceError, input.nextSibling.nextSibling);

        input.addEventListener('input', function () {
            const pairIndex = Math.floor(index / 2) * 2;
            const minInput = inputs[pairIndex];
            const maxInput = inputs[pairIndex + 1];
            if (minInput && maxInput) validatePriceRange(minInput, maxInput);
        });
    });
}

document.getElementById("primary-skills").addEventListener("change", function (e) {
    if (e.target.type === "radio" && e.target.checked) {
        const selectedPrimarySkill = e.target.value;
        document.getElementById("works-section").innerHTML = "";
        toggleDrivingLicenseUpload();
        if (selectedPrimarySkill === "Electrician") {
            toggleElectricianSubSkills();
        } else {
            document.getElementById("electrician-sub-skills").style.display = "none";
            displayWorksForProfession(selectedPrimarySkill);
        }
    }
});

document.getElementById("electrician-sub-skills").addEventListener("change", function (e) {
    if (e.target.type === "checkbox") {
        toggleElectricianSubSkills();
    }
});

// Progress Bar and Navigation
const steps = document.querySelectorAll(".step");
const progressBar = document.getElementById("progress-bar");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const formSteps = document.querySelectorAll(".form-step");
let currentStep = 0;

function updateProgress() {
    const progressPercentage = (currentStep / (steps.length - 1)) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    steps.forEach((step, index) => step.classList.toggle("active", index <= currentStep));
    formSteps.forEach((formStep, index) => formStep.classList.toggle("active", index === currentStep));
}

function validatePersonalDetails() {
    const fields = [
        { id: 'firstName', validator: val => val.trim() !== '', errorId: 'firstNameError', errorMsg: 'First name required' },
        { id: 'lastName', validator: val => val.trim() !== '', errorId: 'lastNameError', errorMsg: 'Last name required' },
        { id: 'phone', validator: validatePhone, errorId: 'phoneError', errorMsg: 'Phone must be 10 digits' },
        { id: 'email', validator: validateEmail, errorId: 'emailError', errorMsg: 'Invalid email format' },
        { id: 'Password', validator: validatePassword, errorId: 'passwordError', errorMsg: 'Password must be 6+ chars with uppercase, number, special char' },
        { id: 'retypePassword', validator: val => val === document.getElementById('Password').value, errorId: 'retypePasswordError', errorMsg: 'Passwords do not match' },
        { id: 'flat', validator: val => val.trim() !== '', errorId: 'flatError', errorMsg: 'Flat/House number required' },
        { id: 'area', validator: val => val.trim() !== '', errorId: 'areaError', errorMsg: 'Area/Street required' },
        { id: 'landmark', validator: val => val.trim() !== '', errorId: 'landmarkError', errorMsg: 'Landmark required' },
        { id: 'pincode', validator: validatePincode, errorId: 'pincodeError', errorMsg: 'Pincode must be 6 digits' },
        { id: 'town', validator: val => val.trim() !== '', errorId: 'townError', errorMsg: 'Town/City required' },
        { id: 'state', validator: val => val !== '', errorId: 'stateError', errorMsg: 'State required' },
        { id: 'district', validator: val => val !== '', errorId: 'districtError', errorMsg: 'District required' },
        { id: 'profilePhoto', validator: () => validateFile(document.getElementById('profilePhoto'), ['image/jpeg', 'image/png', 'application/pdf'], 5), errorId: 'selfieError', errorMsg: 'Profile photo required (JPG/PNG/PDF, max 5MB)' }
    ];

    let isValid = true;
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.errorId);
        const value = field.id === 'profilePhoto' ? input : input.value.trim();
        const fieldValid = field.validator(value);

        input.classList.toggle('error', !fieldValid);
        error.style.display = fieldValid ? 'none' : 'block';
        error.textContent = fieldValid ? '' : field.errorMsg;
        if (!fieldValid) {
            console.log(`Validation failed for ${field.id}: Value="${value}", Error="${field.errorMsg}"`);
            isValid = false;
        }
    });

    console.log(`Personal details validation result: ${isValid}`);
    return isValid;
}

function validateProfessionalDetails() {
    const fields = [
        { id: 'professional-phone', validator: validatePhone, errorId: 'professional-phone-error', errorMsg: 'Phone must be 10 digits', optional: true },
        { id: 'professional-email', validator: validateEmail, errorId: 'professional-email-error', errorMsg: 'Invalid email format', optional: true },
        { id: 'years-of-experience', validator: val => !isNaN(val) && val >= 0, errorId: 'experienceError', errorMsg: 'Enter a valid number' },
        { id: 'work-timing', validator: val => val !== '', errorId: 'workTimingError', errorMsg: 'Work timing required' }
    ];

    let isValid = true;
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.errorId);
        const value = input.value.trim();
        const fieldValid = field.optional ? (value === '' || field.validator(value)) : field.validator(value);

        input.classList.toggle('error', !fieldValid);
        error.style.display = fieldValid ? 'none' : 'block';
        error.textContent = fieldValid ? '' : field.errorMsg;
        if (!fieldValid) isValid = false;
    });

    if (!enforcePrimarySkillSelection()) {
        alert("Please select at least one primary skill.");
        return false;
    }

    // Validate price ranges
    const priceInputs = document.querySelectorAll('.price-input');
    for (let i = 0; i < priceInputs.length; i += 2) {
        const minInput = priceInputs[i];
        const maxInput = priceInputs[i + 1];
        if (minInput.value.trim() || maxInput.value.trim()) {
            if (!validatePriceRange(minInput, maxInput)) {
                isValid = false;
            }
        }
    }

    return isValid;
}

function validateDocumentDetails() {
    const fields = [
        { id: 'govt-id', validator: () => validateFile(document.getElementById('govt-id'), ['image/jpeg', 'image/png', 'application/pdf'], 5), errorId: 'govtIdError', errorMsg: 'Government ID required (JPG/PNG/PDF, max 5MB)' },
        { id: 'selfie-id', validator: () => validateFile(document.getElementById('selfie-id'), ['image/jpeg', 'image/png', 'application/pdf'], 5), errorId: 'selfieIdError', errorMsg: 'Selfie with ID required (JPG/PNG/PDF, max 5MB)' },
        { id: 'degreeCertificate', validator: () => validateFile(document.getElementById('degreeCertificate'), ['image/jpeg', 'image/png', 'application/pdf'], 5), errorId: 'degreeCertificateError', errorMsg: 'Degree certificate required (JPG/PNG/PDF, max 5MB)', optional: true },
        { id: 'intermediateCertificate', validator: () => validateFile(document.getElementById('intermediateCertificate'), ['image/jpeg', 'image/png', 'application/pdf'], 5), errorId: 'intermediateCertificateError', errorMsg: 'Intermediate certificate required (JPG/PNG/PDF, max 5MB)', optional: true },
        { id: 'tenthCertificate', validator: () => validateFile(document.getElementById('tenthCertificate'), ['image/jpeg', 'image/png', 'application/pdf'], 5), errorId: 'tenthCertificateError', errorMsg: 'Tenth certificate required (JPG/PNG/PDF, max 5MB)', optional: true }
    ];

    if (isDriverSelected()) {
        fields.push({
            id: 'driving-license',
            validator: () => validateFile(document.getElementById('driving-license'), ['image/jpeg', 'image/png', 'application/pdf'], 5),
            errorId: 'drivingLicenseError',
            errorMsg: 'Driving License required (JPG/PNG/PDF, max 5MB)'
        });
    }

    let isValid = true;
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.errorId);
        const fieldValid = field.optional ? (input.files.length === 0 || field.validator()) : field.validator();

        input.classList.toggle('error', !fieldValid);
        error.style.display = fieldValid ? 'none' : 'block';
        error.textContent = fieldValid ? '' : field.errorMsg;
        if (!fieldValid && !field.optional) isValid = false;
    });

    return isValid;
}

async function checkEmailUniqueness(email) {
    try {
        const response = await fetch('http://localhost:3000/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        console.log('checkEmailUniqueness response:', response);
        const data = await response.json();
        console.log('checkEmailUniqueness data:', data);
        return !data.exists;
    } catch (error) {
        console.error('Email check error:', error);
        return false; // Assume email is taken if check fails
    }
}

async function checkPhoneUniqueness(phone) {
    try {
        const response = await fetch('http://localhost:3000/check-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        console.log('checkPhoneUniqueness response:', response);
        const data = await response.json();
        console.log('checkPhoneUniqueness data:', data);
        return !data.exists;
    } catch (error) {
        console.error('Phone check error:', error);
        return false; // Assume phone is taken if check fails
    }
}

async function checkServerStatus() {
    try {
        console.log('Checking server status at http://localhost:3000/');
        const response = await fetch('http://localhost:3000/', { method: 'GET' });
        console.log('Server status response:', response);
        return response.ok;
    } catch (error) {
        console.error('Server status check failed:', error);
        return false;
    }
}

nextBtns.forEach(button => {
    button.addEventListener("click", async (e) => {
        e.preventDefault();
        if (currentStep === 0) {
            const email = document.getElementById('email').value.trim();
            const emailUnique = await checkEmailUniqueness(email);
            if (!emailUnique) {
                document.getElementById('emailError').textContent = 'Email already used for another role';
                document.getElementById('emailError').style.display = 'block';
                return;
            }
            if (validatePersonalDetails() && currentStep < steps.length - 1) {
                currentStep++;
                updateProgress();
            } else {
                alert("Please fill all required fields in Personal Details.");
            }
        } else if (currentStep === 1) {
            if (validateProfessionalDetails() && currentStep < steps.length - 1) {
                currentStep++;
                updateProgress();
            } else {
                alert("Please fill all required fields in Professional Details.");
            }
        }
    });
});

prevBtns.forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentStep > 0) {
            currentStep--;
            updateProgress();
        }
    });
});

// Function to extract price ranges from the form
function extractPriceRanges() {
    const priceRanges = {};

    // Extract Electrician sub-skill prices if applicable
    const electricianSelected = document.querySelector('input[name="primarySkill"][value="Electrician"]:checked');
    if (electricianSelected) {
        const generalElectrical = document.querySelector('input[name="electricianSubSkills"][value="General Electrical"]:checked');
        const appliancesElectrical = document.querySelector('input[name="electricianSubSkills"][value="Appliances Electrical"]:checked');

        if (generalElectrical) {
            const generalWorks = [
                { name: "Wiring Installation", selector: "#general-electrical-list li:nth-child(1) .price-range-container" },
                { name: "Lighting Installation", selector: "#general-electrical-list li:nth-child(2) .price-range-container" }
            ];

            generalWorks.forEach(work => {
                const container = document.querySelector(work.selector);
                const minPrice = container.querySelector('input[placeholder="Min Price"]').value.trim();
                const maxPrice = container.querySelector('input[placeholder="Max Price"]').value.trim();
                if (minPrice && maxPrice) {
                    priceRanges[work.name] = { min: parseInt(minPrice), max: parseInt(maxPrice) };
                }
            });
        }

        if (appliancesElectrical) {
            const applianceWorks = [
                { name: "Appliance Repair", selector: "#appliances-electrical-list li:nth-child(1) .price-range-container" },
                { name: "Appliance Installation", selector: "#appliances-electrical-list li:nth-child(2) .price-range-container" }
            ];

            applianceWorks.forEach(work => {
                const container = document.querySelector(work.selector);
                const minPrice = container.querySelector('input[placeholder="Min Price"]').value.trim();
                const maxPrice = container.querySelector('input[placeholder="Max Price"]').value.trim();
                if (minPrice && maxPrice) {
                    priceRanges[work.name] = { min: parseInt(minPrice), max: parseInt(maxPrice) };
                }
            });
        }
    } else {
        // Extract prices for other professions
        const worksSection = document.getElementById("works-section");
        const workItems = worksSection.querySelectorAll("ul li");
        workItems.forEach(item => {
            const serviceName = item.childNodes[0].textContent.trim();
            const container = item.querySelector('.price-range-container');
            const minPrice = container.querySelector('input[placeholder="Min Price"]').value.trim();
            const maxPrice = container.querySelector('input[placeholder="Max Price"]').value.trim();
            if (minPrice && maxPrice) {
                priceRanges[serviceName] = { min: parseInt(minPrice), max: parseInt(maxPrice) };
            }
        });
    }

    return priceRanges;
}

document.getElementById("worker-signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateDocumentDetails()) {
        alert("Please upload all required documents.");
        return;
    }

    // Check server status before submitting
    const serverIsRunning = await checkServerStatus();
    if (!serverIsRunning) {
        console.error('Server status check failed. Ensure server is running on http://localhost:3000');
        alert('Unable to connect to the server. Please check the console for details and ensure the server is running.');
        return;
    }

    // Check email and phone uniqueness
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const emailUnique = await checkEmailUniqueness(email);
    if (!emailUnique) {
        document.getElementById('emailError').textContent = 'Email already used for another role';
        document.getElementById('emailError').style.display = 'block';
        return;
    }

    const phoneUnique = await checkPhoneUniqueness(phone);
    if (!phoneUnique) {
        document.getElementById('phoneError').textContent = 'Phone number already used for another role';
        document.getElementById('phoneError').style.display = 'block';
        return;
    }

    const formData = new FormData();
    formData.append('firstName', document.getElementById('firstName').value.trim());
    formData.append('lastName', document.getElementById('lastName').value.trim());
    formData.append('phone', document.getElementById('phone').value.trim());
    formData.append('email', document.getElementById('email').value.trim());
    formData.append('password', document.getElementById('Password').value.trim());
    formData.append('professionalPhone', document.getElementById('professional-phone').value.trim() || '');
    formData.append('professionalEmail', document.getElementById('professional-email').value.trim() || '');
    formData.append('yearsOfExperience', parseInt(document.getElementById('years-of-experience').value) || 0);
    formData.append('description', document.getElementById('description').value.trim() || '');
    formData.append('primarySkill', document.querySelector('input[name="primarySkill"]:checked')?.value || '');
    formData.append('electricianSubSkills', JSON.stringify(Array.from(document.querySelectorAll('input[name="electricianSubSkills"]:checked')).map(input => input.value)));
    formData.append('flat', document.getElementById('flat').value.trim());
    formData.append('area', document.getElementById('area').value.trim());
    formData.append('landmark', document.getElementById('landmark').value.trim());
    formData.append('pincode', document.getElementById('pincode').value.trim());
    formData.append('town', document.getElementById('town').value.trim());
    formData.append('state', document.getElementById('state').value.trim());
    formData.append('district', document.getElementById('district').value.trim());
    formData.append('workTiming', document.getElementById('work-timing').value.trim());
    formData.append('role', 'worker');

    // Extract and append price ranges
    const priceRanges = extractPriceRanges();
    formData.append('priceRanges', JSON.stringify(priceRanges));

    const profilePhoto = document.getElementById('profilePhoto').files[0];
    if (profilePhoto) formData.append('profilePhoto', profilePhoto);

    const govtId = document.getElementById('govt-id').files[0];
    if (govtId) formData.append('govtId', govtId);

    const selfieId = document.getElementById('selfie-id').files[0];
    if (selfieId) formData.append('selfieId', selfieId);

    const drivingLicense = document.getElementById('driving-license').files[0];
    if (drivingLicense && isDriverSelected()) formData.append('drivingLicense', drivingLicense);

    const certificates = [
        { inputId: 'degreeCertificate', fieldName: 'degreeCertificate' },
        { inputId: 'intermediateCertificate', fieldName: 'intermediateCertificate' },
        { inputId: 'tenthCertificate', fieldName: 'tenthCertificate' }
    ];

    certificates.forEach(({ inputId, fieldName }) => {
        const input = document.getElementById(inputId);
        if (input && input.files[0]) formData.append(fieldName, input.files[0]);
    });

    try {
        console.log('Submitting form to http://localhost:3000/signup');
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            body: formData,
            credentials: 'include' // Include cookies for session handling
        });

        console.log('Signup response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));

        if (!response.ok) {
            const text = await response.text();
            console.error('Response body:', text);
            throw new Error(`Server responded with status ${response.status}: ${text}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Expected JSON response, but received: ' + text);
        }

        const data = await response.json();
        console.log('Signup response data:', data);

        if (data.success) {
            alert('Worker signup successful! Please login.');
            window.location.href = '/login';
        } else {
            console.error('Server response error:', data);
            const errorMessage = data.error.includes('Invalid file type') 
                ? 'Invalid file type. Only JPG, PNG, and PDF are allowed.'
                : data.error || 'Unknown error occurred. Check the console for details.';
            alert('Signup failed: ' + errorMessage);
        }
    } catch (error) {
        console.error('Fetch error during signup:', error.message, error.stack);
        alert('Failed to submit signup request. Error: ' + error.message + '. Check the console for more details.');
    }
});

updateProgress();