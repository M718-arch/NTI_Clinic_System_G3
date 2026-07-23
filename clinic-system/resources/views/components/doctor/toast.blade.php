<div
    x-data="{
        show: true
    }"
    x-init="setTimeout(() => show = false, 3000)"
    x-show="show"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="opacity-0 translate-y-3"
    x-transition:enter-end="opacity-100 translate-y-0"
    x-transition:leave="transition ease-in duration-200"
    x-transition:leave-start="opacity-100 translate-y-0"
    x-transition:leave-end="opacity-0 translate-y-3"
    class="fixed top-6 right-6 z-[9999]">

    @if(session('success'))

        <div class="flex items-center gap-3 rounded-xl border border-green-200 bg-white px-5 py-4 shadow-xl">

            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">

                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="2"
                     stroke="currentColor"
                     class="h-5 w-5 text-green-600">

                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"/>

                </svg>

            </div>

            <div>

                <h4 class="font-semibold text-slate-800">

                    Success

                </h4>

                <p class="text-sm text-slate-500">

                    {{ session('success') }}

                </p>

            </div>

        </div>

    @endif

</div>
