import {
    collection,
    getDocs,
    addDoc,
    writeBatch,
    doc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'qtkt_records';
const CONFIG_COLLECTION = 'config';

// Real-time listener for QTKT records
export const subscribeToQTKTRecords = (callback) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const records = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(records);
    }, (error) => {
        console.error('Error fetching records:', error);
        callback([]);
    });
};

// Batch upload CSV data
export const batchUploadRecords = async (records, replaceAll = false) => {
    try {
        const batch = writeBatch(db);

        // If replaceAll, delete existing records first
        if (replaceAll) {
            const snapshot = await getDocs(collection(db, COLLECTION_NAME));
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
        }

        // Add new records
        records.forEach(record => {
            const docRef = doc(collection(db, COLLECTION_NAME));
            batch.set(docRef, {
                chuanqtkt: record.chuanqtkt || '',
                qdbanhanh: record.qdbanhanh || '',
                chuyenkhoa: record.chuyenkhoa || '',
                tenqtkt: record.tenqtkt || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        });

        await batch.commit();
        return { success: true, count: records.length };
    } catch (error) {
        console.error('Error uploading records:', error);
        return { success: false, error: error.message };
    }
};

// Get access code from Firestore
export const getAccessCode = async () => {
    try {
        const snapshot = await getDocs(collection(db, CONFIG_COLLECTION));
        const configDoc = snapshot.docs.find(doc => doc.id === 'access');
        return configDoc?.data()?.code || 'admin123'; // Default code
    } catch (error) {
        console.error('Error getting access code:', error);
        return 'admin123';
    }
};

// Update access code
export const updateAccessCode = async (newCode) => {
    try {
        const batch = writeBatch(db);
        const docRef = doc(db, CONFIG_COLLECTION, 'access');
        batch.set(docRef, {
            code: newCode,
            updatedAt: serverTimestamp()
        });
        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error('Error updating access code:', error);
        return { success: false, error: error.message };
    }
};
