<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account · Clinic Management System</title>

    <meta name="description" content="Create an account on the Clinic Management System as a patient.">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

    <!-- App styles -->
    <link rel="stylesheet" href="{{ asset('css/login.css')}}">
    
    <style>
        /* Make all input text white when typing */
        .form-control {
            color: #ffffff !important;
            background: rgba(255, 255, 255, 0.06) !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            border-radius: 12px;
            padding: 12px 16px !important;
            padding-left: 44px !important;
            height: auto !important;
        }
        .form-control:focus {
            color: #ffffff !important;
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: #06B6D4 !important;
            box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15) !important;
        }
        /* Hide placeholder text to avoid duplication with floating labels */
        .form-control::placeholder {
            color: transparent !important;
        }
        /* Fix for date input */
        input[type="date"].form-control {
            color: #ffffff !important;
            min-height: 48px !important;
        }
        input[type="date"].form-control::-webkit-datetime-edit {
            color: #ffffff !important;
        }
        input[type="date"].form-control::-webkit-datetime-edit-text {
            color: #ffffff !important;
        }
        input[type="date"].form-control::-webkit-datetime-edit-month-field {
            color: #ffffff !important;
        }
        input[type="date"].form-control::-webkit-datetime-edit-day-field {
            color: #ffffff !important;
        }
        input[type="date"].form-control::-webkit-datetime-edit-year-field {
            color: #ffffff !important;
        }
        input[type="date"].form-control::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
        }
        /* Fix for select dropdowns */
        select.form-control {
            color: #ffffff !important;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 14px center;
            padding-right: 40px !important;
        }
        select.form-control option {
            color: #000000 !important;
            background: #ffffff !important;
        }
        /* Fix for textarea */
        textarea.form-control {
            color: #ffffff !important;
            min-height: 80px !important;
        }
        textarea.form-control::placeholder {
            color: transparent !important;
        }
        /* Fix for password inputs */
        input[type="password"].form-control {
            color: #ffffff !important;
        }
        /* Form control wrap - floating label styles */
        .form-control-wrap {
            position: relative;
        }
        .form-control-wrap .input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.4);
            z-index: 2;
            pointer-events: none;
        }
        .form-control-wrap .form-label {
            position: absolute;
            left: 44px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.5);
            transition: all 0.2s ease;
            pointer-events: none;
            margin: 0;
            font-size: 15px;
            font-weight: 400;
            z-index: 2;
            background: transparent;
        }
        .form-control-wrap .form-control:focus ~ .form-label,
        .form-control-wrap .form-control:not(:placeholder-shown) ~ .form-label {
            top: -10px;
            left: 14px;
            font-size: 11px;
            color: #06B6D4;
            background: #1a1a2e;
            padding: 0 6px;
            transform: translateY(0);
        }
        .form-control-wrap .form-control:focus ~ .form-label {
            color: #06B6D4;
        }
        /* Fix for date input label */
        .form-control-wrap input[type="date"]:not(:placeholder-shown) ~ .form-label,
        .form-control-wrap input[type="date"]:focus ~ .form-label {
            top: -10px;
            left: 14px;
            font-size: 11px;
            color: #06B6D4;
            background: #1a1a2e;
            padding: 0 6px;
            transform: translateY(0);
        }
        /* Fix for textarea label */
        .form-control-wrap textarea:focus ~ .form-label,
        .form-control-wrap textarea:not(:placeholder-shown) ~ .form-label {
            top: -10px !important;
            left: 14px !important;
            font-size: 11px !important;
            color: #06B6D4 !important;
            background: #1a1a2e !important;
            padding: 0 6px !important;
            transform: translateY(0) !important;
        }
        .form-control-wrap .password-toggle {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            padding: 4px;
            z-index: 2;
            transition: color 0.3s ease;
        }
        .form-control-wrap .password-toggle:hover {
            color: rgba(255, 255, 255, 0.8);
        }
        .form-control-wrap .password-toggle:focus {
            outline: none;
        }
        .invalid-feedback {
            color: #ef4444 !important;
            font-size: 12px;
            margin-top: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .invalid-feedback i {
            font-size: 14px;
        }
        .form-control.is-invalid {
            border-color: #ef4444 !important;
        }
        .form-control.is-invalid:focus {
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
        }
    </style>
</head>
<body>

    <div class="bg-layer" aria-hidden="true"></div>
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="blob blob-1" aria-hidden="true"></div>
    <div class="blob blob-2" aria-hidden="true"></div>
    <div class="blob blob-3" aria-hidden="true"></div>
    <div class="particles" aria-hidden="true">
        <span class="particle"></span><span class="particle"></span><span class="particle"></span>
        <span class="particle"></span><span class="particle"></span><span class="particle"></span>
        <span class="particle"></span><span class="particle"></span>
    </div>

    <div class="auth-page">

        <!-- ============ LEFT: HERO ============ -->
        <section class="hero-panel d-none d-lg-flex">
            <div class="hero-brand">
                <div class="hero-brand-mark">
                    <i class="bi bi-heart-pulse-fill text-white"></i>
                </div>
                <div class="hero-brand-name">Clinic<span>MS</span></div>
            </div>

            <h1 class="hero-heading">
                Join a <span class="text-gradient">smarter way</span> to manage care
            </h1>
            <p class="hero-desc">
                Create your account to book appointments, manage patients, and keep
                every medical record organized and accessible in one secure platform.
            </p>

            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon"><i class="bi bi-people-fill"></i></div>
                    <div class="feature-title">Patients</div>
                    <div class="feature-desc">Centralized profiles, history and contact details in one place.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="bi bi-clipboard2-pulse-fill"></i></div>
                    <div class="feature-title">Doctors</div>
                    <div class="feature-desc">Manage specialties, schedules and availability with ease.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="bi bi-calendar2-check-fill"></i></div>
                    <div class="feature-title">Appointments</div>
                    <div class="feature-desc">Book, reschedule and track visits without the back-and-forth.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="bi bi-file-earmark-medical-fill"></i></div>
                    <div class="feature-title">Medical Records</div>
                    <div class="feature-desc">Secure, structured records available whenever they're needed.</div>
                </div>
            </div>

            <div class="hero-illustration">
                <img src="{{ asset('images/doctor-illustration.svg') }}" alt="Illustration of a doctor with a clipboard and stethoscope">
            </div>

            <!-- Copyright on left panel -->
            <p class="page-footer" style="position: absolute; bottom: 24px; left: 40px; right: 40px; text-align: left; color: rgba(255,255,255,0.4); font-size: 13px; margin: 0; letter-spacing: 0.3px;">
                © {{ date('Y') }} Clinic Management System. All rights reserved.
            </p>
        </section>

        <!-- ============ RIGHT: REGISTER CARD ============ -->
        <section class="form-panel" style="flex: 1; max-width: 100%;">
            <div class="glass-card" style="max-width: 800px; width: 100%; padding: 48px 56px;">

                <!-- mobile-only brand mark -->
                <div class="hero-brand d-lg-none" style="margin-bottom: 24px;">
                    <div class="hero-brand-mark"><i class="bi bi-heart-pulse-fill text-white"></i></div>
                    <div class="hero-brand-name">Clinic<span>MS</span></div>
                </div>

                <div class="glass-card-header">
                    <h2 class="glass-card-title">Create your account</h2>
                    <p class="glass-card-subtitle">Get started in a couple of minutes.</p>
                </div>

                <div class="pulse-divider" aria-hidden="true">
                    <svg viewBox="0 0 400 20" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="pulseGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0" stop-color="#2563EB" stop-opacity="0"/>
                                <stop offset="0.5" stop-color="#06B6D4"/>
                                <stop offset="1" stop-color="#2563EB" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        <path d="M0,10 L140,10 L155,2 L168,18 L180,10 L400,10"/>
                    </svg>
                </div>

                @if ($errors->any())
                    <div class="alert-glass" role="alert">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <ul>
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('register') }}" data-loading-form novalidate style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px 24px;">
                    @csrf

                    <!-- Full Name -->
                    <div class="form-group" style="grid-column: span 2;">
                        <div class="form-control-wrap">
                            <i class="bi bi-person-fill input-icon"></i>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value="{{ old('name') }}"
                                class="form-control @error('name') is-invalid @enderror"
                                placeholder=" "
                                autocomplete="name"
                                required
                                autofocus
                            >
                            <label for="name" class="form-label">Full name</label>
                        </div>
                        @error('name')
                            <div class="invalid-feedback"><i class="bi bi-exclamation-circle-fill"></i>{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Email -->
                    <div class="form-group" style="grid-column: span 2;">
                        <div class="form-control-wrap">
                            <i class="bi bi-envelope-fill input-icon"></i>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value="{{ old('email') }}"
                                class="form-control @error('email') is-invalid @enderror"
                                placeholder=" "
                                autocomplete="username"
                                required
                            >
                            <label for="email" class="form-label">Email address</label>
                        </div>
                        @error('email')
                            <div class="invalid-feedback"><i class="bi bi-exclamation-circle-fill"></i>{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Phone -->
                    <div class="form-group" style="grid-column: span 1;">
                        <div class="form-control-wrap">
                            <i class="bi bi-telephone-fill input-icon"></i>
                            <input
                                id="phone"
                                type="text"
                                name="phone"
                                value="{{ old('phone') }}"
                                class="form-control @error('phone') is-invalid @enderror"
                                placeholder=" "
                                autocomplete="tel"
                            >
                            <label for="phone" class="form-label">Phone number</label>
                        </div>
                        @error('phone')
                            <div class="invalid-feedback"><i class="bi bi-exclamation-circle-fill"></i>{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Gender -->
                    <div class="form-group" style="grid-column: span 1;">
                        <div class="form-control-wrap">
                            <i class="bi bi-gender-ambiguous input-icon"></i>
                            <select name="patient_gender" class="form-control">
                                <option value="">Select gender</option>
                                <option value="male" {{ old('patient_gender') == 'male' ? 'selected' : '' }}>Male</option>
                                <option value="female" {{ old('patient_gender') == 'female' ? 'selected' : '' }}>Female</option>
                            </select>
                        </div>
                    </div>

                    <!-- Date of Birth -->
                    <div class="form-group" style="grid-column: span 1;">
                        <div class="form-control-wrap">
                            <i class="bi bi-calendar-fill input-icon"></i>
                            <input 
                                type="date" 
                                name="date_of_birth" 
                                value="{{ old('date_of_birth') }}"
                                id="date_of_birth"
                                class="form-control @error('date_of_birth') is-invalid @enderror"
                                placeholder=" "
                                onfocus="this.showPicker && this.showPicker()"
                            >
                            <label for="date_of_birth" class="form-label">Date of birth</label>
                        </div>
                        @error('date_of_birth')
                            <div class="invalid-feedback"><i class="bi bi-exclamation-circle-fill"></i>{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Blood Group -->
                    <div class="form-group" style="grid-column: span 1;">
                        <div class="form-control-wrap">
                            <i class="bi bi-droplet-fill input-icon"></i>
                            <select name="blood_group" class="form-control">
                                <option value="">Select blood group</option>
                                @foreach(['A+','A-','B+','B-','AB+','AB-','O+','O-'] as $bg)
                                    <option value="{{ $bg }}" {{ old('blood_group') == $bg ? 'selected' : '' }}>{{ $bg }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <!-- Address -->
                    <div class="form-group" style="grid-column: span 2;">
                        <div class="form-control-wrap">
                            <i class="bi bi-geo-alt-fill input-icon"></i>
                            <input type="text" name="patient_address" value="{{ old('patient_address') }}"
                                   class="form-control" placeholder=" ">
                            <label class="form-label">Address</label>
                        </div>
                    </div>

                    <!-- Emergency Contact Name -->
                    <div class="form-group" style="grid-column: span 1;">
                        <div class="form-control-wrap">
                            <i class="bi bi-person-lines-fill input-icon"></i>
                            <input type="text" name="emergency_contact_name" value="{{ old('emergency_contact_name') }}"
                                   class="form-control" placeholder=" ">
                            <label class="form-label">Emergency contact name</label>
                        </div>
                    </div>

                    <!-- Emergency Contact Phone -->
                    <div class="form-group" style="grid-column: span 1;">
                        <div class="form-control-wrap">
                            <i class="bi bi-telephone-fill input-icon"></i>
                            <input type="text" name="emergency_contact_phone" value="{{ old('emergency_contact_phone') }}"
                                   class="form-control" placeholder=" ">
                            <label class="form-label">Emergency contact phone</label>
                        </div>
                    </div>

                    <!-- Medical History -->
                    <div class="form-group" style="grid-column: span 2;">
                        <div class="form-control-wrap">
                            <i class="bi bi-file-earmark-medical-fill input-icon"></i>
                            <textarea name="medical_history" class="form-control" placeholder=" " rows="3">{{ old('medical_history') }}</textarea>
                            <label class="form-label" style="top: 16px; transform: none;">Medical history (optional)</label>
                        </div>
                    </div>

                    <!-- Hidden role input -->
                    <input type="hidden" name="role" value="patient">

                    <!-- Password -->
                    <div class="form-group" style="grid-column: span 1;">
                        <div class="form-control-wrap">
                            <i class="bi bi-lock-fill input-icon"></i>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                class="form-control has-toggle @error('password') is-invalid @enderror"
                                placeholder=" "
                                autocomplete="new-password"
                                required
                            >
                            <label for="password" class="form-label">Password</label>
                            <button type="button" class="password-toggle" data-password-toggle="password" aria-label="Show password" aria-pressed="false">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                        @error('password')
                            <div class="invalid-feedback"><i class="bi bi-exclamation-circle-fill"></i>{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Confirm Password -->
                    <div class="form-group" style="grid-column: span 1;">
                        <div class="form-control-wrap">
                            <i class="bi bi-shield-lock-fill input-icon"></i>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                class="form-control has-toggle"
                                placeholder=" "
                                autocomplete="new-password"
                                required
                            >
                            <label for="password_confirmation" class="form-label">Confirm password</label>
                            <button type="button" class="password-toggle" data-password-toggle="password_confirmation" aria-label="Show password" aria-pressed="false">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Submit Button - full width -->
                    <button type="submit" class="btn-premium" data-loading-button style="grid-column: span 2; width: 100%;">
                        <span class="btn-spinner" aria-hidden="true"></span>
                        <span class="btn-label">Create Account</span>
                    </button>
                </form>

                <div class="card-footer-links">
                    Already have an account?
                    <a href="{{ route('login') }}">Sign in</a>
                </div>

                <div class="security-badges">
                    <div class="security-badge"><i class="bi bi-shield-lock-fill"></i> Secure</div>
                    <div class="security-badge"><i class="bi bi-lightning-charge-fill"></i> Fast</div>
                    <div class="security-badge"><i class="bi bi-cloud-check-fill"></i> Cloud</div>
                </div>
            </div>

            <!-- Mobile copyright (visible only on small screens) -->
            <p class="page-footer d-lg-none" style="text-align: center; color: rgba(255,255,255,0.4); font-size: 13px; margin-top: 20px; letter-spacing: 0.3px;">
                © {{ date('Y') }} Clinic Management System. All rights reserved.
            </p>
        </section>
    </div>

    <script src="{{ asset('js/login.js') }}"></script>
</body>