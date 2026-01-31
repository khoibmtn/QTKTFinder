import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import './ResultsTable.css';

const ResultsTable = ({ data, loading, chuyenkhoaFilter, searchQuery }) => {
    const [colorRules, setColorRules] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [quickLinks, setQuickLinks] = useState({});

    useEffect(() => {
        loadColorRules();
        loadQuickLinks();
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

    const loadQuickLinks = async () => {
        try {
            const docRef = doc(db, 'settings', 'quickLinks');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setQuickLinks(docSnap.data());
            }
        } catch (error) {
            console.error('Error loading quick links:', error);
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

        matches.sort((a, b) => a.start - b.start);
        const mergedMatches = [];
        for (const match of matches) {
            if (mergedMatches.length === 0 || match.start >= mergedMatches[mergedMatches.length - 1].end) {
                mergedMatches.push(match);
            }
        }

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

    // Extract STT (number) from tenqtkt - e.g. "53. ADA (adenosine deaminase)" => "53"
    const extractSTT = (tenqtkt) => {
        if (!tenqtkt) return '';
        const match = tenqtkt.match(/^(\d+)/);
        return match ? match[1] : '';
    };

    // Extract chapter number and name from chuyenkhoa - e.g. "23. HÓA SINH" => { num: "23", name: "HÓA SINH" }
    const extractChapterInfo = (chuyenkhoa) => {
        if (!chuyenkhoa) return { num: '', name: chuyenkhoa };
        const match = chuyenkhoa.match(/^(\d+)\.\s*(.+)$/);
        if (match) {
            return { num: match[1], name: match[2] };
        }
        return { num: '', name: chuyenkhoa };
    };

    // Extract QD number from qdbanhanh - e.g. "QĐ số: 2633/QĐ-BYT ngày 19 tháng 8 năm 2025" => "2633"
    const extractQDNumber = (qdbanhanh) => {
        if (!qdbanhanh) return '';
        const match = qdbanhanh.match(/(\d+)\/QĐ/i) || qdbanhanh.match(/(\d+)/);
        return match ? match[1] : '';
    };

    // Extract year from qdbanhanh
    const extractYear = (qdbanhanh) => {
        if (!qdbanhanh) return '';
        const match = qdbanhanh.match(/năm\s*(\d{4})/i) || qdbanhanh.match(/(\d{4})/);
        return match ? match[1] : '';
    };

    // Render guidance line based on selected record
    const renderGuidanceLine = () => {
        if (!selectedRecord) return null;

        const qdbanhanh = selectedRecord.qdbanhanh || '';
        const chuyenkhoa = selectedRecord.chuyenkhoa || '';
        const tenqtkt = selectedRecord.tenqtkt || '';
        const chuanqtkt = (selectedRecord.chuanqtkt || '').toLowerCase();

        const stt = extractSTT(tenqtkt);
        const chapterInfo = extractChapterInfo(chuyenkhoa);
        const qdNumber = extractQDNumber(qdbanhanh);
        const year = extractYear(qdbanhanh);

        // Case 1: Số QĐ Ban hành contains "BV xây dựng năm 2025"
        if (qdbanhanh.toLowerCase().includes('bv xây dựng') || qdbanhanh.toLowerCase().includes('bv xay dung')) {
            const fileName = chapterInfo.num
                ? `CHƯƠNG ${chapterInfo.num}. ${chapterInfo.name}.docx`
                : `${chuyenkhoa}.docx`;

            return (
                <>
                    . Mở link{' '}
                    <a
                        href={quickLinks.thumuc || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="folder-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Thư mục QTKT BYT, BV
                    </a>{' '}
                    ở bên tay trái, truy cập thư mục{' '}
                    <span className="red-bold">BV xây dựng năm 2025</span>, sau đó tìm file{' '}
                    <span className="red-bold">{fileName}</span> và tải xuống, tìm quy trình số{' '}
                    <span className="red-bold">{stt}</span>
                </>
            );
        }

        // Case 2: Chuẩn mới
        if (chuanqtkt.includes('chuẩn mới') || chuanqtkt.includes('chuan moi')) {
            const fileName = `QĐ ${qdNumber} Hướng dẫn QTKT ${chapterInfo.name}`;

            return (
                <>
                    . Mở link{' '}
                    <a
                        href={quickLinks.thumuc || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="folder-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Thư mục QTKT BYT, BV
                    </a>{' '}
                    ở bên tay trái, truy cập thư mục{' '}
                    <span className="red-bold">QTKT CHUẨN MỚI</span>, mở thư mục WORD (hoặc PDF nếu trong thư mục WORD không có), sau đó tìm file{' '}
                    <span className="red-bold">{fileName}</span> và tải xuống, tìm quy trình có số thứ tự{' '}
                    <span className="red-bold">{stt}</span>
                </>
            );
        }

        // Case 3: Chuẩn cũ (default)
        const soQD = qdNumber && year ? `số ${qdNumber} năm ${year}` : qdbanhanh;

        return (
            <>
                . Căn cứ vào tên quy trình và chuyên khoa, hãy mở link{' '}
                <a
                    href={quickLinks.thumuc || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="folder-link"
                    onClick={(e) => e.stopPropagation()}
                >
                    Thư mục QTKT BYT, BV
                </a>{' '}
                ở bên tay trái, truy cập thư mục{' '}
                <span className="red-bold">QTKT CHUẨN CŨ</span>, mở thư mục chuyên khoa liên quan nhất và tìm quyết định{' '}
                <span className="red-bold">{soQD}</span>
            </>
        );
    };

    const handleRowClick = (record) => {
        if (selectedRecord?.id === record.id) {
            setSelectedRecord(null);
        } else {
            setSelectedRecord(record);
        }
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

    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key !== key) {
                return { key, direction: 'asc' };
            }
            if (prev.direction === 'asc') {
                return { key, direction: 'desc' };
            }
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

    const SortIcon = ({ columnKey }) => {
        const isActive = sortConfig.key === columnKey;
        const direction = sortConfig.direction;

        if (!isActive) {
            return <span className="sort-icon inactive">⇅</span>;
        }

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
                <p className="results-info">
                    Kết quả: <span className="blue-bold">{data.length}</span> quy trình
                    {renderGuidanceLine()}
                </p>
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
                            <tr
                                key={record.id}
                                style={getRowStyle(record)}
                                onClick={() => handleRowClick(record)}
                                className={`clickable-row ${selectedRecord?.id === record.id ? 'selected' : ''}`}
                            >
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
