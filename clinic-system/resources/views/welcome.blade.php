<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Clinic Management System · Modern Healthcare Platform</title>
    <meta name="description" content="Manage your clinic, doctors, patients and appointments with one secure, modern platform.">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    <!-- Tailwind CSS (CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary:   '#2563EB',
                        secondary: '#3B82F6',
                        accent:    '#06B6D4',
                        navy:      '#071330',
                        navysoft:  '#0B1B45',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    boxShadow: {
                        glow: '0 8px 32px rgba(37, 99, 235, 0.35)',
                        card: '0 24px 64px rgba(2, 8, 23, 0.55)',
                    },
                },
            },
        };
    </script>

    <!-- Alpine.js (only for navbar/menu, FAQ accordion, stat counters) -->
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js" defer></script>

    <style>
        body{ font-family: 'Inter', sans-serif; background:#071330; }

        @keyframes floatBlob1{ 0%,100%{ transform: translate(0,0) scale(1); } 50%{ transform: translate(60px,40px) scale(1.1); } }
        @keyframes floatBlob2{ 0%,100%{ transform: translate(0,0) scale(1); } 50%{ transform: translate(-50px,-60px) scale(1.08); } }
        @keyframes floatBlob3{ 0%,100%{ transform: translate(-50%,-50%) scale(1); } 50%{ transform: translate(-40%,-60%) scale(1.15); } }
        @keyframes driftUp{ from{ transform: translateY(100vh) scale(1); opacity:0; } 10%{ opacity:.6; } 90%{ opacity:.35; } to{ transform: translateY(-10vh) scale(1.4); opacity:0; } }
        @keyframes fadeInUp{ from{ opacity:0; transform: translateY(18px); } to{ opacity:1; transform: translateY(0); } }
        @keyframes floatCard{ 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-10px); } }

        .blob{ position:absolute; border-radius:9999px; filter: blur(70px); opacity:.5; }
        .blob-1{ width:420px; height:420px; top:-120px; left:-100px; background: radial-gradient(circle, #2563EB, transparent 70%); animation: floatBlob1 18s ease-in-out infinite; }
        .blob-2{ width:480px; height:480px; bottom:-160px; right:-140px; background: radial-gradient(circle, #06B6D4, transparent 70%); animation: floatBlob2 22s ease-in-out infinite; }
        .blob-3{ width:320px; height:320px; top:40%; left:45%; background: radial-gradient(circle, #3B82F6, transparent 70%); opacity:.25; animation: floatBlob3 26s ease-in-out infinite; }

        .particle{ position:absolute; width:3px; height:3px; border-radius:9999px; background:#06B6D4; opacity:.5; box-shadow:0 0 6px 1px rgba(6,182,212,.6); animation: driftUp linear infinite; }

        .fade-in-up{ animation: fadeInUp .7s cubic-bezier(.16,1,.3,1) both; }
        .float-card{ animation: floatCard 5s ease-in-out infinite; }

        .bg-grid{
            background-image: linear-gradient(rgba(59,130,246,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.07) 1px, transparent 1px);
            background-size: 42px 42px;
            -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, #000 40%, transparent 100%);
            mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, #000 40%, transparent 100%);
        }
    </style>
</head>
<body class="text-white antialiased">

    <!-- ============ GLOBAL BACKGROUND ============ -->
    <div class="fixed inset-0 -z-20 bg-gradient-to-b from-[#071330] to-[#050C22]"></div>
    <div class="fixed inset-0 -z-10 bg-grid opacity-30 pointer-events-none"></div>
    <div class="blob blob-1 -z-10 pointer-events-none"></div>
    <div class="blob blob-2 -z-10 pointer-events-none"></div>
    <div class="blob blob-3 -z-10 pointer-events-none"></div>
    <div class="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <span class="particle" style="left:8%;  animation-duration:14s; animation-delay:0s;"></span>
        <span class="particle" style="left:22%; animation-duration:19s; animation-delay:2s;"></span>
        <span class="particle" style="left:38%; animation-duration:16s; animation-delay:4s;"></span>
        <span class="particle" style="left:54%; animation-duration:22s; animation-delay:1s;"></span>
        <span class="particle" style="left:68%; animation-duration:17s; animation-delay:3s;"></span>
        <span class="particle" style="left:79%; animation-duration:20s; animation-delay:5s;"></span>
        <span class="particle" style="left:90%; animation-duration:15s; animation-delay:2.5s;"></span>
    </div>

    <!-- ============ NAVBAR ============ -->
    <header
        x-data="{ scrolled: false, mobileOpen: false }"
        @scroll.window="scrolled = (window.scrollY > 12)"
        class="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        :class="scrolled ? 'bg-navy/80 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent border-b border-transparent'"
    >
        <nav class="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
            <a href="{{ url('/') }}" class="flex items-center gap-3 shrink-0">
                <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4.97-3.29-9-7.42-9-11.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9 3.5c0 4.08-4.03 8.21-9 11.5Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 10h2.2l1-2 1.6 4 1-2H17" />
                    </svg>
                </span>
                <span class="font-extrabold text-lg tracking-tight">Clinic<span class="text-accent">Management</span></span>
            </a>

            <div class="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-300">
                <a href="#home" class="hover:text-white transition-colors">Home</a>
                <a href="#about" class="hover:text-white transition-colors">About</a>
                <a href="#services" class="hover:text-white transition-colors">Services</a>
                <a href="#doctors" class="hover:text-white transition-colors">Doctors</a>
                <a href="#testimonials" class="hover:text-white transition-colors">Testimonials</a>
                @guest
                <a href="#contact" class="hover:text-white transition-colors">Contact</a>
                @endguest
            </div>

            <div class="hidden lg:flex items-center gap-3">
                @guest
                    <a href="{{ route('login') }}" class="px-4 py-2 text-sm font-semibold text-gray-200 hover:text-white transition-colors">Login</a>
                    <a href="{{ route('register') }}" class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:scale-105 transition-transform">Create Account</a>
                @else
                    @php
                        $role = Auth::user()->role ?? 'patient';
                        $dashboardRoute = match($role) {
                            'admin'  => Route::has('admin.dashboard')   ? route('admin.dashboard')   : '#',
                            'doctor' => Route::has('doctor.dashboard')  ? route('doctor.dashboard')  : '#',
                            default  => Route::has('patient.dashboard') ? route('patient.dashboard') : '#',
                        };
                        $roleLabel = ucfirst($role);
                    @endphp
                    <div class="relative" x-data="{ open: false }" @click.outside="open = false">
                        <button @click="open = !open" class="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 hover:border-accent/50 transition-colors">
                            <span class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold">
                                {{ strtoupper(substr(Auth::user()->name, 0, 2)) }}
                            </span>
                            <span class="text-left leading-tight hidden xl:block">
                                <span class="block text-sm font-semibold">Hello, {{ explode(' ', Auth::user()->name)[0] }}</span>
                                <span class="block text-[11px] text-accent">{{ $roleLabel }}</span>
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                        </button>
                        <div x-show="open" x-transition x-cloak class="absolute right-0 mt-3 w-56 rounded-2xl bg-navysoft/95 backdrop-blur-xl border border-white/10 shadow-card p-2">
                            <a href="{{ $dashboardRoute }}" class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:bg-white/[0.06]">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>
                                {{ $role === 'admin' ? 'Dashboard' : ($role === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard') }}
                            </a>
                            <div class="h-px bg-white/10 my-1.5"></div>
                            <form method="POST" action="{{ Route::has('logout') ? route('logout') : '#' }}">
                                @csrf
                                <button type="submit" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 12H8.25m9.75 0-3-3m3 3-3 3" /></svg>
                                    Logout
                                </button>
                            </form>
                        </div>
                    </div>
                @endguest
            </div>

            <button @click="mobileOpen = !mobileOpen" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-white/10">
                <svg x-show="!mobileOpen" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                <svg x-show="mobileOpen" x-cloak xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
        </nav>

        <!-- Mobile menu -->
        <div x-show="mobileOpen" x-cloak x-transition class="lg:hidden bg-navy/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 space-y-4 text-sm font-medium text-gray-300">
            <a href="#home" class="block hover:text-white">Home</a>
            <a href="#about" class="block hover:text-white">About</a>
            <a href="#services" class="block hover:text-white">Services</a>
            <a href="#doctors" class="block hover:text-white">Doctors</a>
            <a href="#testimonials" class="block hover:text-white">Testimonials</a>
            <a href="#contact" class="block hover:text-white">Contact</a>
            <div class="h-px bg-white/10"></div>
            @guest
                <a href="{{ route('login') }}" class="block font-semibold text-gray-200">Login</a>
                <a href="{{ route('register') }}" class="block px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-center font-semibold">Create Account</a>
            @else
                <a href="{{ $dashboardRoute }}" class="block font-semibold text-accent">{{ $role === 'admin' ? 'Dashboard' : ($role === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard') }}</a>
                <form method="POST" action="{{ Route::has('logout') ? route('logout') : '#' }}">
                    @csrf
                    <button type="submit" class="block w-full text-left font-semibold text-red-400">Logout</button>
                </form>
            @endguest
        </div>
    </header>

    <!-- ============ HERO ============ -->
    <section id="home" class="relative pt-40 pb-28 lg:pt-48 lg:pb-36 overflow-hidden">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">

            <div class="fade-in-up">
                <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] border border-white/10 text-accent mb-6">
                    <span class="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    Modern Healthcare Platform
                </span>

                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
                    Clinic Management
                    <span class="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">System</span>
                </h1>

                <p class="text-lg text-gray-300 max-w-xl mb-9 leading-relaxed">
                    Manage your clinic, doctors, patients and appointments with one secure platform &mdash; built for modern healthcare teams.
                </p>

                <div class="flex flex-wrap items-center gap-4 mb-8">
                    @guest
                    <a href="{{ Route::has('register') ? route('register') : '#' }}" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent shadow-glow hover:shadow-lg hover:scale-105 transition-all">
                        Get Started
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
                    </a>
                    <a href="{{ Route::has('login') ? route('login') : '#' }}" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border border-white/15 hover:border-accent/60 hover:bg-white/[0.05] transition-all">
                        Login
                    </a>
                    @endguest
                </div>

                <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-400">
                    <span class="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg> Secure</span>
                    <span class="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg> Fast</span>
                    <span class="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg> Multi Role</span>
                    <span class="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg> Responsive</span>
                </div>
            </div>

            <div class="relative fade-in-up" style="animation-delay:.15s">
                <div class="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-card">
                    <img src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&q=80&auto=format&fit=crop"
                         alt="Doctors collaborating in a modern hospital"
                         class="w-full h-[420px] lg:h-[500px] object-cover hover:scale-105 transition-transform duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent"></div>
                </div>

                <div class="absolute -left-6 top-10 lg:-left-10 float-card">
                    <div class="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl shadow-card px-5 py-4 w-56">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span class="text-xs font-semibold text-gray-200">System Online</span>
                        </div>
                        <div class="grid grid-cols-1 gap-1 text-[13px] text-gray-300 mt-2">
                            <span><strong class="text-white">150+</strong> Doctors</span>
                            <span><strong class="text-white">3200+</strong> Patients</span>
                            <span><strong class="text-white">14500+</strong> Appointments</span>
                        </div>
                    </div>
                </div>

                <div class="absolute -right-4 bottom-6 lg:-right-8 float-card" style="animation-delay:1.2s">
                    <div class="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl shadow-card px-5 py-3.5 flex items-center gap-3">
                        <span class="text-amber-400 text-sm tracking-tight">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                        <span class="text-xs font-semibold text-gray-200">Trusted by Healthcare Professionals</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Wave divider -->
    <div class="relative -mt-1">
        <svg viewBox="0 0 1440 80" class="w-full h-16" preserveAspectRatio="none"><path fill="#0B1B45" d="M0,32 C240,80 480,0 720,24 C960,48 1200,88 1440,40 L1440,80 L0,80 Z"/></svg>
    </div>

    <!-- ============ ABOUT ============ -->
    <section id="about" class="relative bg-navysoft py-24 lg:py-32 overflow-hidden">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
            <div class="relative fade-in-up order-2 lg:order-1">
                <div class="rounded-[2rem] overflow-hidden border border-white/10 shadow-card">
                    <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80&auto=format&fit=crop"
                         alt="Medical team reviewing patient records"
                         class="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700">
                </div>
                <div class="absolute -bottom-6 -right-6 bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl shadow-card px-6 py-4 hidden sm:block">
                    <p class="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">6+</p>
                    <p class="text-xs text-gray-300">Core modules, one platform</p>
                </div>
            </div>

            <div class="fade-in-up order-1 lg:order-2">
                <span class="text-xs font-semibold uppercase tracking-widest text-accent">About the platform</span>
                <h2 class="text-3xl lg:text-4xl font-extrabold mt-3 mb-5 leading-tight">A single, secure home for your entire clinic</h2>
                <p class="text-gray-300 leading-relaxed mb-8">
                    Our system brings doctors, patients, appointments, medical records and reports together in one modern
                    workspace &mdash; with role-based access so everyone sees exactly what they need, nothing more.
                </p>

                <ul class="space-y-4">
                    <li class="flex items-start gap-3">
                        <span class="w-9 h-9 rounded-xl bg-primary/15 text-accent flex items-center justify-center shrink-0"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg></span>
                        <div>
                            <p class="font-semibold text-white">Doctors &amp; Patients</p>
                            <p class="text-sm text-gray-400">Centralized profiles, history and secure contact details.</p>
                        </div>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="w-9 h-9 rounded-xl bg-primary/15 text-accent flex items-center justify-center shrink-0"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg></span>
                        <div>
                            <p class="font-semibold text-white">Appointments</p>
                            <p class="text-sm text-gray-400">Book, reschedule and track visits without the back-and-forth.</p>
                        </div>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="w-9 h-9 rounded-xl bg-primary/15 text-accent flex items-center justify-center shrink-0"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg></span>
                        <div>
                            <p class="font-semibold text-white">Medical Records &amp; Reports</p>
                            <p class="text-sm text-gray-400">Structured, auditable records available whenever needed.</p>
                        </div>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="w-9 h-9 rounded-xl bg-primary/15 text-accent flex items-center justify-center shrink-0"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg></span>
                        <div>
                            <p class="font-semibold text-white">Authentication &amp; Roles</p>
                            <p class="text-sm text-gray-400">Fine-grained role management for admins, doctors and patients.</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>

    <div class="relative">
        <svg viewBox="0 0 1440 80" class="w-full h-16" preserveAspectRatio="none"><path fill="#071330" d="M0,40 C240,0 480,88 720,56 C960,24 1200,72 1440,32 L1440,80 L0,80 Z"/></svg>
    </div>

    <!-- ============ SERVICES ============ -->
    <section id="services" class="relative py-24 lg:py-32">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-16 fade-in-up">
                <span class="text-xs font-semibold uppercase tracking-widest text-accent">What we offer</span>
                <h2 class="text-3xl lg:text-4xl font-extrabold mt-3 mb-4">Everything your clinic needs</h2>
                <p class="text-gray-300">One platform, six essential modules &mdash; built to work together seamlessly.</p>
            </div>

            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                @php
                    $services = [
                        ['icon' => 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z', 'title' => 'Doctor Management', 'desc' => 'Manage specialties, schedules and availability with ease.'],
                        ['icon' => 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'title' => 'Patient Management', 'desc' => 'Centralized patient profiles, history and contact details.'],
                        ['icon' => 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5', 'title' => 'Appointments', 'desc' => 'Book, reschedule and track visits without the back-and-forth.'],
                        ['icon' => 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z', 'title' => 'Medical Records', 'desc' => 'Secure, structured records available whenever they are needed.'],
                        ['icon' => 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z', 'title' => 'Reports', 'desc' => 'Actionable insights and exportable analytics across the clinic.'],
                        ['icon' => 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z', 'title' => 'Secure Authentication', 'desc' => 'Role-based access keeps every account and record protected.'],
                    ];
                @endphp

                @foreach ($services as $service)
                    <div class="group bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-accent/40 rounded-2xl p-7 shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-1 fade-in-up">
                        <span class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="{{ $service['icon'] }}" /></svg>
                        </span>
                        <h3 class="text-lg font-bold mb-2">{{ $service['title'] }}</h3>
                        <p class="text-sm text-gray-400 leading-relaxed">{{ $service['desc'] }}</p>
                    </div>
                @endforeach
            </div>
        </div>
    </section>

    <!-- ============ MEET OUR SPECIALISTS ============ -->
    <section id="doctors" class="relative bg-navysoft py-24 lg:py-32">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-16 fade-in-up">
                <span class="text-xs font-semibold uppercase tracking-widest text-accent">Our team</span>
                <h2 class="text-3xl lg:text-4xl font-extrabold mt-3 mb-4">Meet our specialists</h2>
                <p class="text-gray-300">A sample of the caliber of professionals who use our platform every day.</p>
            </div>

            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                @php
                    $doctors = [
                        ['name' => 'Dr. Sarah Reynolds', 'role' => 'Cardiologist', 'exp' => '12 yrs experience', 'img' => 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80&auto=format&fit=crop', 'bio' => 'Specializes in preventive cardiology and heart rhythm disorders.'],
                        ['name' => 'Dr. Ahmed Youssef', 'role' => 'Pediatrician', 'exp' => '9 yrs experience', 'img' => 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80&auto=format&fit=crop', 'bio' => 'Dedicated to compassionate, family-centered pediatric care.'],
                        ['name' => 'Dr. Layla Hassan', 'role' => 'Neurologist', 'exp' => '15 yrs experience', 'img' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80&auto=format&fit=crop', 'bio' => 'Focused on advanced diagnostics for complex neurological cases.'],
                    ];
                @endphp

                @foreach ($doctors as $doctor)
                    <div class="group bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-1.5 fade-in-up">
                        <div class="overflow-hidden h-64">
                            <img src="{{ $doctor['img'] }}" alt="Portrait of {{ $doctor['name'] }}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        </div>
                        <div class="p-6">
                            <h3 class="font-bold text-lg">{{ $doctor['name'] }}</h3>
                            <p class="text-accent text-sm font-medium mb-1">{{ $doctor['role'] }}</p>
                            <p class="text-xs text-gray-400 mb-3">{{ $doctor['exp'] }}</p>
                            <p class="text-sm text-gray-300 leading-relaxed mb-5">{{ $doctor['bio'] }}</p>
                            <button type="button" class="w-full py-2.5 rounded-xl text-sm font-semibold border border-white/15 hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:border-transparent transition-all">
                                Book Appointment
                            </button>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </section>

    <div class="relative">
        <svg viewBox="0 0 1440 80" class="w-full h-16" preserveAspectRatio="none"><path fill="#071330" d="M0,32 C240,80 480,0 720,24 C960,48 1200,88 1440,40 L1440,80 L0,80 Z"/></svg>
    </div>

    <!-- ============ WHY CHOOSE US ============ -->
    <section class="relative py-24 lg:py-32 overflow-hidden">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
            <div class="relative fade-in-up">
                <div class="rounded-[2rem] overflow-hidden border border-white/10 shadow-card">
                    <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=80&auto=format&fit=crop"
                         alt="Doctor using a tablet in a clinic hallway"
                         class="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700">
                </div>
            </div>

            <div class="fade-in-up">
                <span class="text-xs font-semibold uppercase tracking-widest text-accent">Why choose us</span>
                <h2 class="text-3xl lg:text-4xl font-extrabold mt-3 mb-8 leading-tight">Built for clinics that expect more</h2>

                <div class="grid sm:grid-cols-2 gap-4">
                    @foreach ([
                        'Easy to Use', 'Secure Authentication', 'Modern Interface', 'Role Based Access',
                        'Fully Responsive', 'Fast Performance', 'Reliable Uptime', 'Dedicated Support',
                    ] as $point)
                        <div class="flex items-center gap-3 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            <span class="text-sm font-medium text-gray-200">{{ $point }}</span>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </section>

    <!-- ============ STATISTICS ============ -->
    <section class="relative bg-navysoft py-20">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6"
                 x-data="{
                    shown:false,
                    stats:[{target:150,suffix:'+',label:'Doctors',val:0},
                           {target:3200,suffix:'+',label:'Patients',val:0},
                           {target:14500,suffix:'+',label:'Appointments',val:0},
                           {target:99.9,suffix:'%',label:'Availability',val:0,decimal:true}],
                    run(){
                        if(this.shown) return; this.shown = true;
                        this.stats.forEach((s,i)=>{
                            let steps = 60, current = 0;
                            let inc = s.target/steps;
                            let t = setInterval(()=>{
                                current += inc;
                                if(current >= s.target){ current = s.target; clearInterval(t); }
                                this.stats[i].val = s.decimal ? current.toFixed(1) : Math.floor(current);
                            }, 25);
                        });
                    }
                 }"
                 x-init="const io = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting) run(); }); }, {threshold:.3}); io.observe($el);"
            >
                <template x-for="stat in stats" :key="stat.label">
                    <div class="text-center bg-white/[0.05] border border-white/10 rounded-2xl py-10 px-4 fade-in-up">
                        <p class="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            <span x-text="stat.val"></span><span x-text="stat.suffix"></span>
                        </p>
                        <p class="text-sm text-gray-400 mt-2" x-text="stat.label"></p>
                    </div>
                </template>
            </div>
        </div>
    </section>

    <!-- ============ TESTIMONIALS ============ -->
    <section id="testimonials" class="relative py-24 lg:py-32">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-16 fade-in-up">
                <span class="text-xs font-semibold uppercase tracking-widest text-accent">Testimonials</span>
                <h2 class="text-3xl lg:text-4xl font-extrabold mt-3 mb-4">Trusted by healthcare teams</h2>
                <p class="text-gray-300">Hear from the clinics and professionals already using our platform.</p>
            </div>

            <div class="grid md:grid-cols-3 gap-6">
                @php
                    $testimonials = [
                        ['name' => 'Dr. Karim Fathy', 'role' => 'Clinic Director', 'img' => 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80&auto=format&fit=crop', 'quote' => 'Our front desk and clinical teams finally work from the same source of truth. Scheduling conflicts have all but disappeared.'],
                        ['name' => 'Nourhan Samir', 'role' => 'Practice Manager', 'img' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop', 'quote' => 'Setup took an afternoon and the role-based access meant every staff member only saw exactly what they needed.'],
                        ['name' => 'Tarek Hamdy', 'role' => 'Independent Physician', 'img' => 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&q=80&auto=format&fit=crop', 'quote' => 'Patient records are organized, searchable and available on any device. It genuinely changed how I run my practice.'],
                    ];
                @endphp

                @foreach ($testimonials as $t)
                    <div class="bg-white/[0.06] border border-white/10 rounded-2xl p-7 hover:-translate-y-1 hover:shadow-card transition-all duration-300 fade-in-up">
                        <span class="text-amber-400 text-sm tracking-tight">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                        <p class="text-gray-200 leading-relaxed my-5">&ldquo;{{ $t['quote'] }}&rdquo;</p>
                        <div class="flex items-center gap-3">
                            <img src="{{ $t['img'] }}" alt="Portrait of {{ $t['name'] }}" class="w-11 h-11 rounded-full object-cover border border-white/15">
                            <div>
                                <p class="font-semibold text-sm">{{ $t['name'] }}</p>
                                <p class="text-xs text-gray-400">{{ $t['role'] }}</p>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </section>

    <!-- ============ FAQ ============ -->
    <section class="relative bg-navysoft py-24 lg:py-32">
        <div class="max-w-3xl mx-auto px-6 lg:px-8">
            <div class="text-center mb-14 fade-in-up">
                <span class="text-xs font-semibold uppercase tracking-widest text-accent">FAQ</span>
                <h2 class="text-3xl lg:text-4xl font-extrabold mt-3">Frequently asked questions</h2>
            </div>

            <div class="space-y-4" x-data="{ openIndex: 0 }">
                @php
                    $faqs = [
                        ['q' => 'Is patient data secure?', 'a' => 'Yes. All patient data is protected with role-based access control, encrypted authentication, and audit-friendly record keeping so only authorized staff can view sensitive information.'],
                        ['q' => 'Can multiple doctors use the system?', 'a' => 'Absolutely. The platform supports unlimited doctor accounts, each with their own schedule, patient list and permissions managed from one dashboard.'],
                        ['q' => 'Can appointments be managed easily?', 'a' => 'Yes, appointments can be booked, rescheduled or cancelled in a few clicks, with real-time availability for every doctor.'],
                        ['q' => 'Is it mobile friendly?', 'a' => 'The entire platform is fully responsive and works smoothly on desktops, tablets and mobile phones.'],
                    ];
                @endphp

                @foreach ($faqs as $index => $faq)
                    <div class="bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden fade-in-up">
                        <button
                            type="button"
                            @click="openIndex = (openIndex === {{ $index }} ? null : {{ $index }})"
                            class="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                        >
                            <span class="font-semibold text-white">{{ $faq['q'] }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent shrink-0 transition-transform duration-300"
                                 :class="openIndex === {{ $index }} ? 'rotate-180' : ''"
                                 fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                        <div x-show="openIndex === {{ $index }}" x-collapse x-cloak class="px-6 pb-5 text-sm text-gray-300 leading-relaxed">
                            {{ $faq['a'] }}
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </section>

    <!-- ============ CALL TO ACTION ============ -->@guest
    <section id="contact" class="relative py-24 lg:py-28 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        <div class="absolute inset-0 bg-grid opacity-10"></div>
        <div class="relative max-w-4xl mx-auto px-6 lg:px-8 text-center fade-in-up">

            <h2 class="text-3xl lg:text-5xl font-extrabold mb-5">Ready to simplify your clinic?</h2>
            <p class="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
                Start managing your healthcare operations professionally &mdash; doctors, patients and appointments, all in one place.
            </p>
            <a href="{{ Route::has('register') ? route('register') : '#' }}"
               class="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-bold text-primary bg-white shadow-card hover:scale-105 transition-transform">
                Get Started Today
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
            </a>

        </div>
    </section>
@endguest
    <!-- ============ FOOTER ============ -->
    <footer class="relative bg-[#050C22] border-t border-white/10 pt-16 pb-8">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                <div>
                    <a href="{{ url('/') }}" class="flex items-center gap-3 mb-4">
                        <span class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4.97-3.29-9-7.42-9-11.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9 3.5c0 4.08-4.03 8.21-9 11.5Z" /></svg>
                        </span>
                        <span class="font-extrabold">Clinic<span class="text-accent">Management</span></span>
                    </a>
                    <p class="text-sm text-gray-400 leading-relaxed">A modern, secure platform for managing clinics, doctors, patients and appointments.</p>
                </div>

                <div>
                    <h4 class="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
                    <ul class="space-y-2.5 text-sm text-gray-400">
                        <li><a href="#about" class="hover:text-accent transition-colors">About</a></li>
                        <li><a href="#services" class="hover:text-accent transition-colors">Services</a></li>
                        <li><a href="#contact" class="hover:text-accent transition-colors">Contact</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Legal</h4>
                    <ul class="space-y-2.5 text-sm text-gray-400">
                        <li><a href="#" class="hover:text-accent transition-colors">Privacy Policy</a></li>
                        <li><a href="#" class="hover:text-accent transition-colors">Terms of Service</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Follow Us</h4>
                    <div class="flex items-center gap-3">
                        <a href="#" aria-label="Facebook" class="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-accent/20 hover:border-accent/40 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.6 9.88v-6.99H7.9V12h2.5V9.8c0-2.47 1.47-3.84 3.72-3.84 1.08 0 2.2.19 2.2.19v2.43h-1.24c-1.22 0-1.6.76-1.6 1.54V12h2.73l-.44 2.89h-2.29v6.99A10 10 0 0 0 22 12Z"/></svg>
                        </a>
                        <a href="#" aria-label="Twitter/X" class="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-accent/20 hover:border-accent/40 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231ZM17.083 19.77h1.833L7.084 4.126H5.117Z"/></svg>
                        </a>
                        <a href="#" aria-label="LinkedIn" class="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-accent/20 hover:border-accent/40 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z"/></svg>
                        </a>
                    </div>
                </div>
            </div>

            <div class="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <p>&copy; {{ date('Y') }} Clinic Management System. All rights reserved.</p>
                <p>Powered by Laravel {{ Illuminate\Foundation\Application::VERSION ?? '13' }}</p>
            </div>
        </div>
    </footer>

</body>
</html>
