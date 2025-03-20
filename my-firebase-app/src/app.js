import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, connectAuthEmulator, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'us-central1');

// Connect to emulators in development
if (window.location.hostname === 'localhost') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    console.log('Connected to Firebase emulators');

    // Create test user with better error handling
    const createTestUser = async () => {
        const testEmail = 'test@example.com';
        const testPassword = 'password123';
        
        try {
            // First try to sign in
            try {
                const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
                console.log('Signed in as existing test user:', userCredential.user.email);
            } catch (signInError) {
                // If sign in fails, try to create the user
                if (signInError.code === 'auth/user-not-found') {
                    const newUserCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
                    console.log('Created new test user:', newUserCredential.user.email);
                } else {
                    console.error('Sign in error:', signInError);
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
        }
    };

    createTestUser();
}

// Test the connection using fetch with proper CORS headers
const testEmulatorConnection = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5001/music-form-4cfd6/us-central1/testConnection', {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Function emulator test result:', data);
    } catch (error) {
        console.error('Function emulator test error:', error);
    }
};

// Test the connection immediately
testEmulatorConnection();

// Create song function using fetch with proper CORS headers
const createSong = async (title) => {
    try {
        const response = await fetch('http://127.0.0.1:5001/music-form-4cfd6/us-central1/createNewSong', {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ title })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Create song result:', data);
        return data;
    } catch (error) {
        console.error('Error creating song:', error);
        throw error;
    }
};

// Add event listener for song creation
document.getElementById('createSongButton')?.addEventListener('click', async () => {
    const titleInput = document.getElementById('new-song-title');
    const messageDiv = document.getElementById('create-song-message');
    
    if (!titleInput || !titleInput.value) {
        if (messageDiv) messageDiv.innerText = 'Please enter a song title';
        return;
    }

    try {
        const result = await createSong(titleInput.value);
        if (messageDiv) messageDiv.innerText = result.message;
        titleInput.value = ''; // Clear input on success
    } catch (error) {
        if (messageDiv) messageDiv.innerText = `Error: ${error.message}`;
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