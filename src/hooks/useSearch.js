import { useState, useMemo } from 'react';
import { createFuzzySearch, fuzzyMatch } from '../services/fuzzySearch';

export const useSearch = (data) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [chuanQTKTFilter, setChuanQTKTFilter] = useState('Tất cả');
    const [chuyenkhoaFilter, setChuyenkhoaFilter] = useState('');

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
