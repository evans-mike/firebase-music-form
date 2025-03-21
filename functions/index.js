const { https } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
const cors = require('cors')({ origin: true });
require('dotenv').config();

admin.initializeApp();

const bigqueryConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT 
};

if (process.env.NODE_ENV !== 'production') {
    bigqueryConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const bigquery = new BigQuery(bigqueryConfig);

// Test connection endpoint
exports.testConnection = https.onRequest({
    cors: true,
    maxInstances: 10,
}, (req, res) => {
    res.status(200).send({
        message: 'Connection successful!',
        timestamp: new Date().toISOString(),
        userId: req.auth?.uid || 'not authenticated'
    });
});

// Create new song endpoint
exports.createNewSong = https.onCall({
    minInstances: 0,
    maxInstances: 10,
    memory: "256MiB",
    cors: true,
    enforceAppCheck: false,
}, (data, context) => {
    if (!context.auth) {
        throw new Error('Must be logged in to create songs');
    }

    if (!data.title) {
        throw new Error('Title is required');
    }

    try {
        const row = {
            id: require('uuid').v4(),
            title: data.title,
            created_by: context.auth.uid,
            created_at: new Date().toISOString()
        };

        return {
            success: true,
            message: 'Song created successfully!',
            songId: row.id
        };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Submit occurrences endpoint
exports.submitOccurrences = https.onCall({
    minInstances: 0,
    maxInstances: 10,
    memory: "256MiB",
    cors: true,
    enforceAppCheck: false,
}, (data, context) => {
    const rows = data.rows;
    if (!rows || !Array.isArray(rows)) {
        throw new Error('Invalid rows data');
    }

    try {
        // Your logic to handle occurrences goes here
        return { message: 'Occurrences submitted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});