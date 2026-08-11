{{-- resources/views/app.blade.php --}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Clinic Management System') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Material Symbols -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

    <!-- Only load Vite assets if NOT on login page -->
    @if(request()->path() !== 'login')
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @else
        {{-- Login page specific styles --}}
        <link rel="stylesheet" href="{{ asset('css/login.css') }}">
    @endif
</head>
<body>
    @if(request()->path() !== 'login')
        <div id="app"></div>
    @else
        {{-- Login page content will be rendered from Blade view --}}
        @yield('content')
    @endif
    
    {{-- Load login.js only on login page --}}
    @if(request()->path() === 'login')
        <script src="{{ asset('js/login.js') }}"></script>
    @endif
</body>
</html>