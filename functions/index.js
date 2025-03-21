const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');

admin.initializeApp();
const bigquery = new BigQuery();

exports.createNewSong = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { title } = data;
  if (!title) {
    throw new functions.https.HttpsError('invalid-argument', 'Title is required');
  }

  try {
    await bigquery.dataset('your_dataset').table('songs').insert([{
      id: admin.firestore().collection('_').doc().id,
      title,
      created_by: context.auth.uid,
      created_at: new Date().toISOString()
    }]);

    return { success: true, message: 'Song created successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

exports.submitOccurrences = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { rows } = data;
  if (!rows || !Array.isArray(rows)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid rows data');
  }

  try {
    await bigquery.dataset('your_dataset').table('occurrences').insert(
      rows.map(row => ({
        ...row,
        created_by: context.auth.uid,
        created_at: new Date().toISOString()
      }))
    );

    return { success: true, message: 'Occurrences submitted successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});