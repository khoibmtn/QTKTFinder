import { useState, useMemo, useEffect } from 'react';
import { createFuzzySearch, fuzzyMatch } from '../services/fuzzySearch';

// Keys for sessionStorage
const STORAGE_KEYS = {
    searchQuery: 'qtkt_searchQuery',
    chuanQTKTFilter: 'qtkt_chuanQTKTFilter',
    chuyenkhoaFilter: 'qtkt_chuyenkhoaFilter'
};

// Helper to get initial value from sessionStorage
const getInitialValue = (key, defaultValue) => {
    try {
        const stored = sessionStorage.getItem(key);
        return stored !== null ? stored : defaultValue;
    } catch {
        return defaultValue;
    }
};

export const useSearch = (data) => {
    const [searchQuery, setSearchQueryState] = useState(() =>
        getInitialValue(STORAGE_KEYS.searchQuery, '')
    );
    const [chuanQTKTFilter, setChuanQTKTFilterState] = useState(() =>
        getInitialValue(STORAGE_KEYS.chuanQTKTFilter, 'Tất cả')
    );
    const [chuyenkhoaFilter, setChuyenkhoaFilterState] = useState(() =>
        getInitialValue(STORAGE_KEYS.chuyenkhoaFilter, '')
    );

    // Wrapper setters that also persist to sessionStorage
    const setSearchQuery = (value) => {
        setSearchQueryState(value);
        try {
            sessionStorage.setItem(STORAGE_KEYS.searchQuery, value);
        } catch { /* ignore */ }
    };

    const setChuanQTKTFilter = (value) => {
        setChuanQTKTFilterState(value);
        try {
            sessionStorage.setItem(STORAGE_KEYS.chuanQTKTFilter, value);
        } catch { /* ignore */ }
    };

    const setChuyenkhoaFilter = (value) => {
        setChuyenkhoaFilterState(value);
        try {
            sessionStorage.setItem(STORAGE_KEYS.chuyenkhoaFilter, value);
        } catch { /* ignore */ }
    };

    // Create Fuse instance
    const fuse = useMemo(() => createFuzzySearch(data), [data]);

    // Filter and search logic
    const filteredData = useMemo(() => {
        let result = [...data];

        // Filter by chuanqtkt
        if (chuanQTKTFilter !== 'Tất cả') {
            const filterValue = chuanQTKTFilter === 'Chuẩn cũ'
                ? 'QTKT theo chuẩn cũ'
                : 'QTKT theo chuẩn mới';
            result = result.filter(item => item.chuanqtkt === filterValue);
        }

        // Fuzzy filter by chuyenkhoa
        if (chuyenkhoaFilter.trim()) {
            result = result.filter(item =>
                fuzzyMatch(item.chuyenkhoa, chuyenkhoaFilter)
            );
        }

        // Fuzzy search by tenqtkt
        if (searchQuery.trim()) {
            result = result.filter(item =>
                fuzzyMatch(item.tenqtkt, searchQuery)
            );
        }

        return result;
    }, [data, searchQuery, chuanQTKTFilter, chuyenkhoaFilter]);

    return {
        searchQuery,
        setSearchQuery,
        chuanQTKTFilter,
        setChuanQTKTFilter,
        chuyenkhoaFilter,
        setChuyenkhoaFilter,
        filteredData
    };
};
