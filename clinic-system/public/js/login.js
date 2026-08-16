/**
 * ClinicMS Login/Register JavaScript
 * Handles password toggle and form loading state
 */

(function() {
    'use strict';

    // ---- Password Toggles ----
    const toggleBtns = document.querySelectorAll('.password-toggle');
    
    toggleBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            // Find the input
            let input;
            const targetId = this.getAttribute('data-password-toggle');
            if (targetId) {
                input = document.getElementById(targetId);
            } else {
                // Find the input in the same wrapper
                const wrapper = this.closest('.input-wrapper');
                if (wrapper) {
                    input = wrapper.querySelector('input');
                }
            }
            
            if (!input) return;
            
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);

            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-eye');
                icon.classList.toggle('bi-eye-slash');
            }
        });
    });

    // ---- Form Loading State ----
    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function() {
            const button = this.querySelector('button[type="submit"]');
            if (button) {
                button.classList.add('loading');
                button.disabled = true;
            }
        });
    });

    // ---- Auto-focus on error or first field ----
    const firstError = document.querySelector('.form-input.error');
    if (firstError) {
        firstError.focus();
    } else {
        const firstField = document.getElementById('name') || document.getElementById('email');
        if (firstField) {
            firstField.focus();
        }
    }

    // ---- Date input placeholder fix ----
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(function(input) {
        if (!input.value) {
            input.setAttribute('data-empty', 'true');
        }
        
        input.addEventListener('change', function() {
            if (this.value) {
                this.removeAttribute('data-empty');
            } else {
                this.setAttribute('data-empty', 'true');
            }
        });
    });

})();