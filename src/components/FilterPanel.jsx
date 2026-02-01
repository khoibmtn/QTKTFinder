import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { SEARCH_METHODS } from '../services/fuzzySearch';
import './FilterPanel.css';

// Quick links are now stored as an array with { id, name, url, icon }

const SEARCH_METHOD_OPTIONS = [
    {
        value: SEARCH_METHODS.FLEXIBLE,
        label: 'Linh hoạt',
        tooltip: 'Tìm tất cả các từ, không cần theo thứ tự. Cho nhiều kết quả tìm kiếm nhất.\nVD: "nội soi" khớp với "phẫu thuật nội soi" và "soi kiểm tra nội khoa"'
    },
    {
        value: SEARCH_METHODS.SEQUENTIAL,
        label: 'Tuần tự',
        tooltip: 'Các từ phải xuất hiện đúng thứ tự nhập.\nVD: "nội soi" khớp với "nội khoa soi dạ dày" nhưng KHÔNG khớp "soi nội khoa"'
    },
    {
        value: SEARCH_METHODS.EXACT,
        label: 'Chính xác',
        tooltip: 'Tìm cụm từ chính xác, không tách rời. Ít kết quả hơn nhưng chính xác hơn.\nVD: "nội soi" chỉ khớp với "phẫu thuật nội soi ổ bụng"'
    }
];

const FilterPanel = ({
    searchValue,
    onSearchChange,
    chuanQTKT,
    onChuanQTKTChange,
    chuyenkhoa,
    onChuyenkhoaChange,
    searchMethod,
    onSearchMethodChange,
    isInstantSearch,
    onInstantSearchChange
}) => {
    const [inputValue, setInputValue] = useState(searchValue || '');
    const [quickLinks, setQuickLinks] = useState([]);

    // Load quick links from Firestore
    useEffect(() => {
        const loadQuickLinks = async () => {
            try {
                const docRef = doc(db, 'settings', 'quickLinks');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Support new array format
                    if (Array.isArray(data.links)) {
                        setQuickLinks(data.links);
                    } else {
                        // Migrate old format for display
                        const oldLabels = {
                            xaydung: 'Xây dựng QTKT',
                            huongdan: 'Hướng dẫn XD QTKT',
                            thumuc: 'Thư mục QTKT BYT, BV',
                            nhanqtkt: 'Thư mục nhận QTKT'
                        };
                        const oldIcons = {
                            xaydung: '🔗',
                            huongdan: '❓',
                            thumuc: '📁',
                            nhanqtkt: '📥'
                        };
                        const migratedLinks = Object.entries(data)
                            .filter(([key, url]) => url && typeof url === 'string')
                            .map(([key, url]) => ({
                                id: key,
                                name: oldLabels[key] || key,
                                url: url,
                                icon: oldIcons[key] || '🔗'
                            }));
                        setQuickLinks(migratedLinks);
                    }
                }
            } catch (error) {
                console.error('Error loading quick links:', error);
            }
        };
        loadQuickLinks();
    }, []);

    // Sync internal state with prop if it changes externally
    useEffect(() => {
        setInputValue(searchValue || '');
    }, [searchValue]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        if (isInstantSearch) {
            onSearchChange(newValue);
        }
    };

    const handleSearchTrigger = () => {
        onSearchChange(inputValue);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchTrigger();
        }
    };

    const clearSearch = () => {
        setInputValue('');
        onSearchChange('');
    };

    const clearChuyenkhoa = () => {
        onChuyenkhoaChange('');
    };

    return (
        <div className="filter-panel">
            <div className="filter-header">
                <h3 className="filter-title">TÌM KIẾM</h3>
                <div className="search-method-dropdown">
                    <select
                        value={searchMethod}
                        onChange={(e) => onSearchMethodChange(e.target.value)}
                        className="search-method-select"
                    >
                        {SEARCH_METHOD_OPTIONS.map(option => (
                            <option
                                key={option.value}
                                value={option.value}
                                title={option.tooltip}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="search-method-tooltip">
                        <span className="tooltip-icon">ⓘ</span>
                        <div className="tooltip-content">
                            {SEARCH_METHOD_OPTIONS.find(o => o.value === searchMethod)?.tooltip}
                        </div>
                    </div>
                </div>
            </div>

            <div className="filter-content">
                <div className="filter-group">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tên quy trình kỹ thuật..."
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="filter-input search-input"
                        />
                        {inputValue && (
                            <button
                                className="clear-btn"
                                onClick={clearSearch}
                                title="Xóa"
                                type="button"
                            >
                                ✕
                            </button>
                        )}
                        {!isInstantSearch ? (
                            <button
                                className="search-icon-btn"
                                onClick={handleSearchTrigger}
                                title="Tìm kiếm"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        ) : (
                            <svg className="search-icon-input" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        )}
                    </div>
                </div>

                {/* Toggle Switch for Instant Search */}
                <div className="filter-group toggle-group">
                    <label className="toggle-container">
                        <div className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={isInstantSearch}
                                onChange={(e) => onInstantSearchChange(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </div>
                        <span className="toggle-label">Tìm kiếm tức thời</span>
                    </label>
                    <p className="hint-text">
                        {isInstantSearch
                            ? 'Tắt tìm kiếm tức thời nếu mạng bị treo, hiện kết quả chậm'
                            : 'Tắt tìm kiếm tức thời nếu mạng bị treo, hiện kết quả chậm. Bấm biểu tượng kính lúp hoặc Enter để thực hiện tìm kiếm'
                        }
                    </p>
                </div>

                <div className="filter-group">
                    <label htmlFor="chuan-qtkt" className="filter-label">CHUẨN QTKT:</label>
                    <select
                        id="chuan-qtkt"
                        value={chuanQTKT}
                        onChange={(e) => onChuanQTKTChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Chuẩn cũ">QTKT theo chuẩn cũ</option>
                        <option value="Chuẩn mới">QTKT theo chuẩn mới</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="chuyenkhoa" className="filter-label">CHUYÊN KHOA:</label>
                    <div className="input-with-clear">
                        <input
                            id="chuyenkhoa"
                            type="text"
                            placeholder="Nhập chuyên khoa..."
                            value={chuyenkhoa}
                            onChange={(e) => onChuyenkhoaChange(e.target.value)}
                            className="filter-input"
                        />
                        {chuyenkhoa && (
                            <button
                                className="clear-btn-inline"
                                onClick={clearChuyenkhoa}
                                title="Xóa"
                                type="button"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {chuyenkhoa && (
                        <p className="hint-text">Xóa chuyên khoa để hiển thị nhiều kết quả hơn</p>
                    )}
                </div>



                {/* Quick Access Links */}
                {quickLinks.length > 0 && (
                    <div className="quick-access-section">
                        <h4 className="quick-access-title">TRUY CẬP NHANH</h4>
                        <div className="quick-access-links">
                            {quickLinks.map((link) => (
                                link.url && (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="quick-link-btn"
                                    >
                                        <span className="quick-link-icon">{link.icon || '🔗'}</span>
                                        <span className="quick-link-text">{link.name}</span>
                                    </a>
                                )
                            ))}
                        </div>
                        <p className="hint-text">Mở "Hướng dẫn XD QTKT" bên trên để xem cách tải QTKT tìm được</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterPanel;
