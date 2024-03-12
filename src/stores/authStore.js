
import { auth } from "../lib/firebase/firebase.client";
import { writable } from "svelte/store";
// @ts-ignore
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, updateEmail, updatePassword, sendEmailVerification } from "firebase/auth";

export const authStore = writable({
    isLoading: true,
    currentUser: null,
});

export const authHandlers = {
    // @ts-ignore
    login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    },
    // @ts-ignore
    signup: async (email, password, displayName) => {
        await createUserWithEmailAndPassword(auth, email, password)
            .then((res) => {
                updateProfile(res.user, {
                    displayName: displayName,
                })
                .then(() => {
                    sendEmailVerification(res.user);
                });
            })
            .catch((error) => {
                // Handle error
                console.log("err", error);
            });
    },
    logout: async () => {
        await signOut(auth);
    },
    // @ts-ignore
    resetPassword: async (email) => {
        if (!email) {
            console.log("inHERE");
            return;
        }
        await sendPasswordResetEmail(auth, email);
    },
    // @ts-ignore
    updateEmail: async (email) => {
        authStore.update((curr) => {
            return {
                ...curr,
                currentUser: {
                    // @ts-ignore
                    ...curr.currentUser,
                    email: email,
                },
            };
        });
        // @ts-ignore
        await updateEmail(auth.currentUser, email);
    },
    // @ts-ignore
    updatePassword: async (password) => {
        // @ts-ignore
        await updatePassword(auth.currentUser, password);
    },
};
