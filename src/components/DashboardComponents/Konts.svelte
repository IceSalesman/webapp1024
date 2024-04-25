<script lang="ts">
	import { authHandlers } from '../../stores/authStore';
	import { db } from '$lib/firebase/firebase.client';

	import { onMount } from 'svelte';
	import { collection, doc, updateDoc } from 'firebase/firestore';
	import { userStore, practiceId } from '../../stores/stores';

	let user: {
		email: any;
		displayName?: StringConstructor;
		isverified?: boolean;
		uid?: StringConstructor;
	};
	let attendees: any[];

	let pId: string;

	practiceId.subscribe((value) => {
		pId = value;
	});

	userStore.subscribe((value) => {
		user = value;
	});

	let newDisplayName: string = '';

	async function handleSubmit() {
		await authHandlers.updateProfile(newDisplayName);
		await updateNameInPracticesDoc(newDisplayName);

		window.location.reload();
	}

	async function updateNameInPracticesDoc(newDisplayName: string) {
		const practiceRef = doc(collection(db, 'practices'), pId);
		await updateDoc(practiceRef, {
			attendees: attendees.map((attendee: { email: any }) => {
				if (attendee.email === user.email) {
					return { email: user.email, displayName: newDisplayName };
				}
				return attendee;
			})
		});

		const playerRef = doc(collection(db, 'players'), user.email);
		await updateDoc(playerRef, {
			displayName: newDisplayName
		});
	}

	onMount(async () => {
	
	});
</script>

<main class="grid grid-flow-col items-start h-screen text-gray-100 bg-gray-800 p-4">
    <div class="bg-gray-900 p-10 rounded max-w-lg">
        <div class="mb-4">
            <p class="font-bold">Vārds:</p>
            <p>{user.displayName}</p>
        </div>
        <div class="mb-4">
            <p class="font-bold">E-pasts:</p>
            <p>{user.email}</p>
        </div>
        <form on:submit={handleSubmit}>
            <div class="mb-4">
                <p class="font-bold">Mainīt vārdu:</p>
                <input
                    type="text"
                    bind:value={newDisplayName}
                    class="w-full p-2 border rounded bg-gray-800 border-gray-700"
                />
            </div>
            <div>
                <button
                    type="submit"
                    class="block w-full p-3 text-center rounded-sm text-gray-900 bg-violet-300"
                >
                    Mainīt vārdu
                </button>
            </div>
        </form>
    </div>
</main>