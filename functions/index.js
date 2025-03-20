const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
});
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

// Wrap all functions with cors
exports.testConnection = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        res.json({
            message: 'Connection successful!',
            timestamp: new Date().toISOString()
        });
    });
});

exports.createNewSong = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            // Log the request
            console.log('CreateNewSong function called', {
                headers: req.headers,
                body: req.body
            });

            const data = req.body;

            if (!data.title) {
                return res.status(400).json({
                    error: 'Title is required'
                });
            }

            const row = {
                id: require('uuid').v4(),
                title: data.title,
                created_at: new Date().toISOString()
            };

            // For testing, just return success
            return res.json({ 
                success: true, 
                message: 'Song created successfully!',
                songId: row.id
            });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });
});