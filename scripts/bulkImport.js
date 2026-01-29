/**
 * Bulk Import Script for QTKT Data to Firestore
 * Usage: node scripts/bulkImport.js path/to/your/file.csv
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Initialize Firebase Admin with service account
// You need to download service account key from Firebase Console
// Go to: Project Settings > Service Accounts > Generate new private key
const serviceAccount = JSON.parse(
    readFileSync('./serviceAccountKey.json', 'utf8')
);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const COLLECTION_NAME = 'qtkt_records';
const BATCH_SIZE = 500; // Firestore batch limit is 500

async function bulkImport(csvPath) {
    console.log(`📂 Reading CSV file: ${csvPath}`);

    const csvContent = readFileSync(csvPath, 'utf8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    console.log(`📊 Found ${records.length} records to import`);

    // Clear existing data first (optional)
    console.log('🗑️  Clearing existing data...');
    const existingDocs = await db.collection(COLLECTION_NAME).listDocuments();
    const deletePromises = [];
    for (let i = 0; i < existingDocs.length; i += BATCH_SIZE) {
        const batch = db.batch();
        existingDocs.slice(i, i + BATCH_SIZE).forEach(doc => batch.delete(doc));
        deletePromises.push(batch.commit());
    }
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${existingDocs.length} existing records`);

    // Import new data in batches
    console.log('📤 Starting bulk import...');
    let imported = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const batchRecords = records.slice(i, i + BATCH_SIZE);

        batchRecords.forEach((record, index) => {
            const docRef = db.collection(COLLECTION_NAME).doc();
            batch.set(docRef, {
                chuanqtkt: record.chuanqtkt || '',
                qdbanhanh: record.qdbanhanh || '',
                chuyenkhoa: record.chuyenkhoa || '',
                tenqtkt: record.tenqtkt || '',
                createdAt: new Date()
            });
        });

        await batch.commit();
        imported += batchRecords.length;
        const percent = Math.round((imported / records.length) * 100);
        console.log(`   Progress: ${imported}/${records.length} (${percent}%)`);
    }

    console.log(`\n✅ Successfully imported ${imported} records!`);
}

// Run the script
const csvPath = process.argv[2];
if (!csvPath) {
    console.log('Usage: node scripts/bulkImport.js path/to/your/file.csv');
    process.exit(1);
}

bulkImport(csvPath).catch(console.error);
