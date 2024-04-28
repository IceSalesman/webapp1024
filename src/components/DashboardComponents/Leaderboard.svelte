<script lang="ts">
	import { userStore, practiceId, sortBy } from '../../stores/stores';
	import { db } from '../../lib/firebase/firebase.client';
	import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';

	let playerData: any = [];

	let user;
	let pId;

	userStore.subscribe((value) => {
		user = value;
	});
	practiceId.subscribe((value) => {
		pId = value;
	});

	onMount(async () => {
		const savedSortBy = localStorage.getItem('sortBy');
		if (savedSortBy) {
			sortBy.set(savedSortBy);
			localStorage.setItem('sortBy', savedSortBy);
		}
		const playerCollectionRef = collection(db, 'players');
		const playerSnapshots = await getDocs(playerCollectionRef);

		playerData = playerSnapshots.docs.map((doc) => doc.data());

		loadLeaderboard();
	});

	let sortedPlayerData: any[] = [];

	async function loadLeaderboard() {
		const excludedNames = ['big bazongas', 'ahaha', 'huge bazongas'];
		sortedPlayerData = [...playerData]
			.filter((player) => !excludedNames.includes(player.displayName))

			.sort((a, b) => sortPlayers(a, b) || 0);
	}

	$: {
		if ($sortBy) {
			loadLeaderboard();
		}
	}

	function sortPlayers(
		a: { playerElo: number; losses: number; wins: number; goldPoints: number },
		b: { playerElo: number; losses: number; wins: number; goldPoints: number }
	) {
		if ($sortBy === 'elo') {
			return b.playerElo - a.playerElo;
		} else if ($sortBy === 'wl') {
			let aRatio = a.losses === 0 ? a.wins : a.wins / (a.losses + a.wins);
			let bRatio = b.losses === 0 ? b.wins : b.wins / (b.losses + b.wins);
			return bRatio - aRatio;
		} else if ($sortBy === 'w') {
			return b.wins - a.wins;
		} else if ($sortBy === 'l') {
			return b.losses - a.losses;
		} else if ($sortBy === 'gp') {
			return b.goldPoints - a.goldPoints;
		}
	}

	function getWL(player: { wins: number; losses: number }) {
		if (player.wins === 0) {
			return 0;
		} else {
			const wl = ((player.wins / (player.wins + player.losses)) * 100).toFixed(1);
			return wl;
		}
	}
	async function addRatingToPlayersWithGoldPoints() {
		const playersRef = collection(db, 'players');
		const playersSnapshot = await getDocs(playersRef);

		let batch = writeBatch(db);

		playersSnapshot.docs.forEach((playerDoc) => {
			const playerData = playerDoc.data();
			if (playerData.goldPoints > 0) {
				const playerRef = doc(db, 'players', playerDoc.id);
				const updatedRating = (playerData.playerElo || 0) + 100;
				batch.update(playerRef, { playerElo: updatedRating });
			}
		});

		await batch.commit();
	}
</script>

<div class="flex flex-col items-center justify-center overflow-auto">
	<h1 class="text-2xl text-center font-bold">
		{#if $sortBy === 'elo'}Reitinga
		{:else if $sortBy === 'wl'}Uzvaras procentu
		{:else if $sortBy === 'w'}Uzvaru
		{:else if $sortBy === 'l'}Zaudējumu
		{:else if $sortBy === 'gp'}Zelta Punktu
		{/if}
		Līderi
	</h1>
	<div class="overflow-auto">
		<table class="m-2 flex-shrink-0">
			<thead class="border-b">
				<tr class="text-center">
					<th scope="col" class="text-sm font-medium text-gray-100 text-center px-6 py-4 text-left"
						>#</th
					>
					<th scope="col" class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left"
						>Vārds</th
					>
					<th scope="col" class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left">
						<button class={$sortBy === 'w' ? 'font-bold' : ''} on:click={() => ($sortBy = 'w')}>
							W
						</button>
					</th>
					<th scope="col" class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left">
						<button class={$sortBy === 'l' ? 'font-bold' : ''} on:click={() => ($sortBy = 'l')}>
							L</button
						></th
					>
					<th
						scope="col"
						class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left"
						on:click={() => ($sortBy = 'wl')}
						><button class={$sortBy === 'wl' ? 'font-bold' : ''} on:click={() => ($sortBy = 'wl')}
							>W%</button
						>
					</th>
					<th scope="col" class="text-sm font-medium text-center text-gray-100 px-6 py-4 text-left"
						><button class={$sortBy === 'elo' ? 'font-bold' : ''} on:click={() => ($sortBy = 'elo')}
							>Reitings</button
						>
					</th>
					<th scope="col" class="text-sm font-medium text-center golden-name px-6 py-4 text-left"
						><button class={$sortBy === 'gp' ? 'font-bold' : ''} on:click={() => ($sortBy = 'gp')}
							>ZP</button
						>
					</th>
				</tr></thead
			>
			<tbody>
				{#if Array.isArray(playerData)}
					{#each sortedPlayerData as player, i (player.displayName)}
						<tr class="border-b text-center">
							<td
								>{#if i === 0}
									1
								{:else if i === 1}
									2
								{:else if i === 2}
									3
								{:else}
									{i + 1}
								{/if}</td
							>
							<td
								class="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap {player.goldPoints >
								0
									? 'golden-name'
									: ''}">{player.displayName}</td
							>
							<td>{player.wins}</td>
							<td>{player.losses}</td>
							<td>{getWL(player)}%</td>
							<td>{player.playerElo.toFixed(0)}</td>
							<td>{player.goldPoints}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	tr:nth-child(even) {
		background-color: #1a202c;
	}
	@media (max-width: 640px) {
		h1 {
			font-size: 1.5rem;
		}

		table {
			font-size: 0.8rem;
		}

		th,
		td {
			padding: 0.5rem;
		}
	}
	.golden-name {
		color: gold;
	}
</style>
