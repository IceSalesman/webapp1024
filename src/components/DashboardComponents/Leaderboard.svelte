<script lang="ts">
	import { userStore, practiceId } from '../../stores/stores';
	import { db } from '../../lib/firebase/firebase.client';
	import { collection, getDocs } from 'firebase/firestore';
	import { onMount } from 'svelte';
	import { sortBy } from '../../stores/stores';

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
		a: { playerElo: number; losses: number; wins: number },
		b: { playerElo: number; losses: number; wins: number }
	) {
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
