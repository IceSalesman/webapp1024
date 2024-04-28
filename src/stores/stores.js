import { writable, derived } from 'svelte/store';

export const userStore = writable({
	displayName: String,
	email: String,
	isverified: false,
	uid: String,
	isAdmin: false,
	accountVerified: false,
	goldPoints: 0
});

export const currentDate = writable(new Date());

export const dateInfo = derived(currentDate, ($currentDate) => {
	const dateCopy = new Date($currentDate.getTime());
	let daysTillSaturday = 6 - $currentDate.getDay();

	if (daysTillSaturday < 0) {
		daysTillSaturday = 6;
	}

	dateCopy.setDate(dateCopy.getDate() + daysTillSaturday);

	const dd = dateCopy.getDate();
	const mm = dateCopy.getMonth();

	return { date: dateCopy, mm, daysTillSaturday, dd };
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
