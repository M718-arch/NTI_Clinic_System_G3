<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLINIK - Patient Dashboard</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="app"></div>
</body>
</html>