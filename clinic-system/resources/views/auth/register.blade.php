<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account · Clinic Management System</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

    <!-- Custom Login CSS -->
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
</head>
<body>

    <div class="auth-page">
        <!-- REGISTER SECTION - Completely independent from login -->
        <div class="register-section">
            
            <!-- Brand -->
            <div class="register-brand">
                <div class="register-brand-icon">
                    <i class="bi bi-heart-pulse-fill"></i>
                </div>
                <div class="register-brand-name">Clinic<span>MS</span></div>
            </div>

            <!-- Header -->
            <div class="register-header">
                <h1>Create your account</h1>
                <p>Fill in the details below to register.</p>
            </div>

            <!-- ECG Divider -->
            <div class="register-divider">
                <svg viewBox="0 0 680 20" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="registerEcgGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.05"/>
                            <stop offset="40%" stop-color="#ffffff"/>
                            <stop offset="60%" stop-color="#06B6D4"/>
                            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
                        </linearGradient>
                    </defs>
                    <path d="M0,10 L200,10 L220,1 L235,19 L250,10 L680,10"/>
                </svg>
            </div>

            <!-- Flash Messages -->
            @if ($errors->any())
                <div class="register-alert register-alert-error">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- Register Form -->
            <form method="POST" action="{{ route('register') }}" class="register-form" id="registerForm">
                @csrf

                <!-- Full Name - Full Width -->
                <div class="register-field register-field-full">
                    <label for="register_name">Full name</label>
                    <div class="register-input-wrapper">
                        <i class="bi bi-person-fill register-input-icon"></i>
                        <input
                            id="register_name"
                            type="text"
                            name="name"
                            value="{{ old('name') }}"
                            placeholder="Enter your full name"
                            autocomplete="name"
                            required
                            autofocus
                            class="register-input @error('name') register-input-error @enderror"
                        >
                    </div>
                    @error('name')
                        <span class="register-input-feedback">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Email - Full Width -->
                <div class="register-field register-field-full">
                    <label for="register_email">Email address</label>
                    <div class="register-input-wrapper">
                        <i class="bi bi-envelope-fill register-input-icon"></i>
                        <input
                            id="register_email"
                            type="email"
                            name="email"
                            value="{{ old('email') }}"
                            placeholder="Enter your email address"
                            autocomplete="username"
                            required
                            class="register-input @error('email') register-input-error @enderror"
                        >
                    </div>
                    @error('email')
                        <span class="register-input-feedback">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Phone - Full Width -->
                <div class="register-field register-field-full">
                    <label for="register_phone">Phone number</label>
                    <div class="register-input-wrapper">
                        <i class="bi bi-telephone-fill register-input-icon"></i>
                        <input
                            id="register_phone"
                            type="text"
                            name="phone"
                            value="{{ old('phone') }}"
                            placeholder="Enter your phone number"
                            autocomplete="tel"
                            class="register-input @error('phone') register-input-error @enderror"
                        >
                    </div>
                    @error('phone')
                        <span class="register-input-feedback">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Gender + Date of Birth - Two Columns -->
                <div class="register-row">
                    <!-- Gender -->
                    <div class="register-field">
                        <label for="register_gender">Gender</label>
                        <div class="register-input-wrapper">
                            <i class="bi bi-gender-ambiguous register-input-icon"></i>
                            <select
                                id="register_gender"
                                name="patient_gender"
                                class="register-input register-select @error('patient_gender') register-input-error @enderror"
                            >
                                <option value="">Select gender</option>
                                <option value="male" {{ old('patient_gender') == 'male' ? 'selected' : '' }}>Male</option>
                                <option value="female" {{ old('patient_gender') == 'female' ? 'selected' : '' }}>Female</option>
                            </select>
                        </div>
                        @error('patient_gender')
                            <span class="register-input-feedback">{{ $message }}</span>
                        @enderror
                    </div>

                    <!-- Date of Birth -->
                    <div class="register-field">
                        <label for="register_dob">Date of birth</label>
                        <div class="register-input-wrapper">
                            <i class="bi bi-calendar-fill register-input-icon"></i>
                            <input
                                id="register_dob"
                                type="date"
                                name="date_of_birth"
                                value="{{ old('date_of_birth') }}"
                                class="register-input register-date @error('date_of_birth') register-input-error @enderror"
                                onfocus="this.showPicker && this.showPicker()"
                            >
                        </div>
                        @error('date_of_birth')
                            <span class="register-input-feedback">{{ $message }}</span>
                        @enderror
                    </div>
                </div>

                <!-- Address - Full Width -->
                <div class="register-field register-field-full">
                    <label for="register_address">Address</label>
                    <div class="register-input-wrapper">
                        <i class="bi bi-geo-alt-fill register-input-icon"></i>
                        <input
                            id="register_address"
                            type="text"
                            name="patient_address"
                            value="{{ old('patient_address') }}"
                            placeholder="Enter your address"
                            class="register-input @error('patient_address') register-input-error @enderror"
                        >
                    </div>
                    @error('patient_address')
                        <span class="register-input-feedback">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Password + Confirm Password - Two Columns -->
                <div class="register-row">
                    <!-- Password -->
                    <div class="register-field">
                        <label for="register_password">Password</label>
                        <div class="register-input-wrapper">
                            <i class="bi bi-lock-fill register-input-icon"></i>
                            <input
                                id="register_password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                autocomplete="new-password"
                                required
                                class="register-input @error('password') register-input-error @enderror"
                            >
                            <button
                                type="button"
                                class="register-password-toggle"
                                data-toggle="register_password"
                                aria-label="Toggle password visibility"
                            >
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                        @error('password')
                            <span class="register-input-feedback">{{ $message }}</span>
                        @enderror
                    </div>

                    <!-- Confirm Password -->
                    <div class="register-field">
                        <label for="register_password_confirmation">Confirm password</label>
                        <div class="register-input-wrapper">
                            <i class="bi bi-shield-lock-fill register-input-icon"></i>
                            <input
                                id="register_password_confirmation"
                                type="password"
                                name="password_confirmation"
                                placeholder="Confirm your password"
                                autocomplete="new-password"
                                required
                                class="register-input"
                            >
                            <button
                                type="button"
                                class="register-password-toggle"
                                data-toggle="register_password_confirmation"
                                aria-label="Toggle password visibility"
                            >
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Hidden role input -->
                <input type="hidden" name="role" value="patient">

                <!-- Terms Checkbox -->
                <div class="register-terms">
                    <label class="register-checkbox">
                        <input type="checkbox" name="terms" required>
                        <span>I agree to the <a href="#" class="register-terms-link">Terms of Service</a> and <a href="#" class="register-terms-link">Privacy Policy</a></span>
                    </label>
                    @error('terms')
                        <span class="register-input-feedback">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Submit Button -->
                <button type="submit" class="register-button" id="registerButton">
                    <span class="register-spinner"></span>
                    <span class="register-button-text">Create Account</span>
                    <i class="bi bi-arrow-right register-button-icon"></i>
                </button>
            </form>

            <!-- Login Link -->
            <div class="register-login-link">
                Already have an account?
                <a href="{{ route('login') }}">Sign in</a>
            </div>

        </div>
    </div>

    <script src="{{ asset('js/login.js') }}"></script>
</body>
</html>