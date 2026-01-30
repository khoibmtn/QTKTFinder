import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import './FilterPanel.css';

const CONFIG_PASSWORD = '123456';

const QUICK_LINK_LABELS = {
    xaydung: 'Xây dựng QTKT',
    huongdan: 'Hướng dẫn XD QTKT',
    thumuc: 'Thư mục QTKT BYT, BV',
    nhanqtkt: 'Thư mục nhận QTKT'
};

const FilterPanel = ({
    searchValue,
    onSearchChange,
    chuanQTKT,
    onChuanQTKTChange,
    chuyenkhoa,
    onChuyenkhoaChange
}) => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState(searchValue || '');
    const [isInstantSearch, setIsInstantSearch] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [quickLinks, setQuickLinks] = useState({});

    // Load quick links from Firestore
    useEffect(() => {
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

    const handleConfigClick = () => {
        setShowPasswordModal(true);
        setPasswordInput('');
        setPasswordError('');
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === CONFIG_PASSWORD) {
            setShowPasswordModal(false);
            navigate('/admin');
        } else {
            setPasswordError('Mật khẩu không đúng!');
        }
    };

    const handleModalClose = () => {
        setShowPasswordModal(false);
        setPasswordInput('');
        setPasswordError('');
    };

    return (
        <div className="filter-panel">
            <div className="filter-header">
                <h3 className="filter-title">Bộ lọc tìm kiếm</h3>
                <button type="button" className="btn-config-icon" onClick={handleConfigClick} title="Cấu hình">
                    ⚙️
                </button>
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

                <div className="filter-group checkbox-group">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={isInstantSearch}
                            onChange={(e) => setIsInstantSearch(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        <span className="checkbox-label">Tìm kiếm tức thời</span>
                    </label>
                    <p className="hint-text">Tắt tìm kiếm tức thời nếu trang bị treo, hiện kết quả chậm</p>
                </div>

                <div className="filter-group">
                    <label htmlFor="chuan-qtkt" className="filter-label">Chuẩn QTKT:</label>
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
                    <label htmlFor="chuyenkhoa" className="filter-label">Chuyên khoa:</label>
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

                {!isInstantSearch && (
                    <button className="btn-search" onClick={handleSearchTrigger}>
                        Tìm kiếm
                    </button>
                )}

                {/* Quick Access Links */}
                {Object.keys(quickLinks).some(key => quickLinks[key]) && (
                    <div className="quick-access-section">
                        <h4 className="quick-access-title">Truy cập nhanh</h4>
                        <div className="quick-access-links">
                            {Object.entries(quickLinks).map(([key, url]) => (
                                url && (
                                    <a
                                        key={key}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="quick-link-btn"
                                    >
                                        🔗 {QUICK_LINK_LABELS[key] || key}
                                    </a>
                                )
                            ))}
                        </div>
                        <p className="hint-text">Mở "Hướng dẫn XD QTKT" bên trên để xem cách tải QTKT tìm được</p>
                    </div>
                )}
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="password-modal-overlay" onClick={handleModalClose}>
                    <div className="password-modal" onClick={(e) => e.stopPropagation()}>
                        <h4>🔐 Nhập mật khẩu</h4>
                        <form onSubmit={handlePasswordSubmit}>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Nhập mật khẩu..."
                                autoFocus
                                className="password-input"
                            />
                            {passwordError && <p className="password-error">{passwordError}</p>}
                            <div className="password-modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleModalClose}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    Xác nhận
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterPanel;

