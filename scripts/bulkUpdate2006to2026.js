/**
 * Bulk Update: Replace "BV ban hành 2006 (PL2)" with "BV ban hành 2026 (PL2)"
 * Usage: node scripts/bulkUpdate2006to2026.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
    readFileSync('./serviceAccountKey.json', 'utf8')
);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const COLLECTION_NAME = 'qtkt_records';
const BATCH_SIZE = 500;
const OLD_VALUE = 'BV ban hành 2006 (PL2)';
const NEW_VALUE = 'BV ban hành 2026 (PL2)';

async function bulkUpdate() {
    console.log(`🔍 Searching for records with qdbanhanh = "${OLD_VALUE}"...`);

    const snapshot = await db.collection(COLLECTION_NAME)
        .where('qdbanhanh', '==', OLD_VALUE)
        .get();

    console.log(`📊 Found ${snapshot.size} records to update`);

    if (snapshot.size === 0) {
        console.log('✅ No records to update. Done!');
        return;
    }

    let updated = 0;
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const batchDocs = docs.slice(i, i + BATCH_SIZE);

        batchDocs.forEach(doc => {
            batch.update(doc.ref, { qdbanhanh: NEW_VALUE });
        });

        await batch.commit();
        updated += batchDocs.length;
        console.log(`   Progress: ${updated}/${docs.length} (${Math.round((updated / docs.length) * 100)}%)`);
    }

    console.log(`\n✅ Successfully updated ${updated} records!`);
    console.log(`   "${OLD_VALUE}" → "${NEW_VALUE}"`);
}

bulkUpdate().catch(console.error);
