<header class="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
    <div class="flex h-20 items-center justify-between px-8">

        <!-- Left -->

        <div class="flex items-center gap-5">
<!-- Mobile Toggle -->
<button
    @click="mobileSidebarOpen = true"
    class="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 transition lg:hidden">

    <svg xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         stroke="currentColor"
         class="h-6 w-6">

        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.5 6.75h15m-15 5.25h15m-15 5.25h15"/>

    </svg>

</button>
            <button
                @click="collapsed = !collapsed"
                class="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 transition">

                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="2"
                     stroke="currentColor"
                     class="w-5 h-5 text-slate-600">

                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M4.5 6.75h15m-15 5.25h15m-15 5.25h15" />

                </svg>

            </button>

            <div>



                <h1 class="text-sm text-slate-500">

                    Welcome back,<br> {{ auth()->user()->role }}

                </p>

            </div>

        </div>

        <!-- Right -->

        <div class="flex items-center gap-4">

            <!-- Search -->

            <div class="relative hidden lg:block">

                <input
                    type="text"
                    placeholder="Search..."
                    class="w-72 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white">

                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="2"
                     stroke="currentColor"
                     class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400">

                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6 6a7.5 7.5 0 0 0 10.65 10.65Z" />

                </svg>

            </div>

            <!-- Notifications -->

            <button
                class="relative flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100 transition">

                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="2"
                     stroke="currentColor"
                     class="w-6 h-6 text-slate-600">

                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.57 1.082 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>

                </svg>

                <span class="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>

            </button>

            <!-- Profile -->

            <div x-data="{open:false}" class="relative">

                <button
                    @click="open=!open"
                    class="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-100 transition">

                    <img
                        src="https://ui-avatars.com/api/?background=2563eb&color=fff&name={{ urlencode(auth()->user()->name) }}"
                        class="h-11 w-11 rounded-full">

                    <div class="hidden md:block text-left">

                        <h4 class="font-semibold text-slate-700">

                            {{ auth()->user()->name }}

                        </h4>

                        <p class="text-xs text-slate-500">

                            {{ ucfirst(auth()->user()->role) }}

                        </p>

                    </div>

                </button>

                <div
                    x-show="open"
                    @click.outside="open=false"
                    x-transition
                    class="absolute right-0 mt-3 w-56 rounded-xl border border-slate-200 bg-white shadow-lg">

                    <a
                        href="#"
                        class="block px-5 py-3 hover:bg-slate-50">

                        Profile

                    </a>

                    <a
                        href="#"
                        class="block px-5 py-3 hover:bg-slate-50">

                        Settings

                    </a>

                    <hr>

                    <form action="{{ route('logout') }}" method="POST">

                        @csrf

                        <button
                            class="w-full px-5 py-3 text-left text-red-600 hover:bg-red-50">

                            Logout

                        </button>

                    </form>

                </div>

            </div>

        </div>

    </div>

</header>
