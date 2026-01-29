import { useState } from 'react';
import { parseCSV, readFileAsText } from '../services/csvParser';
import { batchUploadRecords, getAccessCode, updateAccessCode } from '../services/firestore';
import { clearQTKTCache } from '../hooks/useQTKTData';
import './AdminUpload.css';

const AdminUpload = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputCode, setInputCode] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [replaceAll, setReplaceAll] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [showChangeCode, setShowChangeCode] = useState(false);
    const [newCode, setNewCode] = useState('');

    const handleLogin = async () => {
        const correctCode = await getAccessCode();
        if (inputCode === correctCode) {
            setIsAuthenticated(true);
            setMessage('');
        } else {
            setMessage('Mã truy cập không đúng!');
        }
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            setMessage('Vui lòng chọn file CSV!');
            return;
        }

        try {
            const text = await readFileAsText(selectedFile);
            const records = parseCSV(text);
            const totalLines = text.split('\n').filter(l => l.trim()).length - 1;
            setFile(selectedFile);
            setPreview(records.slice(0, 5)); // Show first 5 records
            setMessage(`Đã parse ${records.length} bản ghi từ ${totalLines} dòng. Xem trước 5 bản ghi đầu tiên.`);
        } catch (error) {
            setMessage(`Lỗi: ${error.message}`);
            setFile(null);
            setPreview([]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Vui lòng chọn file CSV!');
            return;
        }

        setUploading(true);
        setMessage('Đang xử lý...');

        try {
            const text = await readFileAsText(file);
            const records = parseCSV(text);

            // Progress callback
            const onProgress = ({ phase, current, total }) => {
                const percent = Math.round((current / total) * 100);
                if (phase === 'deleting') {
                    setMessage(`🗑️ Đang xóa dữ liệu cũ... ${current}/${total} (${percent}%)`);
                } else {
                    setMessage(`📤 Đang upload... ${current}/${total} (${percent}%)`);
                }
            };

            const result = await batchUploadRecords(records, replaceAll, onProgress);

            if (result.success) {
                // Clear cache so users get fresh data
                clearQTKTCache();

                const totalLines = text.split('\n').filter(l => l.trim()).length - 1; // Exclude header
                setMessage(`✅ Upload thành công ${result.count} bản ghi! (Tổng ${totalLines} dòng trong file)`);
                setFile(null);
                setPreview([]);
            } else {
                setMessage(`❌ Lỗi: ${result.error}`);
            }
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleChangeCode = async () => {
        if (!newCode || newCode.length < 4) {
            setMessage('Mã mới phải có ít nhất 4 ký tự!');
            return;
        }

        const result = await updateAccessCode(newCode);
        if (result.success) {
            setMessage('✅ Đã đổi mã truy cập thành công!');
            setNewCode('');
            setShowChangeCode(false);
        } else {
            setMessage(`❌ Lỗi: ${result.error}`);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login">
                <div className="login-card">
                    <h2>🔒 Admin Upload</h2>
                    <p>Nhập mã truy cập để tiếp tục</p>
                    <input
                        type="password"
                        placeholder="Mã truy cập"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        className="code-input"
                    />
                    <button onClick={handleLogin} className="btn-primary">
                        Đăng nhập
                    </button>
                    {message && <p className="error-message">{message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="admin-upload">
            <div className="admin-header">
                <h2>📤 Upload Dữ liệu CSV</h2>
                <button
                    onClick={() => setShowChangeCode(!showChangeCode)}
                    className="btn-secondary"
                >
                    Đổi mã truy cập
                </button>
            </div>

            {showChangeCode && (
                <div className="change-code-section">
                    <input
                        type="password"
                        placeholder="Mã mới (tối thiểu 4 ký tự)"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="code-input"
                    />
                    <button onClick={handleChangeCode} className="btn-primary">
                        Xác nhận
                    </button>
                </div>
            )}

            <div className="upload-section">
                <div className="file-input-wrapper">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        id="csv-file"
                        className="file-input"
                    />
                    <label htmlFor="csv-file" className="file-label">
                        {file ? file.name : 'Chọn file CSV'}
                    </label>
                </div>

                <div className="upload-options">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={replaceAll}
                            onChange={(e) => setReplaceAll(e.target.checked)}
                        />
                        <span>Xóa dữ liệu cũ và thay thế hoàn toàn</span>
                    </label>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="btn-upload"
                >
                    {uploading ? 'Đang upload...' : 'Upload'}
                </button>

                {message && (
                    <div className={`message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
                        {message}
                    </div>
                )}
            </div>

            {preview.length > 0 && (
                <div className="preview-section">
                    <h3>Xem trước dữ liệu</h3>
                    <div className="preview-table-wrapper">
                        <table className="preview-table">
                            <thead>
                                <tr>
                                    <th>Chuẩn QTKT</th>
                                    <th>Số QĐ</th>
                                    <th>Chuyên khoa</th>
                                    <th>Tên QTKT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((record, index) => (
                                    <tr key={index}>
                                        <td>{record.chuanqtkt}</td>
                                        <td>{record.qdbanhanh}</td>
                                        <td>{record.chuyenkhoa}</td>
                                        <td>{record.tenqtkt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUpload;
