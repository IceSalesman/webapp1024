<script>
	import { onMount } from 'svelte';
	// @ts-ignore
	import { onAuthStateChanged } from '@firebase/auth';
	// @ts-ignore
	import { db, auth } from '$lib/firebase/firebase.client';
	import {
		collection,
		doc,
		setDoc,
		updateDoc,
		// @ts-ignore
		// @ts-ignore
		arrayUnion,
		getDoc,
		// @ts-ignore
		// @ts-ignore
		arrayRemove
	} from 'firebase/firestore';
	import { authStore } from '../../stores/authStore';

	/**
	 * @type {string | undefined}
	 */
	let email;
	let displayName;
	let isverified;
	let uid;
	/**
	 * @type {never[]}
	 */
	let attendees = [];

	let playerWins;

	authStore.subscribe(async (curr) => {
		// @ts-ignore
		email = curr?.currentUser?.email;
		// @ts-ignore
		displayName = curr?.currentUser?.displayName;
		// @ts-ignore
		isverified = curr?.currentUser?.emailVerified;
		// @ts-ignore
		uid = curr?.currentUser?.uid;
	});

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

	onMount(async () => {
		const playerRef = doc(collection(db, 'players'), email);
		console.log(playerRef);
		const playerSnap = await getDoc(playerRef);

		if (playerSnap.exists()) {
			playerWins = playerSnap.data().wins;
		}

		const practiceRef = doc(collection(db, 'practices'), practiceId);
		const practiceSnap = await getDoc(practiceRef);

		if (practiceSnap.exists()) {
			console.log('Document found');
			attendees = practiceSnap.data().attendees;
		}
		teamMaker();
	});

	/**
	 * @type {any[]}
	 */
	let teams = [];
	async function teamMaker() {
		const teamCount = attendees.length <= 14 ? 2 : 3;

		const shuffledAttendees = [...attendees];

		for (let i = shuffledAttendees.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledAttendees[i], shuffledAttendees[j]] = [shuffledAttendees[j], shuffledAttendees[i]];
		}

		const newTeams = [];
		const playersPerTeam = Math.ceil(attendees.length / teamCount);

		for (let i = 0; i < teamCount; i++) {
			const team = shuffledAttendees.slice(i * playersPerTeam, (i + 1) * playersPerTeam);
			const teamWithWins = await Promise.all(
				team.map(async (player) => {
					// @ts-ignore
					const playerDoc = await getDoc(doc(db, 'players', player.email));
					const playerData = playerDoc.data();
					return {
						// @ts-ignore
						...player,
						wins: playerData ? playerData.wins : 0
					};
				})
			);
			newTeams.push(teamWithWins);
		}

		console.log(newTeams);
		teams = newTeams;
	}
	async function addWinToTeam1() {
		if (teams[0]) {
            // @ts-ignore
			teams[0] = await Promise.all(teams[0].map(async (player) => {
				const playerDocRef = doc(db, 'players', player.email);
				const playerDoc = await getDoc(playerDocRef);
				const playerData = playerDoc.data();
				const updatedWins = playerData ? playerData.wins + 1 : 1;
				if (playerDoc.exists()) {
					await updateDoc(playerDocRef, { wins: updatedWins });
				} else {
					await setDoc(playerDocRef, { wins: updatedWins });
				}
				return { ...player, wins: updatedWins };
			}));
		}
	}

	async function addWinToTeam2() {
		if (teams[1]) {
			
			// @ts-ignore
			teams[1] = await Promise.all(teams[1].map(async (player) => {
				const playerDocRef = doc(db, 'players', player.email);
				const playerDoc = await getDoc(playerDocRef);
				const playerData = playerDoc.data();
				const updatedWins = playerData ? playerData.wins + 1 : 1;
				if (playerDoc.exists()) {
					await updateDoc(playerDocRef, { wins: updatedWins });
				} else {
					await setDoc(playerDocRef, { wins: updatedWins });
				}
				return { ...player, wins: updatedWins };
			}));
		}
	}
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
	class="bg-gray-800 text-gray-100 flex flex-row justify-center items-center h-full p-4 pt-20"
	style="height: calc(100vh - 5rem);"
>
	<div class="flex flex-row flex-wrap justify-center">
		<div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="py-2 inline-block min-w-full sm:px-6 lg:px-8">
				<div class="flex items-center justify-center">
					<button
						class="block p-3 text-center rounded-sm text-gray-900 bg-violet-300"
						on:click={teamMaker}>Izveidot Komandas</button
					>
				</div>
				<div class="overflow-hidden flex flex-row flex-wrap justify-center items-start">
					{#each teams as team, i (i)}
						<div class="flex flex-col items-center">
							<div>
								<table class="m-2 flex-shrink-0">
									<thead class="border-b">
										<tr>
											<th scope="col" class="text-sm font-medium text-gray-100 px-6 py-4 text-left"
												>#</th
											>
											<th scope="col" class="text-sm font-medium text-gray-100 px-6 py-4 text-left"
												>Vārds</th
											>
											<th scope="col" class="text-sm font-medium text-gray-100 px-6 py-4 text-left"
												>Uzvaras</th
											>
										</tr>
									</thead>
									<tbody>
										{#each team as player, i (player.email)}
											<tr class="border-b text-center">
												<td>{i + 1}</td>
												<td class="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap"
													>{player.displayName}</td
												>
												<td>{player.wins}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
							{#if i === 0}
								<button
									class="block p-3 text-center rounded-sm text-gray-900 bg-violet-300"
									on:click={addWinToTeam1}>Pievienot uzvaru</button
								>
							{/if}
							{#if i === 1}
								<button
									class="block p-3 text-center rounded-sm text-gray-900 bg-violet-300"
									on:click={addWinToTeam2}>Pievienot uzvaru</button
								>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</main>
