<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In · Clinic Management System</title>

    <meta name="description" content="Sign in to the Clinic Management System to manage patients, doctors, appointments and medical records.">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

    <!-- App styles -->
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
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
                Run your clinic with <span class="text-gradient">clarity and care</span>
            </h1>
            <p class="hero-desc">
                One secure workspace for patients, doctors, appointments and medical
                records — built so your care team spends less time on admin and more
                time with patients.
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
        </section>

        <!-- ============ RIGHT: LOGIN CARD ============ -->
        <section class="form-panel">
            <div class="glass-card">

                <!-- mobile-only brand mark -->
                <div class="hero-brand d-lg-none" style="margin-bottom: 24px;">
                    <div class="hero-brand-mark"><i class="bi bi-heart-pulse-fill text-white"></i></div>
                    <div class="hero-brand-name">Clinic<span>MS</span></div>
                </div>

                <div class="glass-card-header">
                    <h2 class="glass-card-title">Welcome back</h2>
                    <p class="glass-card-subtitle">Sign in to continue to your dashboard.</p>
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

                @if (session('status'))
                    <div class="alert-glass alert-success" role="alert">
                        <i class="bi bi-check-circle-fill"></i>
                        <span>{{ session('status') }}</span>
                    </div>
                @endif

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

                <form method="POST" action="{{ route('login') }}" data-loading-form novalidate>
                    @csrf

                    <!-- Email -->
                    <div class="form-group @error('email') is-invalid-group @enderror">
                        <div class="form-control-wrap">
                            <i class="bi bi-envelope-fill input-icon"></i>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value="{{ old('email') }}"
                                class="form-control @error('email') is-invalid @enderror"
                                placeholder="Email address"
                                autocomplete="username"
                                required
                                autofocus
                            >
                            <label for="email" class="form-label">Email address</label>
                        </div>
                        @error('email')
                            <div class="invalid-feedback"><i class="bi bi-exclamation-circle-fill"></i>{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Password -->
                    <div class="form-group @error('password') is-invalid-group @enderror">
                        <div class="form-control-wrap">
                            <i class="bi bi-lock-fill input-icon"></i>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                class="form-control has-toggle @error('password') is-invalid @enderror"
                                placeholder="Password"
                                autocomplete="current-password"
                                required
                            >
                            <label for="password" class="form-label">Password</label>
                            <button
                                type="button"
                                class="password-toggle"
                                data-password-toggle="password"
                                aria-label="Show password"
                                aria-pressed="false"
                            >
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                        @error('password')
                            <div class="invalid-feedback"><i class="bi bi-exclamation-circle-fill"></i>{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="form-row-between">
                        <label class="remember-check">
                            <input type="checkbox" name="remember" id="remember">
                            <span>Remember me</span>
                        </label>

                        @if (Route::has('password.request'))
                            <a href="{{ route('password.request') }}" class="link-muted">Forgot password?</a>
                        @endif
                    </div>

                    <button type="submit" class="btn-premium" data-loading-button>
                        <span class="btn-spinner" aria-hidden="true"></span>
                        <span class="btn-label">Sign In</span>
                    </button>
                </form>

                <div class="card-footer-links">
                    Don't have an account?
                    <a href="{{ route('register') }}">Create one</a>
                </div>

                <div class="security-badges">
                    <div class="security-badge"><i class="bi bi-shield-lock-fill"></i> Secure</div>
                    <div class="security-badge"><i class="bi bi-lightning-charge-fill"></i> Fast</div>
                    <div class="security-badge"><i class="bi bi-cloud-check-fill"></i> Cloud</div>
                </div>
            </div>

            <p class="page-footer">© {{ date('Y') }} Clinic Management System. All rights reserved.</p>
        </section>
    </div>

    <script src="{{ asset('js/login.js') }}"></script>
</body>
</html>
