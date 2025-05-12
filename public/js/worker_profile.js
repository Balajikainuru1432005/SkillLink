document.addEventListener("DOMContentLoaded", function () {
    // Elements
    const displaySection = document.getElementById("profile-display");
    const editSection = document.getElementById("profile-edit");
    const editForm = document.getElementById("edit-form");
    const workerImage = document.getElementById("worker-image");
    const editWorkerImage = document.getElementById("edit-worker-image");

    // Edit button
    document.getElementById("edit-profile-btn").addEventListener("click", function () {
        displaySection.classList.add("hidden");
        editSection.classList.remove("hidden");
    });

    // Cancel button
    document.getElementById("cancel-edit-btn").addEventListener("click", function () {
        editSection.classList.add("hidden");
        displaySection.classList.remove("hidden");
        document.getElementById("worker-image-upload").value = ""; // Reset file input
    });

    // Save changes
    editForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('firstName', document.getElementById("edit-worker-first-name").value);
        formData.append('lastName', document.getElementById("edit-worker-last-name").value);
        formData.append('email', document.getElementById("edit-worker-email").value);
        formData.append('phone', document.getElementById("edit-worker-contact").value);
        formData.append('flat', document.getElementById("edit-worker-flat").value);
        formData.append('area', document.getElementById("edit-worker-area").value);
        formData.append('landmark', document.getElementById("edit-worker-landmark").value);
        formData.append('town', document.getElementById("edit-worker-town").value);
        formData.append('state', document.getElementById("edit-worker-state").value);
        formData.append('pincode', document.getElementById("edit-worker-pincode").value);
        formData.append('district', document.getElementById("edit-worker-district").value);
        formData.append('primarySkill', document.getElementById("edit-worker-primary-skill").value);
        formData.append('yearsOfExperience', document.getElementById("edit-worker-experience").value);
        formData.append('professionalPhone', document.getElementById("edit-worker-professional-phone").value || null);
        formData.append('professionalEmail', document.getElementById("edit-worker-professional-email").value || null);
        formData.append('workTiming', document.getElementById("edit-worker-work-timing").value);
        formData.append('description', document.getElementById("edit-worker-description").value || '');

        // Handle electricianSubSkills if present
        const subSkillsInput = document.getElementById("edit-worker-sub-skills");
        if (subSkillsInput) {
            const subSkills = subSkillsInput.value.split(',').map(skill => skill.trim()).filter(skill => skill);
            formData.append('electricianSubSkills', JSON.stringify(subSkills));
        }

        // Handle profile photo upload
        const workerImageFile = document.getElementById("worker-image-upload").files[0];
        if (workerImageFile) {
            formData.append('profilePhoto', workerImageFile);
            // Update the preview immediately
            editWorkerImage.src = URL.createObjectURL(workerImageFile);
        }

        try {
            const response = await fetch('/update-worker-profile', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                // Update the display with the new data
                workerImage.src = data.profilePhoto || workerImage.src;
                document.getElementById("worker-name").textContent = `${data.firstName} ${data.lastName}`;
                document.getElementById("worker-email").textContent = data.email;
                document.getElementById("worker-contact").textContent = data.phone;
                document.getElementById("worker-address").textContent = `${data.flat}, ${data.area}, ${data.landmark}, ${data.town}, ${data.state} - ${data.pincode}, ${data.district}`;
                document.getElementById("worker-primary-skill").textContent = data.primarySkill;
                document.getElementById("worker-experience").textContent = data.yearsOfExperience;
                if (data.professionalPhone) {
                    document.getElementById("worker-professional-phone").textContent = data.professionalPhone;
                }
                if (data.professionalEmail) {
                    document.getElementById("worker-professional-email").textContent = data.professionalEmail;
                }
                document.getElementById("worker-work-timing").textContent = data.workTiming;
                if (data.electricianSubSkills) {
                    const subSkills = JSON.parse(data.electricianSubSkills);
                    document.getElementById("worker-sub-skills").textContent = subSkills.length > 0 ? subSkills.join(', ') : 'None';
                }
                document.getElementById("worker-description").textContent = data.description || 'No description provided';

                // Switch back to display mode
                editSection.classList.add("hidden");
                displaySection.classList.remove("hidden");
                document.getElementById("worker-image-upload").value = ""; // Reset file input
                alert("Profile updated successfully!");
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Network error: Unable to connect to the server.');
        }
    });
});