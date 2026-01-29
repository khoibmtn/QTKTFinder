import { useState, useEffect } from 'react';
import { subscribeToQTKTRecords } from '../services/firestore';

export const useQTKTData = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);

        const unsubscribe = subscribeToQTKTRecords((data) => {
            setRecords(data);
            setLoading(false);
            setError(null);
        });

        return () => unsubscribe();
    }, []);

    return { records, loading, error };
};
