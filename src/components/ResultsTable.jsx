import './ResultsTable.css';

const ResultsTable = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>Không tìm thấy kết quả</h3>
                <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
        );
    }

    return (
        <div className="results-container">
            <div className="results-header">
                <h3>Kết quả: <span className="count">{data.length}</span> quy trình</h3>
            </div>

            <div className="table-wrapper">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Số QĐ ban hành</th>
                            <th>Chuyên khoa</th>
                            <th>Tên QTKT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((record) => (
                            <tr key={record.id}>
                                <td>{record.qdbanhanh}</td>
                                <td>{record.chuyenkhoa}</td>
                                <td>{record.tenqtkt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable;
