<script>
	import { onMount } from 'svelte';
	// @ts-ignore
	import { onAuthStateChanged } from '@firebase/auth';
	// @ts-ignore
	import { db, auth } from '$lib/firebase/firebase.client';
	import { collection, doc, setDoc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
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
		const practiceRef = doc(collection(db, 'practices'), practiceId);
		const practiceSnap = await getDoc(practiceRef);

		if (practiceSnap.exists()) {
			console.log('Document found');
			attendees = practiceSnap.data().attendees;
			console.log(attendees);
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
						wins: playerData ? playerData.wins : 0,
						losses: playerData ? playerData.losses : 0,
						playerElo: playerData ? playerData.playerElo : 1200
					};
				})
			);
			newTeams.push(teamWithWins);
		}

		console.log(newTeams);
		teams = newTeams;

		const avgEloRatings = calculateAvgElo();
		console.log(avgEloRatings);
	}
	/**
	 * @param {number} winningTeamIndex
	 */
	async function updateWinsAndLosses(winningTeamIndex) {
		const losingTeamIndex = winningTeamIndex === 0 ? 1 : 0;

		if (teams[winningTeamIndex]) {
			teams[winningTeamIndex] = await Promise.all(
				// @ts-ignore
				teams[winningTeamIndex].map(async (player) => {
					const playerDocRef = doc(db, 'players', player.email);
					const playerDoc = await getDoc(playerDocRef);
					const playerData = playerDoc.data();
					const currentWins = playerData && playerData.wins ? playerData.wins : 0;
					const updatedWins = currentWins + 1;
					// @ts-ignore

					if (playerDoc.exists()) {
						// @ts-ignore
						await updateDoc(playerDocRef, { wins: updatedWins }, { merge: true });
					} else {
						await setDoc(playerDocRef, { wins: updatedWins }, { merge: true });
					}
					return { ...player, wins: updatedWins };
				})
			);
		}

		if (teams[losingTeamIndex]) {
			teams[losingTeamIndex] = await Promise.all(
				// @ts-ignore
				teams[losingTeamIndex].map(async (player) => {
					const playerDocRef = doc(db, 'players', player.email);
					const playerDoc = await getDoc(playerDocRef);
					const playerData = playerDoc.data();
					const currentLosses = playerData && playerData.losses ? playerData.losses : 0;
					const updatedLosses = currentLosses + 1;
					if (playerDoc.exists()) {
						// @ts-ignore
						await updateDoc(playerDocRef, { losses: updatedLosses }, { merge: true });
					} else {
						await setDoc(playerDocRef, { losses: updatedLosses }, { merge: true });
					}
					return { ...player, losses: updatedLosses };
				})
			);
		}
		await calculateEloGain(winningTeamIndex);
	}

	async function calculateAvgElo() {
		return teams.map((team) => {
			// @ts-ignore
			const totalElo = team.reduce((sum, player) => sum + player.playerElo, 0);
			return totalElo / team.length;
		});
	}

	// @ts-ignore
	async function removePlayer(playerEmail) {
		// @ts-ignore
		const index = attendees.findIndex((player) => player.email === playerEmail);
		if (index !== -1) {
			attendees.splice(index, 1);
			
			await teamMaker();

			
			const practiceRef = doc(collection(db, 'practices'), practiceId);
			await updateDoc(practiceRef, { attendees });
		}
	}
	// @ts-ignore
	async function calculateEloGain(winningTeamIndex) {
		const losingTeamIndex = winningTeamIndex === 0 ? 1 : 0;
		const avgEloRatings = await calculateAvgElo();
		const K = 32; 
		
		teams[winningTeamIndex] = await Promise.all(
			// @ts-ignore
			teams[winningTeamIndex].map(async (player) => {
				const expectedScore =
					1 / (1 + Math.pow(10, (avgEloRatings[losingTeamIndex] - player.playerElo) / 400));
				const newElo = player.playerElo + K * (1 - expectedScore);

				
				const playerDocRef = doc(db, 'players', player.email);
				// @ts-ignore
				await updateDoc(playerDocRef, { playerElo: newElo }, { merge: true });

				return { ...player, playerElo: newElo };
			})
		);

	
		teams[losingTeamIndex] = await Promise.all(
			// @ts-ignore
			teams[losingTeamIndex].map(async (player) => {
				const expectedScore =
					1 / (1 + Math.pow(10, (avgEloRatings[winningTeamIndex] - player.playerElo) / 400));
				const newElo = player.playerElo + K * (0 - expectedScore);

				
				const playerDocRef = doc(db, 'players', player.email);
				// @ts-ignore
				await updateDoc(playerDocRef, { playerElo: newElo }, { merge: true });

				return { ...player, playerElo: newElo };
			})
		);
	}

	// sitas sliktākajā gadījuma, ja visa elo sistēma nobrūk :D
	async function resetElo() {
		const playersCollectionRef = collection(db, 'players');
		const playersSnapshot = await getDocs(playersCollectionRef);

		playersSnapshot.forEach(async (playerDoc) => {
			const playerDocRef = doc(db, 'players', playerDoc.id);
			await updateDoc(playerDocRef, { playerElo: 1200 });
		});
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
	class="bg-gray-800 text-gray-100 flex flex-row justify-center items-center h-full p-4 pt-20 sm:pt-32"
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
												>W</th
											>
											<th scope="col" class="text-sm font-medium text-gray-100 px-6 py-4 text-left"
												>L</th
											>
											<th scope="col" class="text-sm font-medium text-gray-100 px-6 py-4 text-left"
												>Reitings</th
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
												<td>{player.losses}</td>

												<td>{player.playerElo}</td>
												<td>
													<button
														class="block p-3 text-center rounded-sm text-gray-900 bg-violet-300"
														on:click={() => removePlayer(player.email)}>Remove</button
													>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
							{#if i === 0}
								<button
									class="block p-3 text-center rounded-sm text-gray-900 bg-violet-300"
									on:click={() => updateWinsAndLosses(0)}>Pievienot uzvaru 1. komandai</button
								>
							{/if}
							{#if i === 1}
								<button
									class="block p-3 text-center rounded-sm text-gray-900 bg-violet-300"
									on:click={() => updateWinsAndLosses(1)}>Pievienot uzvaru 2. komandai</button
								>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</main>
