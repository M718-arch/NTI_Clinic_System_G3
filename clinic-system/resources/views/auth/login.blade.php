<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In · Clinic Management System</title>

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
        <!-- Login Form - Directly on background, NO CARD -->
        <div class="login-section">
            
            <!-- Brand -->
            <div class="brand">
                <div class="brand-icon">
                    <i class="bi bi-heart-pulse-fill"></i>
                </div>
                <div class="brand-name">Clinic<span>MS</span></div>
            </div>

            <!-- Heading -->
            <div class="login-header">
                <h1>Welcome back</h1>
                <p>Sign in to continue to your dashboard.</p>
            </div>

            <!-- ECG Divider - Full Width -->
            <div class="ecg-divider">
                <svg viewBox="0 0 520 20" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="ecgGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.05"/>
                            <stop offset="40%" stop-color="#ffffff"/>
                            <stop offset="60%" stop-color="#06B6D4"/>
                            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
                        </linearGradient>
                    </defs>
                    <path d="M0,10 L150,10 L170,1 L185,19 L200,10 L520,10"/>
                </svg>
            </div>

            <!-- Flash Messages -->
            @if (session('status'))
                <div class="alert alert-success">
                    <i class="bi bi-check-circle-fill"></i>
                    {{ session('status') }}
                </div>
            @endif

            @if ($errors->any())
                <div class="alert alert-error">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- Login Form -->
            <form method="POST" action="{{ route('login') }}" id="loginForm">
                @csrf

                <!-- Email -->
                <div class="form-group">
                    <label for="email">Email address</label>
                    <div class="input-wrapper">
                        <i class="bi bi-envelope-fill input-icon"></i>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value="{{ old('email') }}"
                            placeholder="Enter your email address"
                            autocomplete="username"
                            required
                            autofocus
                            class="form-input @error('email') error @enderror"
                        >
                    </div>
                    @error('email')
                        <span class="input-error">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Password -->
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-wrapper">
                        <i class="bi bi-lock-fill input-icon"></i>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            autocomplete="current-password"
                            required
                            class="form-input @error('password') error @enderror"
                        >
                        <button
                            type="button"
                            class="password-toggle"
                            id="togglePassword"
                            aria-label="Toggle password visibility"
                        >
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                    @error('password')
                        <span class="input-error">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Remember & Forgot -->
                <div class="form-actions">
                    <label class="remember-me">
                        <input type="checkbox" name="remember" {{ old('remember') ? 'checked' : '' }}>
                        <span>Remember me</span>
                    </label>

                    @if (Route::has('password.request'))
                        <a href="{{ route('password.request') }}" class="forgot-link">Forgot password?</a>
                    @endif
                </div>

                <!-- Sign In Button -->
                <button type="submit" class="signin-btn" id="loginButton">
                    <span class="spinner"></span>
                    <span class="btn-text">Sign In</span>
                </button>
            </form>

            <!-- Register Link -->
            <div class="register-link">
                Don't have an account?
                <a href="{{ route('register') }}">Create one</a>
            </div>

        </div>
    </div>

    <script src="{{ asset('js/login.js') }}"></script>
</body>
</html>