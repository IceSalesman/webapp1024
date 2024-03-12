<script>
	import Loading from '../../components/Loading.svelte';
	import AuthReset from '../../components/AuthReset.svelte';
	// @ts-ignore
	import { auth } from '../../lib/firebase/firebase.client';
	import { authHandlers, authStore } from '../../stores/authStore';

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
		email = curr?.currentUser?.email;
		// @ts-ignore
		displayName = curr?.currentUser?.displayName;
		// @ts-ignore
		isverified = curr?.currentUser?.emailVerified;
	});

</script>

{#if $authStore.currentUser}
	<div class="flex-col">
		<h1>CURRENT USER: {email}</h1>
		<h1>CURRENT DISPLAYNAME: {displayName}</h1>
		<h1>IS VERIFIED?: {isverified}</h1>


        <button on:click={authHandlers.logout}>Logout</button>

	</div>
{:else}

	<div class="flex items-center justify-center">
		<Loading />
	</div>
	

{/if}

<style>
	
</style>
