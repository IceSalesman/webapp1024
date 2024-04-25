<script lang='ts'>
	import Loading from '../../components/Loading.svelte';
	import { authStore } from '../../stores/authStore';
	import NotVerified from '../../components/notVerified.svelte';
	import Dashboard from '../../components/Dashboard.svelte';


	
	let isverified: boolean | undefined = false;

	authStore.subscribe(curr => {
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
