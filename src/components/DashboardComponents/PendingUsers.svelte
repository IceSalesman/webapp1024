<script lang="ts">
	import { db } from '$lib/firebase/firebase.client';
	import { collection, getDocs } from 'firebase/firestore';
	import { onMount } from 'svelte';

	let pendingUsers: any[] = [];

	onMount(async () => {
		const pendingUsersRef = collection(db, 'pendingUsers');
		const pUSnap = await getDocs(pendingUsersRef);

		const allUsers = pUSnap.docs.map((doc) => ({ ...doc.data(), uid: doc.id }));

		// Replace 'specificUid' with the uid of the user you want to filter out
		const specificUid = 'doNotDelete';
		pendingUsers = allUsers.filter((user) => user.uid !== specificUid);
	});

	async function acceptUser(userId: any) {

    }

    async function denyUser(userId: any) {
        
    }
    
</script>

{#each pendingUsers as pendingUser (pendingUser.uid)}
	<div class="user-container">
		<p>Name: {pendingUser.displayName}</p>
		<p>Email: {pendingUser.email}</p>
		<button on:click={() => acceptUser(pendingUser.uid)}>Accept</button>
		<button on:click={() => denyUser(pendingUser.uid)}>Deny</button>
	</div>
{/each}
