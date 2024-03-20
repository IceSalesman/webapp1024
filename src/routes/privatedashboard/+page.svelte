<script>
	import Loading from '../../components/Loading.svelte';
	
	// @ts-ignore
	import { auth } from '../../lib/firebase/firebase.client';
	import { authHandlers, authStore } from '../../stores/authStore';
	import { onMount } from 'svelte';
	import NotVerified from '../../components/notVerified.svelte'
	import Dashboard from '../../components/Dashboard.svelte'

	// @ts-ignore
	/**
	 * @type {any}
	 */
	let email;
	// @ts-ignore
	/**
	 * @type {any}
	 */
	let displayName;

	/**
	 * @type {any}
	 */
	let isverified;
	authStore.subscribe((curr) => {
		console.log('CURR', curr);
		// @ts-ignore
		isverified = curr?.currentUser?.emailVerified;
	});

	

</script>




<main class="">
	{#if $authStore.currentUser}
		{#if isverified}
			<Dashboard />

		{:else}
			<NotVerified />

		{/if}

  
	{:else}

		<div class="flex w-full h-full items-center justify-center bg-gray-900 text-gray-100 h-screen">
			<Loading />
		</div>

	{/if}
</main>


