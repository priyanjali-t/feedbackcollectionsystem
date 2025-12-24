// Feedback Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');
    const submitBtn = document.getElementById('submitBtn');
    const charCount = document.getElementById('charCount');
    
    // Get all form fields
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const categorySelect = document.getElementById('category');
    const messageTextarea = document.getElementById('message');
    
    // Get all error spans
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const categoryError = document.getElementById('categoryError');
    const ratingError = document.getElementById('ratingError');
    const messageError = document.getElementById('messageError');

    // Initialize character counter
    updateCharCount();

    // Add event listeners for real-time validation
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    categorySelect.addEventListener('change', validateCategory);
    messageTextarea.addEventListener('input', function() {
        updateCharCount();
        validateMessage();
    });

    // Add character counter update
    messageTextarea.addEventListener('input', updateCharCount);

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate all fields before submission
        const isFormValid = validateForm();
        
        if (!isFormValid) {
            showToast('Please fix the errors in the form before submitting.', 'error');
            return;
        }

        // Get form data
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim().toLowerCase(),
            category: categorySelect.value,
            rating: parseInt(document.querySelector('input[name="rating"]:checked')?.value) || 0,
            message: messageTextarea.value.trim()
        };

        // Show loading state
        setLoadingState(true);

        try {
            // Submit feedback to backend API
            const response = await fetch('/api/feedback/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Show success toast
                showToast(result.message || 'Feedback submitted successfully!', 'success');
                
                // Reset form
                form.reset();
                clearAllErrors();
                updateCharCount();
            } else {
                // Show error toast
                const errorMessage = result.message || result.errors?.join(', ') || 'Failed to submit feedback. Please try again.';
                showToast(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Reset loading state
            setLoadingState(false);
        }
    });

    // Validation functions
    function validateName() {
        const name = nameInput.value.trim();
        clearError(nameError);
        
        if (!name) {
            setError(nameError, 'Name is required');
            return false;
        }
        
        if (name.length < 2) {
            setError(nameError, 'Name must be at least 2 characters long');
            return false;
        }
        
        if (name.length > 50) {
            setError(nameError, 'Name cannot exceed 50 characters');
            return false;
        }
        
        if (!/^[a-zA-Z\s'-]+$/.test(name)) {
            setError(nameError, 'Name can only contain letters, spaces, hyphens, and apostrophes');
            return false;
        }
        
        return true;
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        clearError(emailError);
        
        if (!email) {
            setError(emailError, 'Email is required');
            return false;
        }
        
        if (!isValidEmail(email)) {
            setError(emailError, 'Please enter a valid email address');
            return false;
        }
        
        if (email.length > 100) {
            setError(emailError, 'Email cannot exceed 100 characters');
            return false;
        }
        
        return true;
    }

    function validateCategory() {
        const category = categorySelect.value;
        clearError(categoryError);
        
        if (!category) {
            setError(categoryError, 'Please select a category');
            return false;
        }
        
        return true;
    }

    function validateRating() {
        const rating = document.querySelector('input[name="rating"]:checked');
        clearError(ratingError);
        
        if (!rating) {
            setError(ratingError, 'Please select a rating');
            return false;
        }
        
        return true;
    }

    function validateMessage() {
        const message = messageTextarea.value.trim();
        clearError(messageError);
        
        if (!message) {
            setError(messageError, 'Message is required');
            return false;
        }
        
        if (message.length < 10) {
            setError(messageError, 'Message must be at least 10 characters long');
            return false;
        }
        
        if (message.length > 1000) {
            setError(messageError, 'Message cannot exceed 1000 characters');
            return false;
        }
        
        return true;
    }

    function validateForm() {
        const nameValid = validateName();
        const emailValid = validateEmail();
        const categoryValid = validateCategory();
        const ratingValid = validateRating();
        const messageValid = validateMessage();
        
        return nameValid && emailValid && categoryValid && ratingValid && messageValid;
    }

    // Helper functions
    function setError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }

    function clearError(element) {
        element.textContent = '';
        element.style.display = 'none';
    }

    function clearAllErrors() {
        clearError(nameError);
        clearError(emailError);
        clearError(categoryError);
        clearError(ratingError);
        clearError(messageError);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function updateCharCount() {
        const message = messageTextarea.value;
        const count = message.length;
        charCount.textContent = count;
        
        // Change color if approaching limit
        if (count > 900) {
            charCount.style.color = '#e74c3c';
        } else if (count > 800) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = '#666';
        }
    }

    function setLoadingState(loading) {
        if (loading) {
            submitBtn.disabled = true;
            document.querySelector('.btn-text').style.display = 'none';
            document.querySelector('.btn-loading').style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            document.querySelector('.btn-text').style.display = 'inline';
            document.querySelector('.btn-loading').style.display = 'none';
        }
    }

    // Toast notification function
    function showToast(message, type) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => toast.remove();
        toast.appendChild(closeBtn);

        // Add to body
        document.body.appendChild(toast);

        // Show animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
    }

    // Add keyboard navigation support for rating
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    ratingInputs.forEach((input, index) => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const direction = e.key === 'ArrowRight' ? 1 : -1;
                const nextIndex = Math.max(0, Math.min(ratingInputs.length - 1, index + direction));
                ratingInputs[nextIndex].focus();
            }
        });
    });

    // Add click event for star labels to improve accessibility
    const starLabels = document.querySelectorAll('.rating-container .star');
    starLabels.forEach((label, index) => {
        label.addEventListener('click', function() {
            const radio = ratingInputs[ratingInputs.length - 1 - index];
            radio.checked = true;
        });
    });
});