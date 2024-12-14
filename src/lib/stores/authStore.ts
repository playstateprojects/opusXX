import { writable, get } from 'svelte/store';
import type { Auth, User } from 'firebase/auth';
import {
	getAuth,
	onAuthStateChanged,
	signOut,
	updateProfile,
	browserLocalPersistence,
	setPersistence
} from 'firebase/auth';
import { type FirebaseApp } from 'firebase/app';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

const user = writable<User | null>(null);
const idToken = writable<string | null>(null);

let firebaseUser: User | null;
let firebaseApp: FirebaseApp;
let auth: Auth;

if (browser) {
	import('firebase/app')
		.then((firebase) => {
			// console.log('Firebase module loaded');
			// addTask('id_token');
			const firebaseConfig = {
				apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
				authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
				projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
			};
			if (!firebase.getApps().length) {
				// console.log('Initializing Firebase app');
				firebaseApp = firebase.initializeApp(firebaseConfig);
				auth = getAuth();
				setPersistence(auth, browserLocalPersistence)
					.then(() => {
						onAuthStateChanged(auth, async (fbUser) => {
							//   console.log('Auth state changed', fbUser ? 'User logged in' : 'No user');
							try {
								if (fbUser) {
									//   console.log('Setting user in store');
									user.set(fbUser);
									firebaseUser = fbUser;
									//   console.log('Requesting ID token');
									const token = await fbUser.getIdToken(true); // Force token refresh
									//   console.log('ID token received');
									idToken.set(token);
								} else {
									// console.log('Clearing user and token');
									user.set(null);
									idToken.set(null);
								}
							} catch (error) {
								console.error('Error in auth state change:', error);
								user.set(null);
								idToken.set(null);
							}
						});
					})
					.catch((error: Error) => {
						console.error('Error setting persistence:', error);
					});
			}
		})
		.catch((error) => {
			console.error('Error initializing Firebase:', error);
		});
} else {
	console.log('Non-browser environment detected, skipping Firebase initialization');
}

const logout = async () => {
	try {
		await signOut(auth);
		user.set(null);
		idToken.set(null);
		console.log('User logged out successfully');
		goto('/');
	} catch (error) {
		console.error('Logout Error:', error);
	}
};

const updateDisplayName = async (displayName: string) => {
	if (!firebaseUser) return;
	try {
		await updateProfile(firebaseUser, { displayName });
		user.set(firebaseUser);
	} catch (error) {
		console.error('Error updating display name:', error);
	}
};

const updatePhotoURL = async (imageUrl: string) => {
	if (!firebaseUser) return;
	try {
		await updateProfile(firebaseUser, { photoURL: imageUrl });
		user.set(firebaseUser);
	} catch (error) {
		console.error('Error updating photo URL:', error);
	}
};

function waitForUser(): Promise<User | null> {
	return new Promise((resolve) => {
		const currentUser = get(user);
		if (currentUser !== null) {
			resolve(currentUser);
		} else {
			console.log('no user');
			const unsubscribe = user.subscribe((value) => {
				if (value !== null) {
					unsubscribe();
					resolve(value);
				}
			});
		}
	});
}

export { auth, logout, user, idToken, updateDisplayName, updatePhotoURL, waitForUser };
