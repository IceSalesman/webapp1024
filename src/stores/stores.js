import { writable, derived } from 'svelte/store';

export const userStore = writable({
	displayName: String,
	email: String,
	isverified: false,
	uid: String,
	isAdmin: false
});

export const currentDate = writable(new Date());

export const dateInfo = derived(currentDate, ($currentDate) => {
	const dd = $currentDate.getDate();
	const mm = $currentDate.getMonth();
	let daysTillSaturday = 6 - $currentDate.getDay();
	const saturdayDate = dd + daysTillSaturday;

	if (daysTillSaturday < 0) {
		daysTillSaturday = 6;
	}

	return { mm, daysTillSaturday, saturdayDate };
});

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
