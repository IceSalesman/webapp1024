<script>
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
	authStore.subscribe((curr) => {
		console.log('CURR', curr);
		// @ts-ignore
		email = curr?.currentUser?.email;
		// @ts-ignore
		displayName = curr?.currentUser?.displayName;
	});

</script>

{#if $authStore.currentUser}
	<div>
		<h1>CURRENT USER: {email}</h1>
		<h1>CURRENT DISPLAYNAME: {displayName}</h1>
		<AuthReset />
        <button on:click={authHandlers.logout}>Logout</button>

	</div>
{:else}
	<div>Loading....</div>
{/if}

<style>
	div {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	h1 {
		text-align: center;
	}
</style>
