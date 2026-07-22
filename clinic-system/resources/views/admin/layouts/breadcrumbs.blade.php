@php
    // Falls back to a plain "Dashboard" crumb when a view doesn't define its own.
    $breadcrumbs = $breadcrumbs ?? [
        ['label' => 'Dashboard', 'route' => 'admin.dashboard'],
    ];
    $pageTitle = $pageTitle ?? ($breadcrumbs[count($breadcrumbs) - 1]['label'] ?? 'Dashboard');
@endphp

<div class="admin-breadcrumbs">
    <div>
        <h1 class="breadcrumbs-title">{{ $pageTitle }}</h1>
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb admin-breadcrumb">
                @foreach ($breadcrumbs as $index => $crumb)
                    @php
                        $isLast = $index === count($breadcrumbs) - 1;
                        $hasRoute = isset($crumb['route']) && Route::has($crumb['route']);
                    @endphp

                    @if ($isLast)
                        <li class="breadcrumb-item active" aria-current="page">{{ $crumb['label'] }}</li>
                    @else
                        <li class="breadcrumb-item">
                            <a href="{{ $hasRoute ? route($crumb['route']) : ($crumb['url'] ?? '#') }}">
                                {{ $crumb['label'] }}
                            </a>
                        </li>
                    @endif
                @endforeach
            </ol>
        </nav>
    </div>

    @hasSection('breadcrumb-actions')
        <div class="breadcrumbs-actions">
            @yield('breadcrumb-actions')
        </div>
    @endif
</div>
