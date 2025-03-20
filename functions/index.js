const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
require('dotenv').config();

admin.initializeApp();

const bigqueryConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'music-form-4cfd6'
};

if (process.env.NODE_ENV !== 'production') {
    bigqueryConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const bigquery = new BigQuery(bigqueryConfig);

// Test connection endpoint - no auth required
exports.testConnection = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    res.json({
        message: 'Connection successful!',
        timestamp: new Date().toISOString()
    });
});

exports.createNewSong = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    // Log the request
    console.log('CreateNewSong function called', {
        headers: req.headers,
        body: req.body
    });

    const data = req.body;

    if (!data.title) {
        res.status(400).json({
            error: 'Title is required'
        });
        return;
    }

    const row = {
        id: require('uuid').v4(),
        title: data.title,
        created_at: new Date().toISOString()
    };

    // For testing, just return success
    res.json({ 
        success: true, 
        message: 'Song created successfully!',
        songId: row.id
    });
});