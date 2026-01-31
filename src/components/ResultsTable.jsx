import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import './ResultsTable.css';

const ResultsTable = ({ data, loading, chuyenkhoaFilter, searchQuery }) => {
    const [colorRules, setColorRules] = useState(null);
    // null = no sort, 'asc' = ascending, 'desc' = descending
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    useEffect(() => {
        loadColorRules();
    }, []);

    const loadColorRules = async () => {
        try {
            const docRef = doc(db, 'settings', 'colorRules');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setColorRules(docSnap.data());
            }
        } catch (error) {
            console.error('Error loading color rules:', error);
        }
    };

    // Memoize search terms for highlighting
    const searchTerms = useMemo(() => {
        if (!searchQuery || !searchQuery.trim()) return [];
        return searchQuery.trim().split(/\s+/).filter(term => term.length > 0);
    }, [searchQuery]);

    // Highlight text function
    const highlightText = (text) => {
        if (!text || searchTerms.length === 0) return text;

        const lowerText = text.toLowerCase();
        const matches = [];

        for (const term of searchTerms) {
            const lowerTerm = term.toLowerCase();
            let startIndex = 0;
            let index;

            while ((index = lowerText.indexOf(lowerTerm, startIndex)) !== -1) {
                matches.push({ start: index, end: index + term.length });
                startIndex = index + 1;
            }
        }

        if (matches.length === 0) return text;

        // Sort and merge overlapping matches
        matches.sort((a, b) => a.start - b.start);
        const mergedMatches = [];
        for (const match of matches) {
            if (mergedMatches.length === 0 || match.start >= mergedMatches[mergedMatches.length - 1].end) {
                mergedMatches.push(match);
            }
        }

        // Build result with highlights
        const parts = [];
        let lastIndex = 0;

        for (let i = 0; i < mergedMatches.length; i++) {
            const match = mergedMatches[i];
            if (match.start > lastIndex) {
                parts.push(text.substring(lastIndex, match.start));
            }
            parts.push(
                <mark key={i} className="highlight">
                    {text.substring(match.start, match.end)}
                </mark>
            );
            lastIndex = match.end;
        }

        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts;
    };

    const getRowStyle = (record) => {
        if (!colorRules) return {};

        let style = {};
        const chuanqtkt = (record.chuanqtkt || '').toLowerCase();

        if (chuanqtkt.includes('chuẩn mới') || chuanqtkt.includes('chuan moi')) {
            if (colorRules.chuanMoi) {
                if (colorRules.chuanMoi.textColor) {
                    style.color = colorRules.chuanMoi.textColor;
                }
                if (colorRules.chuanMoi.bgColor) {
                    style.backgroundColor = colorRules.chuanMoi.bgColor;
                }
            }
        } else if (chuanqtkt.includes('chuẩn cũ') || chuanqtkt.includes('chuan cu')) {
            if (colorRules.chuanCu) {
                if (colorRules.chuanCu.textColor) {
                    style.color = colorRules.chuanCu.textColor;
                }
                if (colorRules.chuanCu.bgColor) {
                    style.backgroundColor = colorRules.chuanCu.bgColor;
                }
            }
        }

        if (colorRules.customRules && Array.isArray(colorRules.customRules)) {
            for (const rule of colorRules.customRules) {
                if (!rule.keyword || !rule.keyword.trim()) continue;

                const fieldValue = (record[rule.field] || '').toLowerCase();
                const keyword = rule.keyword.toLowerCase();

                if (fieldValue.includes(keyword)) {
                    if (rule.textColor) {
                        style.color = rule.textColor;
                    }
                    if (rule.bgColor) {
                        style.backgroundColor = rule.bgColor;
                    }
                    break;
                }
            }
        }

        return style;
    };

    // 3-state sorting: asc → desc → null (reset)
    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key !== key) {
                // New column, start with ascending
                return { key, direction: 'asc' };
            }
            if (prev.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            // Reset to no sorting
            return { key: null, direction: null };
        });
    };

    const getSortedData = () => {
        if (!sortConfig.key || !sortConfig.direction) return data;

        return [...data].sort((a, b) => {
            const aVal = (a[sortConfig.key] || '').toLowerCase();
            const bVal = (b[sortConfig.key] || '').toLowerCase();

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Sort icon component with clear state indication
    const SortIcon = ({ columnKey }) => {
        const isActive = sortConfig.key === columnKey;
        const direction = sortConfig.direction;

        if (!isActive) {
            // Show neutral double arrow for inactive columns
            return <span className="sort-icon inactive">⇅</span>;
        }

        // Show active arrow based on direction
        return (
            <span className="sort-icon active">
                {direction === 'asc' ? '▲' : '▼'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (data.length === 0) {
        const hasChuyenkhoaFilter = chuyenkhoaFilter && chuyenkhoaFilter.trim().length > 0;

        return (
            <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>Không tìm thấy kết quả</h3>
                <p>
                    {hasChuyenkhoaFilter
                        ? 'Thử thay đổi từ khóa tìm kiếm, chọn tất cả chuẩn QTKT và bỏ lọc theo chuyên khoa'
                        : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'}
                </p>
            </div>
        );
    }

    const sortedData = getSortedData();

    return (
        <div className="results-container">
            <div className="results-header">
                <h3>Kết quả: <span className="count">{data.length}</span> quy trình</h3>
            </div>

            <div className="table-wrapper">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('qdbanhanh')} className="sortable">
                                Số QĐ ban hành <SortIcon columnKey="qdbanhanh" />
                            </th>
                            <th onClick={() => handleSort('chuyenkhoa')} className="sortable">
                                Chuyên khoa <SortIcon columnKey="chuyenkhoa" />
                            </th>
                            <th onClick={() => handleSort('tenqtkt')} className="sortable">
                                Tên QTKT <SortIcon columnKey="tenqtkt" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((record) => (
                            <tr key={record.id} style={getRowStyle(record)}>
                                <td>{record.qdbanhanh}</td>
                                <td>{record.chuyenkhoa}</td>
                                <td>{highlightText(record.tenqtkt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable;
