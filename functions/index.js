const { https } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

admin.initializeApp();
const db = admin.firestore();

exports.createNewSong = https.onCall({
    maxInstances: 10,
    memory: "256MiB",
}, async (data, context) => {
    // Authentication check
    if (!context.auth) {
        throw new https.HttpsError('unauthenticated', 'Must be logged in to create songs');
    }

    // Input validation
    if (!data.title?.trim()) {
        throw new https.HttpsError('invalid-argument', 'Title must be a non-empty string');
    }

    try {
        const songId = uuidv4();
        const songData = {
            id: songId,
            title: data.title.trim(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: context.auth.uid
        };

        await db.collection('songs').doc(songId).set(songData);
        
        return {
            success: true,
            message: 'Song created successfully!',
            songId,
            song: songData
        };
    } catch (error) {
        console.error('Failed to create song:', error);
        throw new https.HttpsError('internal', 'Failed to create song. Please try again.');
    }
});

exports.createSongOccurrences = https.onCall({
    maxInstances: 10,
    memory: "256MiB",
}, async (data, context) => {
    // Authentication check
    if (!context.auth) {
        throw new https.HttpsError('unauthenticated', 'Must be logged in to create song occurrences');
    }

    // Input validation
    if (!Array.isArray(data.occurrences)) {
        throw new https.HttpsError('invalid-argument', 'Occurrences must be an array');
    }

    try {
        const batch = db.batch();
        const occurrenceIds = [];
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        // Validate and prepare all occurrences
        for (const occurrence of data.occurrences) {
            // Validate required fields
            if (!occurrence.songId || !occurrence.date) {
                throw new https.HttpsError(
                    'invalid-argument',
                    'Each occurrence must have songId and date'
                );
            }

            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(occurrence.date)) {
                throw new https.HttpsError(
                    'invalid-argument',
                    `Invalid date format: ${occurrence.date}. Expected YYYY-MM-DD`
                );
            }

            // Create occurrence document
            const occurrenceId = uuidv4();
            const occurrenceRef = db.collection('song_occurrences').doc(occurrenceId);
            
            batch.set(occurrenceRef, {
                id: occurrenceId,
                songId: occurrence.songId,
                date: occurrence.date,
                service: occurrence.service || 'AM',
                closerFlag: occurrence.closer_flag || false,
                createdAt: timestamp,
                createdBy: context.auth.uid,
                updatedAt: timestamp,
                updatedBy: context.auth.uid
            });

            occurrenceIds.push(occurrenceId);
        }

        // Commit all occurrences in a single batch
        await batch.commit();

        return {
            success: true,
            message: 'Song occurrences created successfully!',
            count: occurrenceIds.length,
            occurrenceIds
        };
    } catch (error) {
        console.error('Failed to create song occurrences:', error);
        
        if (error instanceof https.HttpsError) {
            throw error;
        }
        
        throw new https.HttpsError(
            'internal',
            'Failed to create song occurrences. Please try again.'
        );
    }
});

// Helper function to log errors
const logError = (functionName, error, additionalContext = {}) => {
    console.error(`Error in ${functionName}:`, {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
        ...additionalContext
    });
};