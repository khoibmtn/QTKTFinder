import { useState, useEffect } from 'react';
import { subscribeToQTKTRecords } from '../services/firestore';

const CACHE_KEY = 'qtkt_records_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useQTKTData = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);

        // Try to load from cache first
        const loadFromCache = () => {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    const isExpired = Date.now() - timestamp > CACHE_DURATION;

                    // Don't use cache if expired OR if data is empty
                    if (!isExpired && data && data.length > 0) {
                        console.log('📦 Loading data from cache');
                        setRecords(data);
                        setLoading(false);
                        return true; // Cache hit
                    } else if (isExpired) {
                        console.log('⏰ Cache expired, fetching fresh data');
                    } else {
                        console.log('📭 Cache empty, fetching fresh data');
                    }
                }
            } catch (err) {
                console.error('Error reading cache:', err);
            }
            return false; // Cache miss, expired, or empty
        };

        // Check cache first
        const cacheHit = loadFromCache();

        if (!cacheHit) {
            // Fetch from Firestore if no valid cache
            console.log('🔥 Fetching data from Firestore');
            const unsubscribe = subscribeToQTKTRecords((data) => {
                setRecords(data);
                setLoading(false);
                setError(null);

                // Save to cache
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        data,
                        timestamp: Date.now()
                    }));
                    console.log('💾 Data cached successfully');
                } catch (err) {
                    console.error('Error saving to cache:', err);
                }
            });

            return () => unsubscribe();
        }
    }, []);

    return { records, loading, error };
};

// Helper function to clear cache (used after admin uploads)
export const clearQTKTCache = () => {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Cache cleared');
};
