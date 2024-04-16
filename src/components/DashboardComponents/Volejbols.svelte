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

	let email: any;
	let displayName: any;
	let isverified: any;
	let attendees: any[] = [];

	let playerData: any = {};

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

	let rowNumber = 0;
</script>

<svelte:head>
	<style>
		body {
			background-color: #1f2937; /* bg-gray-800 */
			color: #f7fafc; /* text-gray-100 */
		}
	</style>
</svelte:head>

<main
	class="bg-gray-800 text-gray-100 flex justify-center items-start min-h-screen p-4 pt-20 flex-wrap"
	style="height: calc(100vh - 5rem);"
>
	<div class="flex-col flex space-y-10">
		<div class="w-auto h-auto p-8 space-y-2 bg-gray-900 rounded-lg">
			<div class="h-full flex flex-col justify-center items-center p-1 text-lg">
				<div class="flex items-center justify-center text-center">
					<strong
						>{dayDict[daysTillSaturday]}, {saturdayDate}.{monthDict[mm]}, 18:00(19:00 uz papīriem)
						<i>mūsu skolas</i> (Ūnijas iela 93) zālē volejbols
					</strong>
				</div>
			</div>

			<div class="flex flex-col items-center justify-center space-y-3">
				<button
					on:click={toggleCheckIn}
					class="border rounded {isCheckedIn
						? 'bg-red-500 hover:bg-red-600'
						: 'bg-green-500 hover:bg-green-600'} p-1"
					>{isCheckedIn ? 'Atteikties' : 'Pieteikties'}</button
				>

				<div class="flex flex-col items-center justify-center space-y-3">
					{#if attendees.length !== 0}
						<h2 class="text-center text-xl"><strong>Pieteikušies:</strong></h2>
						<ul class="flex flex-col rounded items-center space-y-2 p-1">
							{#each attendees as attendee (attendee.email)}
								<li>•{attendee.displayName}</li>
							{/each}
						</ul>
						<p class="text-center">Skaits: {attendees.length}</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex flex-col">
			<h1 class="text-2xl text-center font-bold">Līderi</h1>
			<table class="m-2 flex-shrink-0">
				<thead class="border-b">
					<tr class="text-center">
						<th
							scope="col"
							class="text-sm font-medium text-gray-100 text-center px-6 py-4 text-left">#</th
						>
						<th
							scope="col"
							class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left">Vārds</th
						>
						<th
							scope="col"
							class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left">W</th
						>
						<th
							scope="col"
							class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left">L</th
						>
						<th
							scope="col"
							class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left">W/L</th
						>
						<th
							scope="col"
							class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left"
						>
							Reitings</th
						>
					</tr></thead
				>
				<tbody>
					{#if Array.isArray(playerData)}
						{#each playerData
							.filter((player) => player.displayName !== 'big bazongas')
							.sort((a, b) => b.playerElo - a.playerElo) as player, i (player.displayName)}
							{#if player.displayName !== 'big bazongas'}
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
							{/if}
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</main>

<style>
	tr:nth-child(even) {
		background-color: #1a202c;
	}
</style>
