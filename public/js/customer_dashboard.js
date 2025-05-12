document.addEventListener("DOMContentLoaded", function () {
    // Work Completed
    document.querySelectorAll(".complete-btn").forEach(button => {
        button.addEventListener("click", function () {
            const workItem = this.closest('.work-item');
            const serviceId = workItem.getAttribute("data-service-id");

            if (workItem.querySelector(".feedback-container")) return;

            const feedbackContainer = document.createElement("div");
            feedbackContainer.classList.add("feedback-container");
            feedbackContainer.innerHTML = `
                <label>Rating (1-5): <input type="number" class="rating-input" min="1" max="5" placeholder="1-5" required></label>
                <textarea class="feedback-input" placeholder="Enter your feedback here..." required></textarea>
                <button class="submit-feedback-btn">Submit</button>
            `;
            workItem.appendChild(feedbackContainer);

            feedbackContainer.querySelector(".submit-feedback-btn").addEventListener("click", function () {
                const ratingInput = feedbackContainer.querySelector(".rating-input");
                const feedbackInput = feedbackContainer.querySelector(".feedback-input");
                const rating = parseInt(ratingInput.value);
                const feedback = feedbackInput.value.trim();

                if (!rating || rating < 1 || rating > 5) {
                    alert("Please provide a valid rating between 1 and 5.");
                    return;
                }
                if (!feedback) {
                    alert("Please provide feedback.");
                    return;
                }

                const payload = { serviceRequestId: serviceId, rating, feedback };
                console.log('Submitting feedback with payload:', payload);

                const submitBtn = feedbackContainer.querySelector(".submit-feedback-btn");
                submitBtn.disabled = true;
                submitBtn.textContent = "Submitting...";

                fetch('/complete-work', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).then(res => {
                    if (!res.ok) {
                        return res.text().then(text => {
                            throw new Error(`Server responded with status ${res.status}: ${text}`);
                        });
                    }
                    return res.json();
                }).then(data => {
                    if (data.success) {
                        alert('Work marked as completed and feedback submitted successfully!');
                        window.location.reload();
                    } else {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Submit";
                        alert('Error completing work: ' + (data.error || 'Unknown error'));
                    }
                }).catch(err => {
                    console.error('Error submitting feedback:', err.message, err.stack);
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Submit";
                    alert('Error submitting feedback: ' + err.message);
                });
            });
        });
    });
});