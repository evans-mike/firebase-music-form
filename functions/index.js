const functions = require('firebase-functions');
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

// Change to callable function
exports.testConnection = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        response.status(200).send({
            message: 'Connection successful!',
            timestamp: new Date().toISOString(),
            userId: request.auth?.uid || 'not authenticated'
        });
    });
});

exports.createNewSong = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        // Log the request
        console.log('CreateNewSong function called', {
            auth: request.auth,
            data: request.body
        });

        if (!request.auth) {
            response.status(401).send('Must be logged in to create songs');
            return;
        }

        if (!request.body.title) {
            response.status(400).send('Title is required');
            return;
        }

        try {
            const row = {
                id: require('uuid').v4(),
                title: request.body.title,
                created_by: request.auth.uid,
                created_at: new Date().toISOString()
            };

            // For testing, just return success
            response.status(200).send({ 
                success: true, 
                message: 'Song created successfully!',
                songId: row.id
            });
        } catch (error) {
            console.error('Error:', error);
            response.status(500).send('Failed to create song: ' + error.message);
        }
    });
});

exports.submitOccurrences = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        const rows = request.body.rows;
        if (!rows || !Array.isArray(rows)) {
            response.status(400).send({ message: "Invalid rows data" });
            return;
        }

        try {
            // Your logic to handle occurrences goes here
            response.status(200).send({ message: 'Occurrences submitted successfully' });
        } catch (error) {
            console.error('Error:', error);
            response.status(500).send('Failed to submit occurrences: ' + error.message);
        }
    });
});