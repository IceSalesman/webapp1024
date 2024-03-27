<script lang="ts">
	import { authStore, authHandlers } from '../stores/authStore';
	import { dayDict, monthDict } from '../stores/dictStore';
	import { db } from '../lib/firebase/firebase.client';
	import {
		collection,
		doc,
		setDoc,
		updateDoc,
		arrayUnion,
		getDoc,
		arrayRemove
	} from 'firebase/firestore';
	import { onMount } from 'svelte';

	let email: any;
	let displayName: any;
	let isverified: any;
	let attendees: any[] = [];

	let time = new Date();

	$: dd = time.getDate();
	$: mm = time.getMonth();

	$: daysTillSaturday = 6 - time.getDay();
	$: saturdayDate = dd + daysTillSaturday;

	$: {
		if (daysTillSaturday < 0) {
			daysTillSaturday = 6;
		}
	}

	authStore.subscribe((curr) => {
		// @ts-ignore
		email = curr?.currentUser?.email;
		// @ts-ignore
		displayName = curr?.currentUser?.displayName;
		// @ts-ignore
		isverified = curr?.currentUser?.emailVerified;
	});

	function refreshPage() {
		window.location.reload();
	}

	/**
	 * Tehniski labāk būtu pārtaisīt tā, ka viņs nevis taisa docu ar cilvēkiem, kas nāk,
	 * bet labāk ka vins edito docu ar useriem (takā 'comingNextPractice = true/false')
	 * un tad displajot tikai tos, kas ir true, kā arī, lai automatiski katru nedēlu parmaina uz false
	 * Man liekas, ka sita vins nepistos nomainot vārdu, jo mes varetu vienk user doca nomainit. Paldies par uzmanību
	 */
	function getNextSaturday() {
		const now = new Date();
		const nextSaturday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + (7 - now.getDay() || 7)
		);
		return nextSaturday.toISOString().split('T')[0];
	}

	const practiceId = getNextSaturday();

	/**
	 * ok man paradijas ideja. mes varetu useru atrast pec email saraksta un tad nomainit displayName vertibu, bet es negribu
	 * to darit.
	 *
	 * velu veiksmi
	 */

	async function checkIn() {
		const practiceRef = doc(collection(db, 'practices'), practiceId);

		await updateDoc(practiceRef, {
			attendees: arrayUnion({ email, displayName })
		});

		refreshPage();
	}

	async function checkOut() {
		const practiceRef = doc(collection(db, 'practices'), practiceId);

		await updateDoc(practiceRef, {
			attendees: arrayRemove({ email, displayName })
		});

		refreshPage();
	}

	onMount(async () => {
		const practiceRef = doc(collection(db, 'practices'), practiceId);
		const practiceSnap = await getDoc(practiceRef);

		if (practiceSnap.exists()) {
			console.log('Document found');
			attendees = practiceSnap.data().attendees;
		} else {
			console.log('No such document, creating new one');
			await setDoc(practiceRef, {
				attendees: []
			});
		}
	});

	async function goAcc() {
		window.location.href = '/privatedashboard/account';
	}
</script>

<main class="bg-gray-800 text-gray-100 flex justify-center items-center h-screen">
	<div class="w-auto h-auto p-8 space-y-3 bg-gray-900 rounded-lg">
		<div class="h-full flex flex-col justify-center items-center p-1 text-lg">
			<div class="flex items-center justify-center text-center">
				<strong
					>{dayDict[daysTillSaturday]}, {saturdayDate}.{monthDict[mm]}, 18:00(19:00 uz papīriem)
					<i>mūsu skolas</i> (Ūnijas iela 93) zālē volejbols
				</strong>
			</div>
		</div>

		<div class="flex items-center justify-center space-x-4 p-3">
			<button class="border rounded bg-green-500 hover:bg-green-400 p-1" on:click={checkIn}
				>Pieteikties</button
			>
			<button class="border rounded bg-red-500 hover:bg-red-400 p-1" on:click={checkOut}
				>Atteikties</button
			>
		</div>

		<h2 class="flex items-center justify-center"><strong>Pieteikušies</strong></h2>
		<div class="flex flex-col items-center justify-center space-y-10">
			<ul class="flex flex-col border rounded border-2 border-gray-100 items-center space-y-2 p-1">
				{#each attendees as attendee (attendee.email)}
					<li>{attendee.displayName}</li>
				{/each}
			</ul>

			<p class="text-center">Pieteikušies: {attendees.length}</p>
			<button class="flex items-center justify-center border p-2 w-30 rounded" on:click={goAcc}
				>Pārvaldīt kontu</button
			>
			<button
				class="flex items-center justify-center border p-1 w-20 rounded"
				on:click={authHandlers.logout}>Iziet</button
			>
		</div>
	</div>
</main>
