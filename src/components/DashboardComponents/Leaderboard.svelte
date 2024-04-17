<script lang="ts">
	import { authStore, authHandlers } from '../../stores/authStore';
	import { dayDict, monthDict } from '../../stores/dictStore';
	import { db } from '../../lib/firebase/firebase.client';
	import {
		collection,
		doc,
		setDoc,
		updateDoc,
		arrayUnion,
		getDoc,
		arrayRemove,
		getDocs
	} from 'firebase/firestore';
	import { onMount } from 'svelte';
	import { sortBy } from '../../stores/stores';
	import { update } from 'firebase/database';

	let email: any;
	let displayName: any;
	let isverified: any;
	let attendees: any[] = [];

	let playerData: any = [];

	let unique = {};

	let time = new Date();

	$: dd = time.getDate();
	$: mm = time.getMonth();

	$: daysTillSaturday = 6 - time.getDay();
	$: saturdayDate = dd + daysTillSaturday;

	let isAdmin = false;
	let uid: any;
	$: {
		if (daysTillSaturday < 0) {
			daysTillSaturday = 6;
		}
	}

	authStore.subscribe(async (curr) => {
		// @ts-ignore
		email = curr?.currentUser?.email;
		// @ts-ignore
		displayName = curr?.currentUser?.displayName;
		// @ts-ignore
		isverified = curr?.currentUser?.emailVerified;
		// @ts-ignore
		uid = curr?.currentUser?.uid;

		// @ts-ignore
		const newDisplayName = curr?.currentUser?.displayName;

		if (displayName !== newDisplayName) {
			displayName = newDisplayName;
			updateNameInPracticesDoc(displayName);
		}

		const adminRef = doc(db, 'admins', uid);
		const adminDocSnapshot = await getDoc(adminRef);

		if (adminDocSnapshot.exists()) {
			isAdmin = true;
		} else {
			isAdmin = false;
		}
	});

	async function updateNameInPracticesDoc(newName: string) {
		const practiceRef = doc(collection(db, 'practices'), practiceId);
		await updateDoc(practiceRef, {
			attendees: attendees.map((attendee) => {
				if (attendee.email === email) {
					return { email, displayName: newName };
				}
				return attendee;
			})
		});
	}

	function refreshPage() {
		window.location.reload();
	}

	function getNextSaturday() {
		const now = new Date();
		const nextSaturday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + (7 - now.getDay() || 7)
		);
		return nextSaturday.toISOString().split('T')[0];
	}

	export const practiceId = getNextSaturday();

	let isCheckedIn: boolean;

	onMount(async () => {
		const practiceRef = doc(collection(db, 'practices'), practiceId);
		const practiceSnap = await getDoc(practiceRef);

		if (practiceSnap.exists()) {
			console.log('Document found');
			attendees = practiceSnap.data().attendees;
			isCheckedIn = attendees.some((attendee) => attendee.email === email);
		} else {
			console.log('No such document, creating new one');
			await setDoc(practiceRef, {
				attendees: []
			});
		}

		const playerCollectionRef = collection(db, 'players');
		const playerSnapshots = await getDocs(playerCollectionRef);

		playerData = playerSnapshots.docs.map((doc) => doc.data());

		console.log(playerData);

		loadLeaderboard();
	});

	async function toggleCheckIn() {
		const practiceRef = doc(collection(db, 'practices'), practiceId);

		if (isCheckedIn) {
			await updateDoc(practiceRef, {
				attendees: arrayRemove({ email, displayName })
			});
		} else {
			await updateDoc(practiceRef, {
				attendees: arrayUnion({ email, displayName })
			});
		}

		isCheckedIn = !isCheckedIn;
		refreshPage();
	}

	let sortedPlayerData: any[] = [];


	async function loadLeaderboard() {

		sortedPlayerData = [...playerData]
			.filter((player) => player.displayName !== 'big bazongas')
            // @ts-ignore
			.sort(sortPlayers);
	}

	$: {
		if ($sortBy) {
			loadLeaderboard();
		}
	}

	function sortPlayers(a: { playerElo: number; losses: number; wins: number; }, b: { playerElo: number; losses: number; wins: number; }) {
		if ($sortBy === 'elo') {
			return b.playerElo - a.playerElo;
		} else if ($sortBy === 'wl') {
			let aRatio = a.losses === 0 ? a.wins : a.wins / a.losses;
			let bRatio = b.losses === 0 ? b.wins : b.wins / b.losses;
			return bRatio - aRatio;
		}
	}
</script>

<div class="flex flex-col">
	<h1 class="text-2xl text-center font-bold">Līderi</h1>
	<table class="m-2 flex-shrink-0">
		<thead class="border-b">
			<tr class="text-center">
				<th scope="col" class="text-sm font-medium text-gray-100 text-center px-6 py-4 text-left"
					>#</th
				>
				<th scope="col" class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left"
					>Vārds</th
				>
				<th scope="col" class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left"
					>W</th
				>
				<th scope="col" class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left"
					>L</th
				>
				<th
					scope="col"
					class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left"
					on:click={() => ($sortBy = 'wl')}
					><button class={$sortBy === 'wl' ? 'font-bold' : ''} on:click={() => ($sortBy = 'wl')}
						>W/L</button
					>
				</th>
				<th scope="col" class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left"
					><button class={$sortBy === 'elo' ? 'font-bold' : ''} on:click={() => ($sortBy = 'elo')}
						>Reitings</button
					>
				</th>
			</tr></thead
		>
		<tbody>
			{#if Array.isArray(playerData)}
				{#each sortedPlayerData as player, i (player.displayName)}
					<tr class="border-b text-center">
						<td>{i + 1}</td>
						<td class="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap"
							>{player.displayName}</td
						>
						<td>{player.wins}</td>
						<td>{player.losses}</td>
						<td
							>{player.losses === 0
								? player.wins.toFixed(1)
								: (player.wins / player.losses).toFixed(1)}</td
						>
						<td>{player.playerElo.toFixed(0)}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	tr:nth-child(even) {
		background-color: #1a202c;
	}
</style>
