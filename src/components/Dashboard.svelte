<script lang="ts">
	import { authStore, authHandlers } from '../stores/authStore';
	import { dayDict, monthDict } from '../stores/dictStore';
	import { db } from '../lib/firebase/firebase.client';
	// @ts-ignore
	import Volejbols from './DashboardComponents/Volejbols.svelte';
	import Konts from './DashboardComponents/Konts.svelte';
	import Atminas from './DashboardComponents/Atminas.svelte';
	import Kontakti from './DashboardComponents/Kontakti.svelte';
	// @ts-ignore
	import Komanda from './DashboardComponents/Komanda.svelte';

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
	let uid: any;
	let attendees: any[] = [];
	let players: any[] = [];
	let isAdmin = false;

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

	/**
	 * Tehniski labāk būtu pārtaisīt tā, ka viņs nevis taisa docu ar cilvēkiem, kas nāk,
	 * bet labāk ka vins edito docu ar useriem (takā 'comingNextPractice = true/false')
	 * un tad displajot tikai tos, kas ir true, kā arī, lai automatiski katru nedēlu parmaina uz false
	 * Man liekas, ka sita vins nepistos nomainot vārdu, jo mes varetu vienk user doca nomainit. Paldies par uzmanību
	 *
	 *
	 * nvm es esmu genijs
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

	export const practiceId = getNextSaturday();

	/**
	 * ok man paradijas ideja. mes varetu useru atrast pec email saraksta un tad nomainit displayName vertibu, bet es negribu
	 * to darit.
	 *
	 * velu veiksmi
	 *
	 * te ari
	 */

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

		const playerRef = doc(collection(db, 'players'), email);
		const playerSnap = await getDoc(playerRef);

		if (playerSnap.exists()) {
			console.log('Document found');
			players = playerSnap.data().wins;
		} else {
			console.log('No such document, creating new one');
			await setDoc(playerRef, {
				wins: 0
			});
		}

		document.title = 'Volejbols';
	});

	let activeTab = 'Volejbols';

	function setActiveTab(tab: string) {
		activeTab = tab;
		document.title = tab;
	}

	let isNavOpen = false;

	function toggleNav() {
		isNavOpen = !isNavOpen;
	}

	/*
	 * TODO: safiksot tabus lai vini paliek zili kad ir selectoti :D!
	 */
</script>

<nav class="bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 border-gray-600">
	<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
		<a href="/privatedashboard" class="flex items-center space-x-3 rtl:space-x-reverse">
			<img src="https://www.svgrepo.com/show/15181/volleyball.svg" class="h-8" alt="Logo" />
			<span class="self-center text-2xl font-semibold whitespace-nowrap text-white">Volejbols</span>
		</a>
		<div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
			<button
				on:click={authHandlers.logout}
				type="button"
				class="text-white w-20 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
				>Iziet</button
			>
			<button
				data-collapse-toggle="navbar-sticky"
				type="button"
				class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
				aria-controls="navbar-sticky"
				aria-expanded={isNavOpen}
				on:click={toggleNav}
			>
				<span class="sr-only">Open main menu</span>
				<svg
					class="w-5 h-5"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 17 14"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M1 1h15M1 7h15M1 13h15"
					/>
				</svg>
			</button>
		</div>
		<div
			class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
			id="navbar-sticky"
			class:hidden={!isNavOpen}
		>
			<ul
				class="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 bg-gray-800 md:bg-gray-900 border-gray-700"
			>
				<li>
					<!-- svelte-ignore a11y-invalid-attribute -->
					<a
						on:click={() => setActiveTab('Volejbols')}
						on:click={toggleNav}
						href=""
						class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:hover:text-blue-500 text-white hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700"
						aria-current="page">Volejbols</a
					>

					<!-- svelte-ignore a11y-invalid-attribute -->
				</li>
				{#if isAdmin}
					<li>
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a
							on:click={() => setActiveTab('Komandas')}
							on:click={toggleNav}
							href=""
							class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:hover:text-blue-500 text-white hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700"
							aria-current="page">Komandas</a
						>
					</li>
				{/if}
				<li>
					<!-- svelte-ignore a11y-invalid-attribute -->
					<a
						on:click={() => setActiveTab('Atminas')}
						on:click={toggleNav}
						href=""
						class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:hover:text-blue-500 text-white hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700"
						>Atmiņas</a
					>
				</li>
				<li>
					<!-- svelte-ignore a11y-invalid-attribute -->
					<a
						on:click={() => setActiveTab('Konts')}
						on:click={toggleNav}
						href=""
						class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:hover:text-blue-500 text-white hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700"
						>Konts</a
					>
				</li>
				<li>
					<!-- svelte-ignore a11y-invalid-attribute -->
					<a
						on:click={() => setActiveTab('Kontakti')}
						on:click={toggleNav}
						href=""
						class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:hover:text-blue-500 text-white hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700"
						>Kontakti</a
					>
				</li>
			</ul>
		</div>
	</div>
</nav>

{#if activeTab === 'Volejbols'}
	<div class="">
		<Volejbols />
	</div>
{/if}
{#if isAdmin}
	{#if activeTab === 'Komandas'}
		<div class="">
			<Komanda />
		</div>
	{/if}
{/if}
{#if activeTab === 'Konts'}
	<div class="">
		<Konts />
	</div>
{/if}

{#if activeTab === 'Atminas'}
	<div class="">
		<Atminas />
	</div>
{/if}

{#if activeTab === 'Kontakti'}
	<div class="">
		<Kontakti />
	</div>
{/if}
