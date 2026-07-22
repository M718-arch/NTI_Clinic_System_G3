<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Clinic System')</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="bg-slate-100">

<div
    x-data="{
        collapsed: JSON.parse(localStorage.getItem('sidebar') ?? 'false'),
        mobileSidebarOpen: false
    }"
    x-init="$watch('collapsed', value => localStorage.setItem('sidebar', JSON.stringify(value)))"
    class="flex min-h-screen bg-slate-50">

    @include('admin.layouts.sidebar')

    <div class="flex flex-1 flex-col">

        @include('admin.layouts.navbar')

<main class="flex-1 overflow-y-auto p-8">
            @yield('content')

        </main>

    </div>

</div>
<x-admin.toast />
</body>
</html>
