import { useState, useRef } from 'react';
import { parseCSV, readFileAsText } from '../../services/csvParser';
import { batchUploadRecords } from '../../services/firestore';
import { clearQTKTCache } from '../../hooks/useQTKTData';
import * as XLSX from 'xlsx';
import './DataImport.css';

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
const ACCEPT_STRING = '.csv,.xlsx,.xls';

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
        const fileName = selectedFile.name.toLowerCase();
        const isValidFile = ACCEPTED_EXTENSIONS.some(ext => fileName.endsWith(ext));

        if (!isValidFile) {
            setMessage('❌ Vui lòng chọn file CSV hoặc Excel (.xlsx, .xls)!');
            return;
        }

        try {
            setMessage('');
            let parsedRecords;

            if (fileName.endsWith('.csv')) {
                const text = await readFileAsText(selectedFile);
                parsedRecords = parseCSV(text);
            } else {
                parsedRecords = await parseExcelFile(selectedFile);
            }

            setFile(selectedFile);
            setRecords(parsedRecords);
            setMessage(`✅ Đã đọc ${parsedRecords.length} bản ghi từ file`);
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.message}`);
            setFile(null);
            setRecords([]);
        }
    };

    const parseExcelFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                    if (jsonData.length === 0) {
                        reject(new Error('File Excel không có dữ liệu'));
                        return;
                    }

                    // Map columns - support both exact and Vietnamese header names
                    const headerMap = {
                        'qdbanhanh': 'qdbanhanh',
                        'chuyenkhoa': 'chuyenkhoa',
                        'tenqtkt': 'tenqtkt',
                        'chuanqtkt': 'chuanqtkt',
                        'số qđ ban hành': 'qdbanhanh',
                        'so qd ban hanh': 'qdbanhanh',
                        'chuyên khoa': 'chuyenkhoa',
                        'chuyen khoa': 'chuyenkhoa',
                        'tên qtkt': 'tenqtkt',
                        'ten qtkt': 'tenqtkt',
                        'chuẩn qtkt': 'chuanqtkt',
                        'chuan qtkt': 'chuanqtkt',
                    };

                    const firstRow = jsonData[0];
                    const actualHeaders = Object.keys(firstRow);
                    const mapping = {};

                    actualHeaders.forEach(h => {
                        const normalized = h.trim().toLowerCase();
                        if (headerMap[normalized]) {
                            mapping[h] = headerMap[normalized];
                        }
                    });

                    const requiredFields = ['qdbanhanh', 'chuyenkhoa', 'tenqtkt', 'chuanqtkt'];
                    const mappedFields = Object.values(mapping);
                    const missingFields = requiredFields.filter(f => !mappedFields.includes(f));

                    if (missingFields.length > 0) {
                        reject(new Error(
                            `Thiếu cột: ${missingFields.join(', ')}. ` +
                            `Các cột tìm thấy: ${actualHeaders.join(', ')}`
                        ));
                        return;
                    }

                    const records = jsonData.map(row => {
                        const record = {};
                        Object.entries(mapping).forEach(([excelCol, fieldName]) => {
                            record[fieldName] = String(row[excelCol] || '').trim();
                        });
                        return record;
                    });

                    console.log(`✅ Parsed ${records.length} records from Excel (sheet: ${sheetName})`);
                    resolve(records);
                } catch (err) {
                    reject(new Error(`Lỗi đọc file Excel: ${err.message}`));
                }
            };
            reader.onerror = () => reject(new Error('Không thể đọc file'));
            reader.readAsArrayBuffer(file);
        });
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
                <h2>🏠 Admin - Import dữ liệu</h2>
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
                        <p>Kéo thả file CSV hoặc Excel vào đây</p>
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
                            accept={ACCEPT_STRING}
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
                        <h4>Lưu ý cấu trúc file:</h4>
                        <p>Hỗ trợ file <strong>CSV</strong>, <strong>Excel (.xlsx, .xls)</strong></p>
                        <p>File cần có 4 cột:</p>
                        <code>qdbanhanh, chuyenkhoa, tenqtkt, chuanqtkt</code>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>Hoặc tiếng Việt: Số QĐ ban hành, Chuyên khoa, Tên QTKT, Chuẩn QTKT</p>
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
                                        <th>Chuẩn QTKT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record, index) => (
                                        <tr key={index}>
                                            <td>{record.qdbanhanh}</td>
                                            <td>{record.chuyenkhoa}</td>
                                            <td>{record.tenqtkt}</td>
                                            <td>{record.chuanqtkt}</td>
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
