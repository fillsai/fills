<script>
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';

  let mounted = false;
  let activeTab = 'weekly';

  onMount(() => {
    mounted = true;
  });
</script>

<section id="devtools" class="py-16 px-4 sm:px-6">
  <div class="max-w-4xl mx-auto">
    {#if mounted}
      <div in:slide={{ duration: 800, delay: 200 }} class="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 overflow-hidden shadow-xl">
        <!-- Header -->
        <div class="border-b border-gray-800/50 p-4">
          <h2 class="text-2xl font-semibold text-white">Pricing Plans</h2>
          <p class="text-gray-400 mt-1">Flexible options for businesses of all sizes</p>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-gray-800/50">
          <button
            class={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'weekly'
                ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-400/5'
                : 'text-gray-400 hover:text-white'
            }`}
            on:click={() => activeTab = 'weekly'}
          >
            Weekly
          </button>
          <button
            class={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'monthly'
                ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-400/5'
                : 'text-gray-400 hover:text-white'
            }`}
            on:click={() => activeTab = 'monthly'}
          >
            Monthly
          </button>
        </div>

        <!-- Content -->
        <div class="p-8">
          {#if activeTab === 'weekly'}
            <div in:fade={{ duration: 300 }} class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-semibold text-white">Short Term Plan</h3>
                  <span class="px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-bold rounded-full border border-orange-500/20 uppercase tracking-wider">Most Flexible</span>
                </div>
                <div class="grid sm:grid-cols-2 gap-6 pt-4">
                  <div class="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                    <p class="text-sm text-gray-400 mb-1">Base Price</p>
                    <p class="text-2xl font-bold text-orange-400">₹70,000<span class="text-sm text-gray-500 font-normal">/week</span></p>
                  </div>
                  <div class="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                    <p class="text-sm text-gray-400 mb-1">Delivery Time</p>
                    <p class="text-2xl font-bold text-white">1 Week</p>
                  </div>
                </div>
                <div class="pt-4">
                  <h4 class="text-sm font-semibold text-gray-300 mb-3">Key Benefits</h4>
                  <ul class="grid sm:grid-cols-2 gap-3 mb-6">
                    <li class="flex items-center gap-2 text-sm text-gray-400">
                      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      Quick full implementation
                    </li>
                    <li class="flex items-center gap-2 text-sm text-gray-400">
                      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      Direct expert access
                    </li>
                  </ul>
                  <a 
                    href="/payment?amount=70000"
                    class="block w-full text-center py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all hover:-translate-y-0.5"
                  >
                    Pay with PhonePe
                  </a>
                </div>
              </div>
            </div>
          {:else if activeTab === 'monthly'}
            <div in:fade={{ duration: 300 }} class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-semibold text-white">Medium Term Plan</h3>
                  <span class="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20 uppercase tracking-wider">Best Value</span>
                </div>
                <div class="grid sm:grid-cols-2 gap-6 pt-4">
                  <div class="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                    <p class="text-sm text-gray-400 mb-1">Starting From</p>
                    <p class="text-2xl font-bold text-orange-400">₹2,50,000<span class="text-sm text-gray-500 font-normal">/month</span></p>
                  </div>
                  <div class="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                    <p class="text-sm text-gray-400 mb-1">Timeline</p>
                    <p class="text-2xl font-bold text-white">Fastest Delivery</p>
                  </div>
                </div>
                <div class="pt-4">
                  <h4 class="text-sm font-semibold text-gray-300 mb-3">Key Benefits</h4>
                  <ul class="grid sm:grid-cols-2 gap-3 mb-6">
                    <li class="flex items-center gap-2 text-sm text-gray-400">
                      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      Comprehensive solutions
                    </li>
                    <li class="flex items-center gap-2 text-sm text-gray-400">
                      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      Full system integration
                    </li>
                    <li class="flex items-center gap-2 text-sm text-gray-400">
                      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      Dedicated support team
                    </li>
                  </ul>
                  <a 
                    href="/payment?amount=250000"
                    class="block w-full text-center py-4 px-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                  >
                    Pay with PhonePe
                  </a>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  button {
    outline: none;
  }
</style>
