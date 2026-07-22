<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Bookings</title>
</head>
<body>

    <h1>My Bookings</h1>

    @if(session('success'))
        <p style="color: green;">
            {{ session('success') }}
        </p>
    @endif

    @if($bookings->isEmpty())
        <p>You have no bookings yet.</p>
    @else
        <table border="1" cellpadding="10">
            <tr>
                <th>Service</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Notes</th>
            </tr>

            @foreach($bookings as $booking)
                <tr>
                    <td>{{ $booking->service->name }}</td>
                    <td>{{ $booking->service->doctor->name }}</td>
                    <td>{{ $booking->date }}</td>
                    <td>{{ $booking->time }}</td>
                    <td>{{ $booking->status }}</td>
                    <td>{{ $booking->notes }}</td>
                </tr>
            @endforeach

        </table>
    @endif

</body>
</html>
