const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
const cors = require('cors');
const express = require('express');
require('dotenv').config();

admin.initializeApp();

const bigqueryConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT
};

if (process.env.NODE_ENV !== 'production') {
    bigqueryConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const bigquery = new BigQuery(bigqueryConfig);
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Test connection route
app.post('/testConnection', (req, res) => {
    res.status(200).send({
        message: 'Connection successful!',
        timestamp: new Date().toISOString(),
        userId: req.auth?.uid || 'not authenticated'
    });
});

// Create new song route
app.post('/createNewSong', (req, res) => {
    // Log the request
    console.log('CreateNewSong function called', {
        auth: req.auth,
        data: req.body
    });

    if (!req.auth) {
        return res.status(401).send('Must be logged in to create songs');
    }

    if (!req.body.title) {
        return res.status(400).send('Title is required');
    }

    try {
        const row = {
            id: require('uuid').v4(),
            title: req.body.title,
            created_by: req.auth.uid,
            created_at: new Date().toISOString()
        };

        // For testing, just return success
        res.status(200).send({ 
            success: true, 
            message: 'Song created successfully!',
            songId: row.id
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to create song: ' + error.message);
    }
});

// Submit occurrences route
app.post('/submitOccurrences', (req, res) => {
    const rows = req.body.rows;
    if (!rows || !Array.isArray(rows)) {
        return res.status(400).send({ message: "Invalid rows data" });
    }

    try {
        // Your logic to handle occurrences goes here
        res.status(200).send({ message: 'Occurrences submitted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to submit occurrences: ' + error.message);
    }
});

exports.api = functions.https.onRequest(app);