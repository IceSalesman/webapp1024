<script>
    import { authHandlers, authStore } from '../../../stores/authStore';
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
        displayName = curr?.currentUser?.displayName;
        // @ts-ignore
        email = curr?.currentUser?.email;
		// @ts-ignore
        isverified = curr?.currentUser?.emailVerified;
	});

</script>




<main class="flex items-center justify-center h-screen text-gray-100 bg-gray-800">
    <div class="flex flex-col bg-gray-900 p-10 rounded justify-center">
        
        <div class="mb-4">
            <p class="font-bold">Name:</p>
            <p>{displayName}</p>
        </div>
        <div class="mb-4">
            <p class="font-bold">Email:</p>
            <p>{email}</p>
        </div>
        <button class="flex justify-center bg-violet-300 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded text-black">
            Mainīt vārdu
        </button>
    </div>
</main>
