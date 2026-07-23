<div
    x-show="mobileSidebarOpen"
    x-transition.opacity
    @click="mobileSidebarOpen = false"
    class="fixed inset-0 z-40 bg-black/40 lg:hidden"
    x-cloak>
</div>

<aside

    :class="[
        collapsed ? 'lg:w-20' : 'lg:w-72',
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"

    class="fixed inset-y-0 left-0 z-50
           flex w-72 flex-col
           bg-white border-r border-slate-200
           transition-all duration-300 ease-in-out
           lg:static lg:flex">

    <!-- Logo -->
    <div class="flex h-20 items-center justify-between border-b border-slate-200 px-5">

        <div class="flex items-center gap-3 overflow-hidden">

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">

                <!-- Hospital Icon -->
                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="1.8"
                     stroke="currentColor"
                     class="h-6 w-6">

                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M8.25 21V7.5a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25V21m-9 0h12M9.75 9.75h4.5m-2.25-2.25v4.5" />

                </svg>

            </div>

            <div
                x-show="!collapsed"
                x-transition
                class="min-w-0">

                <h2 class="text-lg font-bold text-slate-800 whitespace-nowrap">
                    Clinic System
                </h2>

            </div>

        </div>

         <!-- Desktop -->
    <button
        @click="collapsed = !collapsed"
        class="hidden lg:flex rounded-lg p-2 hover:bg-slate-100">

        <!-- icon -->

    </button>

    <!-- Mobile -->
    <button
        @click="mobileSidebarOpen = false"
        class="rounded-lg p-2 hover:bg-slate-100 lg:hidden">

        <svg xmlns="http://www.w3.org/2000/svg"
             fill="none"
             viewBox="0 0 24 24"
             stroke-width="2"
             stroke="currentColor"
             class="h-5 w-5">

            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"/>

        </svg>

    </button>


    </div>

    <!-- Menu -->

    <nav class="flex-1 space-y-2 p-4">

        <x-doctor.sidebar-link
            :href="match(auth()->user()->role) {
    'admin' => route('admin.dashboard'),
    'doctor' => route('doctor.dashboard'),
    'patient' => route('patient.dashboard'),
}"
            route="doctor.dashboard">

            <x-slot:icon>

                <!-- Home -->

                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="1.8"
                     stroke="currentColor"
                     class="h-6 w-6">

                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.25 12L11.204 3.046a1.125 1.125 0 011.592 0L21.75 12M4.5 9.75V19.5A1.5 1.5 0 006 21h3.75v-5.25h4.5V21H18a1.5 1.5 0 001.5-1.5V9.75"/>

                </svg>

            </x-slot:icon>

            Dashboard

        </x-doctor.sidebar-link>

        <x-doctor.sidebar-link
            :href="route('doctor.services.create')"
            route="doctor.services.*">

            <x-slot:icon>



                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="1.8"
                     stroke="currentColor"
                     class="h-6 w-6">

                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M18 18.72a9.094 9.094 0 003.742-.479A3 3 0 0021 15.348V15A3 3 0 0018 12h-1m-6 6.72A9.094 9.094 0 017.258 18.24 3 3 0 013 15.348V15a3 3 0 013-3h1m4-3a3 3 0 100-6 3 3 0 000 6zm6 3a3 3 0 100-6 3 3 0 000 6zM12 21a6 6 0 100-12 6 6 0 000 12z"/>

                </svg>

            </x-slot:icon>

            Services

        </x-doctor.sidebar-link>

        <x-doctor.sidebar-link
            :href="route('doctor.bookings.index')"
            route="doctor.bookings.*">

            <x-slot:icon>



                <svg xmlns="http://www.w3.org/2000/svg"
     fill="none"
     viewBox="0 0 24 24"
     stroke-width="1.8"
     stroke="currentColor"
     class="h-6 w-6">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.75 3v2.25m10.5-2.25v2.25M3.75 8.25h16.5M4.5 6.75h15A1.5 1.5 0 0121 8.25v10.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.75V8.25a1.5 1.5 0 011.5-1.5z"/>
</svg>

            </x-slot:icon>

            Bookings

        </x-doctor.sidebar-link>

        <x-doctor.sidebar-link
            :href="route('profile.edit')"
            route="profile.*">

            <x-slot:icon>



                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="1.8"
                     stroke="currentColor"
                     class="h-6 w-6">

                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0"/>

                </svg>

            </x-slot:icon>

            Profile

        </x-doctor.sidebar-link>


    </nav>
        <!-- User -->

    <div class="border-t border-slate-200 p-4">

        <div class="flex items-center gap-3">

            <img
                src="https://ui-avatars.com/api/?background=2563eb&color=ffffff&name={{ urlencode(auth()->user()->name) }}"
                alt="User"
                class="h-11 w-11 rounded-full shrink-0">

            <div
                x-show="!collapsed"
                x-transition
                class="min-w-0 flex-1">

                <h4 class="truncate font-semibold text-slate-800">
                    {{ auth()->user()->name }}
                </h4>

                <p class="text-xs text-slate-500">
                    {{ ucfirst(auth()->user()->role) }}
                </p>

            </div>

        </div>

        <form
            action="{{ route('logout') }}"
            method="POST"
            class="mt-4">

            @csrf

            <button
                type="submit"
                class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition hover:bg-red-50">

                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="1.8"
                     stroke="currentColor"
                     class="h-6 w-6 shrink-0">

                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3h9m0 0l-3-3m3 3l-3 3"/>

                </svg>

                <span
                    x-show="!collapsed"
                    x-transition>

                    Logout

                </span>

            </button>

        </form>

    </div>

</aside>
