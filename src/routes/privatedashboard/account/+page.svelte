<script>
    import { authHandlers, authStore } from '../../../stores/authStore';
    import { auth, db } from "$lib/firebase/firebase.client";

    

    import { onMount } from 'svelte';
    import {
		collection,
		doc,
		setDoc,
		updateDoc,
		arrayUnion,
		getDoc,
		arrayRemove
	} from 'firebase/firestore';

    function refreshPage() {
		window.location.reload();
	}

    // @ts-ignore
	/**
	 * @type {any}
	 */
	let email;
	// @ts-ignore
	/**
	 * @type {any}
	 */
	let displayName;

	/**
	 * @type {any}
	 */
	let isverified;

    let attendees = [];
	authStore.subscribe((curr) => {
		console.log('CURR', curr);
		// @ts-ignore
        displayName = curr?.currentUser?.displayName;
        // @ts-ignore
        email = curr?.currentUser?.email;
		// @ts-ignore
        isverified = curr?.currentUser?.emailVerified;
	});

    /**
     * @type {string}
     */
    let newDisplayName = '';

    async function handleSubmit() {
        alert('Tu esi perfekta tāda kā esi, nevajag mainīt neko <3');
        //await authHandlers.updateProfile(newDisplayName);

        //refreshPage();
        

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
    


</script>




<main class="flex flex-col items-center justify-center h-screen text-gray-100 bg-gray-800">
    
    <div class="flex flex-col bg-gray-900 p-10 rounded justify-center">
        
        <div class="mb-4  flex flex-col items-center justify-center">
            <p class="font-bold">Vārds:</p>
            <p>{displayName}</p>
        </div>
        <div class="mb-4 flex flex-col items-center justify-center">
            <p class="font-bold">E-pasts:</p>
            <p>{email}</p>
        </div>
        <form on:submit={handleSubmit}>
            <div class="mb-4">
                <p class="font-bold flex justify-center">Mainīt vārdu:</p>
                <input type="text" bind:value={newDisplayName} class="w-full p-2 border rounded bg-gray-800 border-gray-700"/>
            </div>
            <div class="flex items-center justify-center">
                <button type="submit" class="flex justify-center bg-violet-300 hover:bg-violet-500 text-black font-bold py-2 px-4 rounded text-black">
                    Mainīt vārdu
                </button>
            </div>
            <div class="flex items-center justify-center p-3">
                <button>
                    <a href="/privatedashboard" class="flex justify-center bg-violet-300 hover:bg-violet-500 text-black font-bold py-2 px-4 rounded text-black">
                        Atpakaļ
                    </a>
                </button>
                
            </div>
        
        </form>
    </div>
</main>
