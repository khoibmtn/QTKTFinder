import { useState, useRef } from 'react';
import { parseCSV, readFileAsText } from '../../services/csvParser';
import { batchUploadRecords } from '../../services/firestore';
import { clearQTKTCache } from '../../hooks/useQTKTData';
import './DataImport.css';

const DataImport = () => {
    const [file, setFile] = useState(null);
    const [records, setRecords] = useState([]);
    const [replaceMode, setReplaceMode] = useState('append'); // 'append' or 'replace'
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
    const [message, setMessage] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const cancelRef = useRef(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            await processFile(droppedFile);
        }
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            await processFile(selectedFile);
        }
    };

    const processFile = async (selectedFile) => {
        if (!selectedFile.name.endsWith('.csv')) {
            setMessage('❌ Vui lòng chọn file CSV!');
            return;
        }

        try {
            setMessage('');
            const text = await readFileAsText(selectedFile);
            const parsedRecords = parseCSV(text);
            setFile(selectedFile);
            setRecords(parsedRecords);
            setMessage(`✅ Đã đọc ${parsedRecords.length} bản ghi từ file`);
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.message}`);
            setFile(null);
            setRecords([]);
        }
    };

    const handleUpload = async () => {
        if (records.length === 0) {
            setMessage('❌ Không có dữ liệu để upload!');
            return;
        }

        cancelRef.current = false;
        setUploading(true);
        setMessage('');
        setProgress({ current: 0, total: records.length, phase: 'uploading' });

        try {
            const onProgress = ({ phase, current, total }) => {
                if (cancelRef.current) {
                    throw new Error('CANCELLED');
                }
                setProgress({ phase, current, total });
            };

            const result = await batchUploadRecords(
                records,
                replaceMode === 'replace',
                onProgress
            );

            if (cancelRef.current) {
                setMessage('⚠️ Đã hủy upload');
            } else if (result.success) {
                clearQTKTCache();
                setMessage(`✅ Upload thành công ${result.count} bản ghi!`);
                setFile(null);
                setRecords([]);
            } else {
                setMessage(`❌ Lỗi: ${result.error}`);
            }
        } catch (error) {
            if (error.message === 'CANCELLED') {
                setMessage('⚠️ Đã hủy upload');
            } else {
                setMessage(`❌ Lỗi: ${error.message}`);
            }
        } finally {
            setUploading(false);
            setProgress({ current: 0, total: 0, phase: '' });
        }
    };

    const handleCancel = () => {
        cancelRef.current = true;
    };

    const progressPercent = progress.total > 0
        ? Math.round((progress.current / progress.total) * 100)
        : 0;

    return (
        <div className="data-import">
            <div className="page-header">
                <h2>🏠 Admin - Import dữ liệu CSV</h2>
            </div>

            <div className="import-layout">
                {/* Left Panel - Upload Section */}
                <div className="upload-panel">
                    <div
                        className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <p>Kéo thả file CSV vào đây</p>
                        <span>hoặc</span>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-choose-file"
                        >
                            Chọn file
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        {file && <p className="file-name">📄 {file.name}</p>}
                    </div>

                    <div className="upload-options">
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="mode"
                                value="append"
                                checked={replaceMode === 'append'}
                                onChange={() => setReplaceMode('append')}
                            />
                            <div className="option-content">
                                <strong>Thêm dữ liệu mới</strong>
                                <span>(giữ lại dữ liệu cũ)</span>
                            </div>
                        </label>

                        <label className="radio-option">
                            <input
                                type="radio"
                                name="mode"
                                value="replace"
                                checked={replaceMode === 'replace'}
                                onChange={() => setReplaceMode('replace')}
                            />
                            <div className="option-content">
                                <strong>Ghi đè dữ liệu</strong>
                                <span>(xóa sạch dữ liệu cũ trước khi nạp)</span>
                            </div>
                        </label>
                    </div>

                    <div className="csv-note">
                        <h4>Lưu ý cấu trúc file CSV:</h4>
                        <p>Tệp dữ liệu csv có 4 cột có cùng:</p>
                        <code>qdbanhanh, chuyenkhoa, tenqtkt, chuanqtkt</code>
                    </div>

                    {uploading && (
                        <div className="progress-section">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="progress-info">
                                <span>
                                    {progress.phase === 'deleting' ? '🗑️ Đang xóa: ' : '📤 Đang upload: '}
                                    {progress.current}/{progress.total} ({progressPercent}%)
                                </span>
                                <button onClick={handleCancel} className="btn-cancel-upload">
                                    ❌ Hủy
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={records.length === 0 || uploading}
                        className="btn-upload"
                    >
                        {uploading ? 'Đang upload...' : 'Bắt đầu Upload'}
                    </button>

                    {message && (
                        <div className={`message ${message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'error'}`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Right Panel - Preview */}
                <div className="preview-panel">
                    <div className="preview-header">
                        <h3>Kết quả: <span className="count">{records.length}</span> quy trình</h3>
                    </div>

                    {records.length > 0 ? (
                        <div className="preview-table-wrapper">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th>Số QĐ ban hành</th>
                                        <th>Chuyên khoa</th>
                                        <th>Tên QTKT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record, index) => (
                                        <tr key={index}>
                                            <td>{record.qdbanhanh}</td>
                                            <td>{record.chuyenkhoa}</td>
                                            <td>{record.tenqtkt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-preview">
                            <p>Chọn file CSV để xem trước dữ liệu</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataImport;
