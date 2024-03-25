<script lang="ts">
	import { authStore, authHandlers } from '../stores/authStore';
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
	import { signOut } from 'firebase/auth';

	let email: any;
	let displayName: any;
	let isverified: any;
	let attendees: any[] = [];

	let time = new Date();

	const dayDict = {
		0: 'rīt (šodien)',
		1: 'rīt (rīt)',
		2: 'rīt (parīt)',
		3: 'rīt (aizparīt)',
		4: 'rīt (aiz-aizparīt)',
		5: 'rīt (aiz-aiz-aizparīt)',
		6: 'rīt (aiz-aiz-aiz-aizparīt)'
	};

	const monthDict = {
		0: 'janvārī',
		1: 'februārī',
		2: 'martā',
		3: 'aprīlī',
		4: 'maijā',
		5: 'jūnijā',
		6: 'jūlijā',
		7: 'augustā',
		8: 'septembrī',
		9: 'oktobrī',
		10: 'novembrī',
		11: 'decembrī'
	};

	$: h = time.getHours();
	$: m = time.getMinutes();
	$: s = time.getSeconds();

	$: dd = time.getDate();
	$: mm = time.getMonth();
	$: yyyy = time.getFullYear();

	$: daysTillSaturday = 6 - time.getDay();
	$: saturdayDate = dd + daysTillSaturday;
	$: {
		if (daysTillSaturday < 0) {
			daysTillSaturday = 6;
		}
	}

	authStore.subscribe((curr) => {
		console.log('CURR', curr);

		email = curr?.currentUser?.email;
		displayName = curr?.currentUser?.displayName;
		isverified = curr?.currentUser?.emailVerified;
	});

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

	const practiceId = getNextSaturday();

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
            console.log('Document found')
			attendees = practiceSnap.data().attendees;
		} else {
			console.log('No such document, creating new one');
            await setDoc(practiceRef, {
                attendees: []
		    });
		}
	});
	//onMount(() => {
	//	const interval = setInterval(() => {
	//		time = new Date();
	//		console.log(time.getMonth());
	//	}, 1000);
    //
	//	return () => {
	//		clearInterval(interval);
	//	};
	//});

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
