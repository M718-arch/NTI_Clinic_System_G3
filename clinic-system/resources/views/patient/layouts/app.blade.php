<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Clinic System')</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
        /* Prevent FOUC */
        [v-cloak] { display: none; }
    </style>
</head>

<body class="bg-slate-100">
    <div id="app">
        @yield('content')
    </div>
</body>
</html>