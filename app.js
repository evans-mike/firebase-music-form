// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyAI3ubU7Cy0kZdqpTHlD7OM6dLdDJGjymk",
    authDomain: "music-form-4cfd6.firebaseapp.com",
    projectId: "music-form-4cfd6",
    storageBucket: "music-form-4cfd6.firebasestorage.app",
    messagingSenderId: "331873655169",
    appId: "1:331873655169:web:d3e4c7ebb042daa1573080"
  };

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

// Rest of your app.js code modified to use modern Firebase SDK
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            document.getElementById('login-message').innerText = "Login successful!";
            document.getElementById('login-section').style.display = "none";
            document.getElementById('app-section').style.display = "block";
        })
        .catch((error) => {
            document.getElementById('login-message').innerText = `Error: ${error.message}`;
        });
}

function createNewSong() {
    const title = document.getElementById('new-song-title').value;
    const createSong = firebase.functions().httpsCallable('createNewSong');

    createSong({ title: title })
        .then((result) => {
            document.getElementById('create-song-message').innerText = result.data.message;
        })
        .catch((error) => {
            document.getElementById('create-song-message').innerText = `Error: ${error.message}`;
        });
}

function addOccurrenceRow() {
    const form = document.getElementById('occurrences-form');
    const row = document.createElement('div');

    row.innerHTML = `
        <input type="text" name="date" placeholder="Date (MM/DD/YYYY)">
        <input type="text" name="title" placeholder="Title">
        <input type="checkbox" name="closer_flag"> Closer
        <select name="service">
            <option value="AM">AM</option>
            <option value="PM">PM</option>
        </select>
    `;
    form.appendChild(row);
}

function submitOccurrences() {
    const form = document.getElementById('occurrences-form');
    const rows = [];
    form.querySelectorAll('div').forEach(row => {
        const date = row.querySelector('input[name="date"]').value;
        const title = row.querySelector('input[name="title"]').value;
        const closer_flag = row.querySelector('input[name="closer_flag"]').checked;
        const service = row.querySelector('select[name="service"]').value;

        rows.push({ date, title, closer_flag, service });
    });

    const submitOccurrences = firebase.functions().httpsCallable('submitOccurrences');

    submitOccurrences({ rows: rows })
        .then((result) => {
            document.getElementById('submit-occurrences-message').innerText = result.data.message;
        })
        .catch((error) => {
            document.getElementById('submit-occurrences-message').innerText = `Error: ${error.message}`;
        });
}