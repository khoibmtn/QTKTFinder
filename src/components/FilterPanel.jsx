import './FilterPanel.css';

const FilterPanel = ({
    chuanQTKT,
    onChuanQTKTChange,
    chuyenkhoa,
    onChuyenkhoaChange
}) => {
    return (
        <div className="filter-panel">
            <div className="filter-group">
                <label htmlFor="chuan-qtkt">Chuẩn QTKT:</label>
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
                <label htmlFor="chuyenkhoa">Chuyên khoa:</label>
                <input
                    id="chuyenkhoa"
                    type="text"
                    placeholder="Nhập chuyên khoa..."
                    value={chuyenkhoa}
                    onChange={(e) => onChuyenkhoaChange(e.target.value)}
                    className="filter-input"
                />
            </div>
        </div>
    );
};

export default FilterPanel;
