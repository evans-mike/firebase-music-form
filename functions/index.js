const { https } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

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
        const songId = uuidv4();
        const songData = {
            id: songId,
            title: data.title,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: context.auth.uid
        };

        // Write to Firestore
        await db.collection('songs').doc(songId).set(songData);
        console.log('Song created successfully in Firestore:', songId);

        return {
            success: true,
            message: 'Song created successfully!',
            songId: songId
        };
    } catch (error) {
        console.error('Error in createNewSong:', error);
        throw new https.HttpsError('internal', 'Failed to create song', error);
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
        const batch = db.batch();
        const occurrenceIds = [];

        for (const occurrence of data.occurrences) {
            if (!occurrence.songId || !occurrence.date) {
                console.error('Invalid occurrence data:', occurrence);
                throw new https.HttpsError('invalid-argument', 'Each occurrence must have songId and date');
            }

            const occurrenceId = uuidv4();
            const occurrenceRef = db.collection('song_occurrences').doc(occurrenceId);
            
            batch.set(occurrenceRef, {
                id: occurrenceId,
                song_id: occurrence.songId,
                occurrence_date: occurrence.date,
                service: occurrence.service || 'AM',
                closer_flag: occurrence.closer_flag || false,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                created_by: context.auth.uid
            });

            occurrenceIds.push(occurrenceId);
        }

        await batch.commit();
        console.log('Successfully inserted occurrences:', {
            count: occurrenceIds.length,
            ids: occurrenceIds
        });

        return {
            success: true,
            message: 'Song occurrences created successfully!',
            count: occurrenceIds.length,
            occurrenceIds: occurrenceIds
        };
    } catch (error) {
        console.error('Error in createSongOccurrences:', error);
        throw new https.HttpsError('internal', `Failed to create song occurrences: ${error.message}`);
    }
});