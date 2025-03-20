import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, connectAuthEmulator, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

// Connect to emulators in development
if (window.location.hostname === 'localhost') {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Connected to Firebase emulators');

    // Create a test user
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    createUserWithEmailAndPassword(auth, testEmail, testPassword)
        .then((userCredential) => {
            console.log('Test user created:', userCredential.user.email);
        })
        .catch((error) => {
            // If error code is 'auth/email-already-in-use', that's fine - user already exists
            if (error.code !== 'auth/email-already-in-use') {
                console.error('Error creating test user:', error);
            }
        });
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        document.getElementById('login-section').style.display = "none";
        document.getElementById('app-section').style.display = "block";
        document.getElementById('login-message').innerText = "";
    } else {
        // User is signed out
        document.getElementById('login-section').style.display = "block";
        document.getElementById('app-section').style.display = "none";
    }
});

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Login button
    document.getElementById('loginButton').addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('Login successful:', userCredential.user.email);
            })
            .catch((error) => {
                console.error('Login error:', error);
                document.getElementById('login-message').innerText = `Error: ${error.message}`;
            });
    });

    // Create song button
    document.getElementById('createSongButton').addEventListener('click', async () => {
        const title = document.getElementById('new-song-title').value;
        const createNewSongFunction = httpsCallable(functions, 'createNewSong');

        try {
            const result = await createNewSongFunction({ title });
            document.getElementById('create-song-message').innerText = result.data.message;
        } catch (error) {
            document.getElementById('create-song-message').innerText = `Error: ${error.message}`;
        }
    });

    // Add row button
    document.getElementById('addRowButton').addEventListener('click', () => {
        const form = document.getElementById('occurrences-form');
        const row = document.createElement('div');
        row.className = 'occurrence-row';

        row.innerHTML = `
            <input type="date" name="date" required>
            <input type="text" name="title" placeholder="Title" required>
            <label>
                <input type="checkbox" name="closer_flag"> Closer
            </label>
            <select name="service" required>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        `;
        form.appendChild(row);
    });

    // Submit occurrences button
    document.getElementById('submitOccurrencesButton').addEventListener('click', async () => {
        const form = document.getElementById('occurrences-form');
        const rows = Array.from(form.querySelectorAll('.occurrence-row')).map(row => ({
            date: row.querySelector('input[name="date"]').value,
            title: row.querySelector('input[name="title"]').value,
            closer_flag: row.querySelector('input[name="closer_flag"]').checked,
            service: row.querySelector('select[name="service"]').value
        }));

        const submitOccurrencesFunction = httpsCallable(functions, 'submitOccurrences');

        try {
            const result = await submitOccurrencesFunction({ rows });
            document.getElementById('submit-occurrences-message').innerText = result.data.message;
        } catch (error) {
            document.getElementById('submit-occurrences-message').innerText = `Error: ${error.message}`;
        }
    });
});