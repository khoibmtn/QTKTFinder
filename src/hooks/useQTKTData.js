import { useState, useEffect } from 'react';
import { subscribeToQTKTRecords } from '../services/firestore';

const CACHE_KEY = 'qtkt_records_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useQTKTData = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Try to load from cache for instant display
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const isExpired = Date.now() - timestamp > CACHE_DURATION;

                if (!isExpired && data && data.length > 0) {
                    console.log('📦 Loading data from cache (while fetching fresh data)');
                    setRecords(data);
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error('Error reading cache:', err);
        }

        // ALWAYS subscribe to Firestore for fresh data
        console.log('🔥 Subscribing to Firestore for real-time updates');
        const unsubscribe = subscribeToQTKTRecords((data) => {
            setRecords(data);
            setLoading(false);
            setError(null);

            // Update cache with fresh data
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
                console.log('💾 Cache updated with fresh data');
            } catch (err) {
                console.error('Error saving to cache:', err);
            }
        });

        return () => unsubscribe();
    }, []);

    return { records, loading, error };
};

// Helper function to clear cache (used after admin uploads)
export const clearQTKTCache = () => {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Cache cleared');
};
