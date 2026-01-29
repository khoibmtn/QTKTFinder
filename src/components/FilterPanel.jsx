import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FilterPanel.css';

const CONFIG_PASSWORD = '123456';

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
        const password = prompt('Nhập mật khẩu để vào khu vực cài đặt:');
        if (password === CONFIG_PASSWORD) {
            navigate('/admin');
        } else if (password !== null) {
            alert('Mật khẩu không đúng!');
        }
    };

    return (
        <div className="filter-panel">
            <h3 className="filter-title">Bộ lọc tìm kiếm</h3>

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
                </div>

                {!isInstantSearch && (
                    <button className="btn-search" onClick={handleSearchTrigger}>
                        Tìm kiếm
                    </button>
                )}

                <button type="button" className="btn-config" onClick={handleConfigClick}>
                    ⚙️ Cấu hình
                </button>
            </div>
        </div>
    );
};

export default FilterPanel;
