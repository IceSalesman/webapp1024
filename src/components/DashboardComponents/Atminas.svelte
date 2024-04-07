<script lang="ts">
	import { storage } from '$lib/firebase/firebase.client';
	import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

	// @ts-ignore
	let file;
    let uploadProgress = 0;
    let downloadUrl = '';

	const MAX_FILE_SIZE = 10485760; // 10MB


	// @ts-ignore

	function handleFileChange(event) {
		file = event.target.files[0];
		if (file.size > MAX_FILE_SIZE) {
			alert('Fails ir pārāk liels, limits ir 10MB');
			file = null;
		}
	}

	function uploadFile() {
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
</script>

<main class="bg-gray-800 text-gray-100 flex flex-col justify-center items-center h-screen">
    PAŠLAIK NESTRĀDĀ, VARAT MĒGINĀT, BET NEKAS NENOTIKS. 
	<input type="file" on:change={handleFileChange} />
	<button on:click={uploadFile}>Upload</button>
</main>
