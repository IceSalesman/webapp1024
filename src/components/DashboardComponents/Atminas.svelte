<script lang="ts">
	import { storage } from '$lib/firebase/firebase.client';
	import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
	import { onMount } from 'svelte';

	// @ts-ignore
	let file;
	let uploadProgress = 0;
	let downloadUrl = '';

	let mediaList: any[] = [];
	let videoFileExtensions = [
		'webm',
		'mkv',
		'flv',
		'vob',
		'ogv',
		'ogg',
		'rrc',
		'gifv',
		'mng',
		'mov',
		'avi',
		'qt',
		'wmv',
		'yuv',
		'rm',
		'asf',
		'amv',
		'mp4',
		'm4p',
		'm4v',
		'mpg',
		'mp2',
		'mpeg',
		'mpe',
		'mpv',
		'm4v',
		'svi',
		'3gp',
		'3g2',
		'mxf',
		'roq',
		'nsv',
		'flv',
		'f4v',
		'f4p',
		'f4a',
		'f4b',
		'mod'
	];
	let imageFileExtensions = [
		'.jpg',
		'.jpeg',
		'.png',
		'.gif',
		'.bmp',
		'.ico',
		'.tif',
		'.tiff',
		'.svg',
		'.webp'
	];

	const MAX_FILE_SIZE = 15730140; // 15MB

	// @ts-ignore

	function handleFileChange(event) {
		file = event.target.files[0];
		if (file.size > MAX_FILE_SIZE) {
			alert('Fails ir pārāk liels, limits ir 10MB');
			file = null;
		} else if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
			alert('Tikai bildes un video ir atļautas');
			file = null;
		} else {
			uploadFile();
		}
	}

	async function uploadFile() {
		// @ts-ignore
		if (!file) return;

		//sitas mesls negrib stradat.
		const storageRef = ref(storage, `media/${file.name}`);

		const uploadTask = uploadBytesResumable(storageRef, file);

		uploadTask.on(
			'state_changed',
			(snapshot) => {
				const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				uploadProgress = progress;
			},

			(error) => {
				console.error('Upload failed:', error);
			},

			() => {
				getDownloadURL(uploadTask.snapshot.ref).then((url) => {
					downloadUrl = url;
					console.log('File available at', url);
				});
			}
		);
	}

	let fileInput: HTMLInputElement;
	function triggerFileSelect() {
		fileInput.click();
	}

	onMount(async () => {
		const storageRef = ref(storage, 'media');
		const res = await listAll(storageRef);
		mediaList = await Promise.all(
			res.items.map(async (item) => {
				const url = await getDownloadURL(item);
				return { url };
			})
		);
	});
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
	class="bg-gray-800 text-gray-100 flex flex-col justify-start items-stretch min-h-screen p-4 pt-20"
	style="height: calc(100vh - 5rem);"
>
	<div class="items-center">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{#each mediaList as media}
				{#if imageFileExtensions.some((ext) => media.url.includes(ext))}
					<div>
						<img src={media.url} alt="Uploaded media" class="w-full h-49 object-contain" />
					</div>
				{:else if videoFileExtensions.some((ext) => media.url.includes(ext))}
					<div>
						<!-- svelte-ignore a11y-media-has-caption -->
						<video src={media.url} controls class="w-full h-49 object-contain" />
					</div>
				{/if}
			{/each}
			<input type="file" bind:this={fileInput} on:change={handleFileChange} style="display: none" />

			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div class="flex items-center justify-center">
				<svg
					on:click={triggerFileSelect}
					xmlns="http://www.w3.org/2000/svg"
					height="100px"
					viewBox="0 0 24 24"
					width="100px"
					fill="#000000"
					class="cursor-pointer"
					><path d="M0 0h24v24H0V0z" fill="none" /><path
						d="M21.02 5H19V2.98c0-.54-.44-.98-.98-.98h-.03c-.55 0-.99.44-.99.98V5h-2.01c-.54 0-.98.44-.99.98v.03c0 .55.44.99.99.99H17v2.01c0 .54.44.99.99.98h.03c.54 0 .98-.44.98-.98V7h2.02c.54 0 .98-.44.98-.98v-.04c0-.54-.44-.98-.98-.98zM16 9.01V8h-1.01c-.53 0-1.03-.21-1.41-.58-.37-.38-.58-.88-.58-1.44 0-.36.1-.69.27-.98H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8.28c-.3.17-.64.28-1.02.28-1.09-.01-1.98-.9-1.98-1.99zM15.96 19H6c-.41 0-.65-.47-.4-.8l1.98-2.63c.21-.28.62-.26.82.02L10 18l2.61-3.48c.2-.26.59-.27.79-.01l2.95 3.68c.26.33.03.81-.39.81z"
					/></svg
				>
			</div>

			{#if uploadProgress > 0 && uploadProgress < 100}
				<progress max="100" value={uploadProgress}></progress>
			{:else if uploadProgress === 100}
				<p>Gatavs</p>
			{/if}
		</div>
	</div>
</main>
