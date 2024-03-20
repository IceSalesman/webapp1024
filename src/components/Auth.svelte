<script>
	import { authHandlers, authStore } from '../stores/authStore';
	import { createEventDispatcher } from 'svelte';
	import WrongPass from './snackbar/wrongPass.svelte';
	import RegError from './snackbar/regError.svelte';

	let register = false;
	let email = '';
	let password = '';
	let confirmPassword = '';
	let displayName = '';
	let snackbarMessage = '';
	let snackbarMessage2 = '';

	const dispatch = createEventDispatcher();

	async function handleSubmit() {
		if (!email || !password || (register && !confirmPassword)) {
			return;
		}

		if (register && password === confirmPassword) {
			try {
				await authHandlers.signup(email, password, displayName);
			} catch (err) {
				snackbarMessage2 = 'Kļūda reģistrācijas laikā. Mēģiniet vēlreiz.';
				dispatch('showSnackbar2', { message: snackbarMessage2 });
				console.log(err);
			}
		} else {
			try {
				await authHandlers.login(email, password);
			} catch (err) {
				snackbarMessage = 'Nepareiza parole vai e-pasts. Mēģiniet vēlreiz.';
				dispatch('showSnackbar', { message: snackbarMessage });
				console.log(err);
			}
		}
		if ($authStore.currentUser) {
			window.location.href = '/privatedashboard';
		}
	}
</script>


<body class="dark:bg-gray-800 dark:text-gray-100">
	<div class="flex justify-center items-center h-screen">
		<div class="w-full max-w-md p-8 space-y-3 rounded-xl dark:bg-gray-900 dark:text-gray-100">
			<h1 class="text-2xl font-bold text-center">{register ? 'Reģistrēties' : 'Pieslēgties'}</h1>
				<form class="space-y-6">
					<div>
						<input bind:value={email} type="email" id="email" placeholder="E-pasts" class="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
					</div>
					<div>
						<input bind:value={password} type="password" placeholder="Parole" class="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
					</div>
				
					{#if register}
						<div>
							<input bind:value={confirmPassword} class="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" type="password" placeholder="Apstiprini paroli" />
						</div>
						<div>
							<input bind:value={displayName} class="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" type="text" placeholder="Vārds, Uzvārds">
						</div>
					{/if}
					<button class="block w-full p-3 text-center rounded-sm dark:text-gray-900 dark:bg-violet-300" on:click={handleSubmit}>{register ? 'Reģistrēties' : 'Pieslēgties'}</button>
				</form>
				{#if register}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div>
						<p class="text-xs text-center sm:px-6 dark:text-gray-400">Jau ir konts?
						
						<!-- svelte-ignore a11y-missing-attribute -->
						<a 
						on:click={() => {
							register = false;
						}}
						on:keydown={() => {}} 
						class="hover:underline dark:text-gray-100 cursor-pointer">Pieslēdzies!</a>
					</div>
				{:else}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div>
						<p class="text-xs text-center sm:px-6 dark:text-gray-400">Nav konts?
						
						<!-- svelte-ignore a11y-missing-attribute -->
						<a 
						on:click={() => {
							register = true;
						}}
						on:keydown={() => {}} 
						class="hover:underline dark:text-gray-100 cursor-pointer">Reģistrējies!</a>
					</div>
	
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						on:click={() => {
							authHandlers.resetPassword(email)
						}}
						on:keydown={() => {}} 
						class="flex justify-center text-xs dark:text-gray-400 cursor-pointer hover:underline"
					>
						Aizmirsi paroli?
					</div>
				{/if}
		</div>
	</div>
</body>


<!-- Snackbar component -->
{#if snackbarMessage}
	<div class="fixed bottom-2 right-2">
		<WrongPass />
	</div>
	
{/if}
{#if snackbarMessage2}
	<div class="fixed bottom-2 right-2">
		<RegError />
	</div>
{/if}

