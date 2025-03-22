const { https } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp();

// Initialize BigQuery with explicit credentials
const bigqueryConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
};

// Only use credentials file in development
if (process.env.NODE_ENV !== 'production') {
    const credentialsPath = path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('Loading BigQuery credentials from:', credentialsPath);
    bigqueryConfig.keyFilename = credentialsPath;
}

const bigquery = new BigQuery(bigqueryConfig);
const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET_ID);


// Utility function to log errors
const logError = (functionName, error, context = {}) => {
    console.error(`Error in ${functionName}:`, {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        },
        context: {
            ...context,
            projectId: process.env.GOOGLE_CLOUD_PROJECT,
            datasetId: process.env.BIGQUERY_DATASET_ID
        }
    });
};

exports.createNewSong = https.onCall({
    minInstances: 0,
    maxInstances: 10,
    memory: "256MiB",
    cors: true,
    enforceAppCheck: false,
}, async (data, context) => {
    console.log('createNewSong function called with:', {
        data,
        auth: context.auth ? {
            uid: context.auth.uid,
            token: {
                email: context.auth.token.email,
                email_verified: context.auth.token.email_verified
            }
        } : 'No auth context'
    });

    console.log('Environment:', {
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
        datasetId: process.env.BIGQUERY_DATASET_ID,
        nodeEnv: process.env.NODE_ENV
    });

    if (!context.auth) {
        console.error('Authentication failed: No auth context');
        throw new https.HttpsError('unauthenticated', 'Must be logged in to create songs');
    }

    if (!data.title || typeof data.title !== 'string') {
        console.error('Validation failed:', { 
            receivedTitle: data.title, 
            titleType: typeof data.title 
        });
        throw new https.HttpsError('invalid-argument', 'Title must be a non-empty string');
    }

    try {
        const row = {
            id: uuidv4(),
            title: data.title
        };
        console.log('Row data created:', row);

        const table = dataset.table('app_songs');
        console.log('Checking if songs table exists...');
        
        const [tableExists] = await table.exists();
        if (!tableExists) {
            throw new https.HttpsError('failed-precondition', 'Songs table does not exist');
        }

        const [metadata] = await table.getMetadata();
        console.log('Songs table metadata:', {
            tableId: metadata.tableReference.tableId,
            schema: metadata.schema.fields
        });

        await table.insert([row], { insertId: row.id });
        console.log('Song inserted successfully:', row.id);

        return {
            success: true,
            message: 'Song created successfully!',
            songId: row.id
        };
    } catch (error) {
        logError('createNewSong', error);
        throw new https.HttpsError('internal', `Failed to create song: ${error.message}`);
    }
});

exports.createSongOccurrences = https.onCall({
    minInstances: 0,
    maxInstances: 10,
    memory: "256MiB",
    cors: true,
    enforceAppCheck: false,
}, async (data, context) => {
    console.log('createSongOccurrences function called with:', {
        data,
        auth: context.auth ? {
            uid: context.auth.uid,
            token: {
                email: context.auth.token.email,
                email_verified: context.auth.token.email_verified
            }
        } : 'No auth context'
    });

    if (!context.auth) {
        console.error('Authentication failed: No auth context');
        throw new https.HttpsError('unauthenticated', 'Must be logged in to create song occurrences');
    }

    if (!Array.isArray(data.occurrences)) {
        console.error('Invalid occurrences data:', data);
        throw new https.HttpsError('invalid-argument', 'Occurrences must be an array');
    }

    try {
        const rows = data.occurrences.map(occurrence => {
            if (!occurrence.songId || !occurrence.date) {
                console.error('Invalid occurrence data:', occurrence);
                throw new https.HttpsError('invalid-argument', 'Each occurrence must have songId and date');
            }

            return {
                id: uuidv4(),
                song_id: occurrence.songId,
                occurrence_date: occurrence.date
            };
        });

        console.log('Formatted occurrence rows:', rows);

        const table = dataset.table('app_song_occurrences');
        console.log('Checking if occurrences table exists...');

        const [tableExists] = await table.exists();
        if (!tableExists) {
            throw new https.HttpsError('failed-precondition', 'Song occurrences table does not exist');
        }

        const [metadata] = await table.getMetadata();
        console.log('Occurrences table metadata:', {
            tableId: metadata.tableReference.tableId,
            schema: metadata.schema.fields
        });

        // Insert with insertId to prevent duplicates
        await table.insert(rows.map(row => ({
            ...row,
            insertId: row.id
        })));

        console.log('Successfully inserted occurrences:', {
            count: rows.length,
            ids: rows.map(r => r.id)
        });

        return {
            success: true,
            message: 'Song occurrences created successfully!',
            count: rows.length,
            occurrenceIds: rows.map(r => r.id)
        };
    } catch (error) {
        logError('createSongOccurrences', error, {
            occurrencesCount: data.occurrences?.length
        });

        if (error instanceof https.HttpsError) {
            throw error;
        }

        // Check for BigQuery specific errors
        if (error.errors && error.errors.length > 0) {
            const details = error.errors.map(e => ({
                message: e.message,
                reason: e.reason,
                location: e.location
            }));
            console.error('BigQuery specific errors:', details);
            throw new https.HttpsError('internal', `BigQuery error: ${JSON.stringify(details)}`);
        }

        throw new https.HttpsError('internal', `Failed to create song occurrences: ${error.message}`);
    }
});

// Utility function to verify table schema and existence
async function verifyTable(tableName, expectedSchema) {
    console.log(`Verifying table ${tableName}...`);
    const table = dataset.table(tableName);
    
    try {
        const [exists] = await table.exists();
        if (!exists) {
            console.error(`Table ${tableName} does not exist`);
            return false;
        }

        const [metadata] = await table.getMetadata();
        console.log(`Table ${tableName} metadata:`, {
            tableId: metadata.tableReference.tableId,
            schema: metadata.schema.fields
        });

        return true;
    } catch (error) {
        console.error(`Error verifying table ${tableName}:`, error);
        return false;
    }
}