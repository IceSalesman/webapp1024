<script lang="ts">
	import { authStore, authHandlers } from '../stores/authStore';
	import { dayDict, monthDict } from '../stores/dictStore';
	import { db } from '../lib/firebase/firebase.client';
	import Volejbols from './DashboardComponents/Volejbols.svelte';
	import Konts from './DashboardComponents/Konts.svelte';
	import Atminas from './DashboardComponents/Atminas.svelte';
	import Kontakti from './DashboardComponents/Kontakti.svelte';
	import Komanda from './DashboardComponents/Komanda.svelte';
	import PendingUsers from './DashboardComponents/PendingUsers.svelte';
	import {
		collection,
		doc,
		setDoc,
		getDoc,
		getDocs,
		query,
		where,
		snapshotEqual
	} from 'firebase/firestore';
	import { onMount } from 'svelte';
	import { userStore, practiceId } from '../stores/stores';

	let attendees: any[];
	let player: any[] = [];
	let admin = false;
	let pId: string;



	let currentUser: { currentUser: any; isLoading?: boolean };

	let user: {
		uid: string;
		email: string;
		displayName: string;
		isAdmin: boolean;
		isverified: boolean;
		accountVerified: boolean;
		goldPoints: any;
	};
	practiceId.subscribe((value) => {
		pId = value;
	});

	authStore.subscribe(async (curr) => {
		currentUser = curr;
		user = currentUser?.currentUser;
	});
	userStore.update(() => {
		return {
			displayName: currentUser?.currentUser?.displayName,
			email: currentUser?.currentUser?.email,
			isverified: currentUser?.currentUser?.emailVerified,
			uid: currentUser?.currentUser?.uid,
			isAdmin: admin,
			accountVerified: false,

			goldPoints: user.goldPoints
		};
	});

	async function findAdmins() {
		const adminRef = doc(collection(db, 'admins'), user.uid);

		const adminDocSnapshot = await getDoc(adminRef);

		if (adminDocSnapshot.exists()) {
			user.isAdmin = true;
		} else {
			user.isAdmin = false;
		}
	}

	async function getGP(player: any[]) {
		if (player[0]?.goldPoints) {
			user.goldPoints = player[0].goldPoints;
		} else {
			user.goldPoints = 0;
		}
	}

	onMount(async () => {
		const practiceRef = doc(collection(db, 'practices'), pId);
		const practiceSnap = await getDoc(practiceRef);

		if (practiceSnap.exists()) {
			attendees = practiceSnap.data().attendees;
		} else {
			await setDoc(practiceRef, {
				attendees: []
			});
		}

		const playerRef = doc(collection(db, 'players'), user.email);
		const playerSnap = await getDoc(playerRef);

		if (playerSnap.exists()) {
			player = playerSnap.data() as any[];
		} else {
			await setDoc(playerRef, {
				displayName: user.displayName,
				wins: 0,
				losses: 0,
				playerElo: 1200,
				winLossRate: 0,
				accountVerified: false,
				goldPoints: 0
			});
		}

		document.title = 'Volejbols';

		findAdmins();

		checkIfPending(user);

		
	});

	async function checkIfPending(user: any) {
		const pendingUsersRef = doc(collection(db, 'pendingUsers'), user.uid);
		const pUSnap = await getDoc(pendingUsersRef);

		if (!user.accountVerified) {
			if (!pUSnap.exists()) {
				await setDoc(pendingUsersRef, {
					displayName: user.displayName,
					email: user.email
				});
			}
		}
	}

	let activeTab = 'Volejbols';

	function setActiveTab(tab: string) {
		activeTab = tab;
		document.title = tab;
	}

	let isNavOpen = false;

	function toggleNav() {
		isNavOpen = !isNavOpen;
	}
</script>

<nav class="bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 border-gray-600">
	<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
		<a href="/privatedashboard" class="flex items-center space-x-3 rtl:space-x-reverse">
			<img src="logo.svg" class="h-10" alt="Logo" />
			<img src="dpvk_light.svg" class="h-8" alt="Dāvja Pirts Volejbola Klubs" />
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
				{#if user.isAdmin}
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
				{#if user.isAdmin}
					<li>
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a
							on:click={() => setActiveTab('PendingUsers')}
							on:click={toggleNav}
							href=""
							class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:hover:text-blue-500 text-white hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700"
							aria-current="page">Pending lietotāji</a
						>
					</li>
				{/if}
			</ul>
		</div>
	</div>
</nav>
<div
	class="bg-gray-800 text-gray-100 flex justify-center items-start min-h-screen p-4 pt-20 flex-wrap"
	style="height: calc(100vh - 5rem);"
>
	{#if activeTab === 'Volejbols'}
		<div class="">
			<Volejbols />
		</div>
	{/if}
	{#if user.isAdmin}
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
	{#if activeTab === 'PendingUsers'}
		<div class="">
			<PendingUsers />
		</div>
	{/if}
</div>
