<script lang="ts">
	import { dayDict, monthDict } from '../../stores/dictStore';
	import { userStore, practiceId, dateInfo } from '../../stores/stores';
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
	import Leaderboard from './Leaderboard.svelte';

	let attendees: any[] = [];

	let dateData: {
		dd: any;
		date: Date;
		daysTillSaturday: number;
		mm: number;
	};

	dateInfo.subscribe((value) => {
		dateData = value;
	});

	let user: {
		email: any;
		displayName: any;
		isverified?: boolean;
		uid?: StringConstructor;
		isAdmin?: boolean;
	};

	let pId: string;

	userStore.subscribe((value) => {
		user = value;
	});
	practiceId.subscribe((value) => {
		pId = value;
	});

	let isCheckedIn: boolean;

	onMount(async () => {
		const practiceRef = doc(collection(db, 'practices'), pId);
		const practiceSnap = await getDoc(practiceRef);

		if (practiceSnap.exists()) {
			attendees = practiceSnap.data().attendees;
			isCheckedIn = attendees.some((attendee) => attendee.email === user.email);
		} else {
			await setDoc(practiceRef, {
				attendees: []
			});
		}
	});

	async function toggleCheckIn() {
		const practiceRef = doc(collection(db, 'practices'), pId);

		if (isCheckedIn) {
			await updateDoc(practiceRef, {
				attendees: arrayRemove({ email: user.email, displayName: user.displayName })
			});
		} else {
			await updateDoc(practiceRef, {
				attendees: arrayUnion({ email: user.email, displayName: user.displayName })
			});
		}

		isCheckedIn = !isCheckedIn;
		window.location.reload();
	}
</script>

<svelte:head>
	<style>
		html,
		body {
			margin: 0;
			padding: 0;
			background-color: #1f2937; /* bg-gray-800 */
			color: #f7fafc; /* text-gray-100 */
		}
	</style>
</svelte:head>

<main>
	<div class="mx-auto w-full">
		<div class="flex flex-col items-center justify-center space-y-10">
			<div class="h-auto w-full space-y-2 rounded-lg bg-gray-900 p-8">
				<div class="flex h-full flex-col items-center justify-center p-1 text-lg">
					<div class="flex items-center justify-center text-center">
						<strong
							>{dayDict[dateData.daysTillSaturday]}, {dateData.dd}.{monthDict[dateData.mm]},
							18:00(19:00 uz papīriem) <i>mūsu skolas</i> (Ūnijas iela 93) zālē volejbols</strong
						>
					</div>
				</div>

				<div class="flex flex-col items-center justify-center space-y-3">
					<button
						on:click={toggleCheckIn}
						class="{isCheckedIn
							? 'bg-red-500 hover:bg-red-600'
							: 'bg-green-500 hover:bg-green-600'} rounded border p-1"
						>{isCheckedIn ? 'Atteikties' : 'Pieteikties'}</button
					>

					<div class="flex flex-col items-center justify-center space-y-3">
						{#if attendees.length !== 0}
							<h2 class="text-center text-xl"><strong>Pieteikušies:</strong></h2>
							<ul class="flex flex-col items-center space-y-2 rounded p-1">
								{#each attendees as attendee (attendee.email)}
									<li>•{attendee.displayName}</li>
								{/each}
							</ul>
							<p class="text-center">Skaits: {attendees.length}</p>
						{/if}
					</div>
				</div>
			</div>
			<Leaderboard />
		</div>
	</div>
</main>
