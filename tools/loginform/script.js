document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const formInputs = document.querySelectorAll('.form__input');
    const form = document.querySelector('.form');
    const submitBtn = document.querySelector('.btn');
    const socialIcons = document.querySelectorAll('.social i');
    const creatorSpan = document.querySelector('.input'); // For Typed.js

    // --- 1. Typed.js Initialization (Dynamic Header Text) ---
    // Ensuring the Typed.js instance is only created if the element exists
    if (creatorSpan) {
        new Typed(creatorSpan, {
            strings: ["Web Developer", "UX Designer", "Photographer", "Sanjay Das"],
            typeSpeed: 90,
            backSpeed: 60, // Slightly faster back-spacing
            loop: true,
            showCursor: true,
            cursorChar: '|',
            // Optional: Callbacks for more control
            onComplete: (self) => { console.log('Typing sequence completed'); },
            preStringTyped: (arrayPos, self) => { console.log('Current string:', self.strings[arrayPos]); },
        });
    }

    // --- 2. Enhanced Floating Label Functionality ---
    formInputs.forEach(input => {
        const label = input.nextElementSibling; // Assuming label is the next sibling

        // Function to update label state
        const updateLabelState = () => {
            if (input.value.trim() !== '') {
                input.classList.add('has-content');
            } else {
                input.classList.remove('has-content');
            }
        };

        // Event Listeners for focus/blur
        input.addEventListener('focus', () => {
            input.classList.add('is-focused'); // Add a focus class for distinct styling
            updateLabelState(); // Ensure label floats on focus
        });

        input.addEventListener('blur', () => {
            input.classList.remove('is-focused');
            updateLabelState(); // Check content on blur
        });

        // Handle initial load (e.g., browser autofill)
        updateLabelState();

        // Optional: Add an input event for real-time label update (e.g., if user types and deletes quickly)
        input.addEventListener('input', updateLabelState);
    });

    // --- 3. Robust Form Validation and Submission with Visual Feedback ---
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Stop default form submission

        let isValid = true;
        const formData = {}; // To collect form data

        // --- Validation Logic for each field ---
        // User Name Validation
        const userNameInput = document.querySelector('#userName');
        if (userNameInput.value.trim() === '') {
            showError(userNameInput, 'Please enter your name.');
            isValid = false;
        } else if (userNameInput.value.trim().length < 3) {
            showError(userNameInput, 'Name must be at least 3 characters.');
            isValid = false;
        } else {
            removeError(userNameInput);
            formData.userName = userNameInput.value.trim();
        }

        // Password Validation (more robust: min 6 chars, includes number/symbol)
        const passwordInput = document.querySelector('#password');
        const passwordPattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,}$/;
        if (passwordInput.value.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters.');
            isValid = false;
        } else if (!passwordPattern.test(passwordInput.value)) {
            showError(passwordInput, 'Password needs a number & a special character.');
            isValid = false;
        }
        else {
            removeError(passwordInput);
            formData.password = passwordInput.value;
        }

        // Email Validation
        const userEmailInput = document.querySelector('#userEmail');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(userEmailInput.value)) {
            showError(userEmailInput, 'Please enter a valid email address.');
            isValid = false;
        } else {
            removeError(userEmailInput);
            formData.userEmail = userEmailInput.value;
        }

        // --- Simulate Async Submission if Valid ---
        if (isValid) {
            submitBtn.disabled = true; // Disable button during submission
            submitBtn.textContent = 'Submitting...'; // Change button text
            submitBtn.classList.add('btn-loading'); // Add loading state style

            try {
                // Simulate network request
                const response = await new Promise(resolve => setTimeout(() => {
                    // Simulate success or failure
                    const success = Math.random() > 0.1; // 90% success rate
                    resolve({ success: success, message: success ? 'Registration successful!' : 'Registration failed. Please try again.' });
                }, 2000)); // 2 second delay

                if (response.success) {
                    alert(response.message + '\n' + JSON.stringify(formData, null, 2));
                    form.reset(); // Clear form
                    // Reset floating labels after successful submission
                    formInputs.forEach(input => {
                        input.classList.remove('has-content');
                        input.classList.remove('is-focused');
                    });
                } else {
                    alert('Error: ' + response.message);
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('An unexpected error occurred. Please try again.');
            } finally {
                submitBtn.disabled = false; // Re-enable button
                submitBtn.textContent = 'Submit'; // Reset button text
                submitBtn.classList.remove('btn-loading'); // Remove loading state style
            }
        }
    });

    // --- Helper Functions for Error Display ---
    function showError(input, message) {
        const formGroup = input.closest('.form__group');
        let errorText = formGroup.querySelector('.error-message');
        if (!errorText) {
            errorText = document.createElement('div');
            errorText.classList.add('error-message');
            formGroup.appendChild(errorText);
        }
        errorText.textContent = message;
        input.classList.add('input-error');
        // Optional: Add shake animation for error
        formGroup.classList.add('shake-input');
        formGroup.addEventListener('animationend', () => {
            formGroup.classList.remove('shake-input');
        }, { once: true });
    }

    function removeError(input) {
        const formGroup = input.closest('.form__group');
        const errorText = formGroup.querySelector('.error-message');
        if (errorText) {
            errorText.remove();
        }
        input.classList.remove('input-error');
    }

    // --- 4. Submit Button Click Animation (Controlled by JS) ---
    submitBtn.addEventListener('click', function(event) {
        // This button click animation is now primarily handled before form submission logic
        // It will trigger even if validation fails, providing immediate feedback
        this.classList.add('btn-clicked');
        setTimeout(() => {
            this.classList.remove('btn-clicked');
        }, 300);
    });

    // --- 5. Social Icons Interactive Click Animation ---
    socialIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            this.classList.add('social-clicked');
            // Remove the class after animation
            setTimeout(() => {
                this.classList.remove('social-clicked');
            }, 200); 
            
            // Extract platform name for feedback
            const platform = Array.from(this.classList).find(cls => cls.startsWith('fa-')).replace('fa-', '').replace('-f', '');
            alert(`Redirecting to ${platform.charAt(0).toUpperCase() + platform.slice(1)} login... (Simulation)`);
        });
    });

    // --- 6. Basic Keyboard Navigation (Optional Enhancement) ---
    // Allows pressing Enter to submit when an input field is focused
    formInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent default form submission (handled by form listener)
                // Optionally move focus to next input or submit if last
                const currentInputIndex = Array.from(formInputs).indexOf(input);
                if (currentInputIndex < formInputs.length - 1) {
                    formInputs[currentInputIndex + 1].focus();
                } else {
                    submitBtn.click(); // Simulate click on submit button
                }
            }
        });
    });
});