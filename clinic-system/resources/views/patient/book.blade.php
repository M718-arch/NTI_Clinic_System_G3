<!DOCTYPE html>
<html>
<head>
    <title>Book Appointment</title>
</head>
<body>

<h1>Book Appointment</h1>

<h3>Service: {{ $service->name }}</h3>

@if ($errors->any())
    <div style="color:red;">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<form action="{{ route('book.store',$service) }}" method="POST">
    @csrf

    <input type="hidden" name="service_id" value="{{ $service->id }}">

    <label>Date:</label>
    <input type="date" name="date">
    <br><br>

    <label>Time:</label>
    <input type="time" name="time">
    <br><br>

    <label>Notes:</label>
    <textarea name="notes"></textarea>
    <br><br>

    <button type="submit">Book</button>

</form>

</body>
</html>
