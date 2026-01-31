import { useState, useMemo, useEffect } from 'react';
import { createFuzzySearch, matchByMethod, SEARCH_METHODS } from '../services/fuzzySearch';

// Keys for sessionStorage
const STORAGE_KEYS = {
    searchQuery: 'qtkt_searchQuery',
    chuanQTKTFilter: 'qtkt_chuanQTKTFilter',
    chuyenkhoaFilter: 'qtkt_chuyenkhoaFilter',
    searchMethod: 'qtkt_searchMethod',
    instantSearch: 'qtkt_instantSearch'
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

// Helper to get initial boolean value from sessionStorage
const getInitialBoolValue = (key, defaultValue) => {
    try {
        const stored = sessionStorage.getItem(key);
        if (stored === null) return defaultValue;
        return stored === 'true';
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
    const [searchMethod, setSearchMethodState] = useState(() =>
        getInitialValue(STORAGE_KEYS.searchMethod, SEARCH_METHODS.FLEXIBLE)
    );
    const [isInstantSearch, setIsInstantSearchState] = useState(() =>
        getInitialBoolValue(STORAGE_KEYS.instantSearch, true)
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

    const setSearchMethod = (value) => {
        setSearchMethodState(value);
        try {
            sessionStorage.setItem(STORAGE_KEYS.searchMethod, value);
        } catch { /* ignore */ }
    };

    const setIsInstantSearch = (value) => {
        setIsInstantSearchState(value);
        try {
            sessionStorage.setItem(STORAGE_KEYS.instantSearch, String(value));
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

        // Filter by chuyenkhoa using selected search method
        if (chuyenkhoaFilter.trim()) {
            result = result.filter(item =>
                matchByMethod(item.chuyenkhoa, chuyenkhoaFilter, searchMethod)
            );
        }

        // Search by tenqtkt using selected search method
        if (searchQuery.trim()) {
            result = result.filter(item =>
                matchByMethod(item.tenqtkt, searchQuery, searchMethod)
            );
        }

        return result;
    }, [data, searchQuery, chuanQTKTFilter, chuyenkhoaFilter, searchMethod]);

    return {
        searchQuery,
        setSearchQuery,
        chuanQTKTFilter,
        setChuanQTKTFilter,
        chuyenkhoaFilter,
        setChuyenkhoaFilter,
        searchMethod,
        setSearchMethod,
        isInstantSearch,
        setIsInstantSearch,
        filteredData,
        SEARCH_METHODS
    };
};
