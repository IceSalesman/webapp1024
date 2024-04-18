import { writable } from "svelte/store";




export const userStore = writable({
    displayName: String,
    email: String,
    isverified: false,
    uid: String,
    isAdmin: false
})





export const sortBy = writable('elo');





function getNextSaturday() {
    const now = new Date();
    const nextSaturday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + (7 - now.getDay() || 7)
    );
    return nextSaturday.toISOString().split('T')[0];
}

export const practiceId = writable(getNextSaturday());

