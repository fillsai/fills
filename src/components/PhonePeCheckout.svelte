<script lang="ts">
  import { onMount } from 'svelte';

  // Props
  export let defaultAmount: number = 100;

  // State
  let amount = defaultAmount;
  let isLoading = false;
  let error = '';
  let success = false;

  // Get base URL: prefer current origin on client, environment variable on server
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321');

  async function initiatePayment() {
    // Validate amount
    if (!amount || amount <= 0) {
      error = 'Please enter a valid amount';
      return;
    }

    isLoading = true;
    error = '';
    success = false;

    try {
      // Call payment initiation API
      const response = await fetch('/api/phonepe/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          redirectUrl: `${baseUrl}/`,
          redirectUrl: `${baseUrl}/payment/status`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      // Redirect to PhonePe checkout
      if (data.checkoutUrl) {
        success = true;
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Checkout URL not received');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      isLoading = false;
    }
  }
</script>

<div class="max-w-md mx-auto p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-xl">
  <div class="text-center mb-6">
    <div class="inline-block p-4 bg-purple-600 rounded-full mb-4">
      <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    </div>
    <h2 class="text-3xl font-bold text-gray-800 mb-2">PhonePe Payment</h2>
    <p class="text-gray-600">Secure payment gateway</p>
  </div>

  <div class="space-y-6">
    <!-- Amount Input -->
    <div>
      <label for="amount" class="block text-sm font-semibold text-gray-700 mb-2">
        Enter Amount (₹)
      </label>
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">₹</span>
        <input
          id="amount"
          type="number"
          bind:value={amount}
          min="1"
          step="1"
          class="w-full pl-10 pr-4 py-4 text-lg font-semibold border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all"
          placeholder="100"
          disabled={isLoading}
        />
      </div>
      <p class="mt-2 text-xs text-gray-500">Minimum amount: ₹1</p>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm font-medium text-red-800">{error}</p>
        </div>
      </div>
    {/if}

    <!-- Success Message -->
    {#if success}
      <div class="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-500 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm font-medium text-green-800">Redirecting to PhonePe...</p>
        </div>
      </div>
    {/if}

    <!-- Pay Button -->
    <button
      on:click={initiatePayment}
      disabled={isLoading || success}
      class="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
    >
      {#if isLoading}
        <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      {:else}
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Pay with PhonePe
      {/if}
    </button>

    <!-- Security Badge -->
    <div class="flex items-center justify-center gap-2 text-xs text-gray-500">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
      </svg>
      <span>Secured by PhonePe Payment Gateway</span>
    </div>
  </div>
</div>

<style>
  /* Custom animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  div {
    animation: fadeIn 0.3s ease-out;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }
</style>
