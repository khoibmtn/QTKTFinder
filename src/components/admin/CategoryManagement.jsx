import { useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { clearQTKTCache } from '../../hooks/useQTKTData';
import { Edit, Trash2, RefreshCw, Download, Plus, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import './CategoryManagement.css';

const CategoryManagement = ({ categoryState, setCategoryState, chuanQTKTOptions }) => {
    const { records, loaded, message } = categoryState;
    const [loading, setLoading] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        qdbanhanh: '',
        chuyenkhoa: '',
        tenqtkt: '',
        chuanqtkt: 'Thông thường'
    });

    const setMessage = (msg) => {
        setCategoryState(prev => ({ ...prev, message: msg }));
    };

    const loadData = async () => {
        setLoading(true);
        setMessage('');
        try {
            const snapshot = await getDocs(collection(db, 'qtkt_records'));
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategoryState({
                records: data,
                loaded: true,
                message: `✅ Đã tải ${data.length} bản ghi`
            });
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa bản ghi này?')) return;
        try {
            await deleteDoc(doc(db, 'qtkt_records', id));
            setCategoryState(prev => ({
                ...prev,
                records: prev.records.filter(r => r.id !== id),
                message: '✅ Đã xóa bản ghi'
            }));
            clearQTKTCache();
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.message}`);
        }
    };

    const handleDownloadExcel = () => {
        if (!records || records.length === 0) {
            setMessage('❌ Không có dữ liệu để tải xuống');
            return;
        }
        const exportData = records.map((record, index) => ({
            'STT': index + 1,
            'Số QĐ ban hành': record.qdbanhanh || '',
            'Chuyên khoa': record.chuyenkhoa || '',
            'Tên QTKT': record.tenqtkt || '',
            'Chuẩn QTKT': record.chuanqtkt || ''
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        worksheet['!cols'] = [
            { wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 60 }, { wch: 15 },
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh mục QTKT');
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        XLSX.writeFile(workbook, `Danh_muc_QTKT_${dateStr}.xlsx`);
        setMessage(`✅ Đã tải xuống file Excel (${records.length} bản ghi)`);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setFormData({
            qdbanhanh: record.qdbanhanh || '',
            chuyenkhoa: record.chuyenkhoa || '',
            tenqtkt: record.tenqtkt || '',
            chuanqtkt: record.chuanqtkt || 'Thông thường'
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingRecord(null);
        setFormData({
            qdbanhanh: '',
            chuyenkhoa: '',
            tenqtkt: '',
            chuanqtkt: chuanQTKTOptions.length > 0 ? chuanQTKTOptions[0].value : 'Thông thường'
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.tenqtkt.trim()) {
            setMessage('❌ Vui lòng nhập tên QTKT');
            return;
        }
        try {
            if (editingRecord) {
                await updateDoc(doc(db, 'qtkt_records', editingRecord.id), formData);
                setCategoryState(prev => ({
                    ...prev,
                    records: prev.records.map(r =>
                        r.id === editingRecord.id ? { ...r, ...formData } : r
                    ),
                    message: '✅ Đã cập nhật bản ghi'
                }));
            } else {
                const docRef = await addDoc(collection(db, 'qtkt_records'), formData);
                setCategoryState(prev => ({
                    ...prev,
                    records: [...prev.records, { id: docRef.id, ...formData }],
                    message: '✅ Đã thêm bản ghi mới'
                }));
            }
            clearQTKTCache();
            setShowModal(false);
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.message}`);
        }
    };

    const getChuanBadgeClass = (chuan) => {
        if (!chuan) return 'badge badge-old';
        return chuan.toLowerCase().includes('mới') ? 'badge badge-new' : 'badge badge-old';
    };

    return (
        <div className="category-management">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Danh sách quy trình kỹ thuật</h2>
                    {loaded && <div className="record-count">Tổng cộng {records.length} bản ghi</div>}
                </div>
                <div className="header-actions">
                    {!loaded ? (
                        <button onClick={loadData} disabled={loading} className="btn-load">
                            {loading
                                ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Đang tải...</>
                                : <><Download size={15} /> Tải danh mục</>
                            }
                        </button>
                    ) : (
                        <>
                            <button onClick={loadData} disabled={loading} className="btn-refresh">
                                <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Làm mới
                            </button>
                            <button onClick={handleDownloadExcel} className="btn-download">
                                <Download size={14} /> Tải Excel
                            </button>
                            <button onClick={handleAdd} className="btn-primary">
                                <Plus size={14} /> Thêm mới
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {/* Empty state */}
            {!loaded && !loading && (
                <div className="empty-state">
                    <p>Nhấn nút "Tải danh mục" để xem danh sách quy trình kỹ thuật</p>
                </div>
            )}

            {/* Loading state */}
            {loading && !loaded && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {/* Table */}
            {loaded && records.length > 0 && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Số QĐ ban hành</th>
                                <th>Chuyên khoa</th>
                                <th>Tên QTKT</th>
                                <th>Chuẩn QTKT</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.qdbanhanh || '—'}</td>
                                    <td>{record.chuyenkhoa || '—'}</td>
                                    <td>{record.tenqtkt || '—'}</td>
                                    <td>
                                        <span className={getChuanBadgeClass(record.chuanqtkt)}>
                                            {record.chuanqtkt || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                onClick={() => handleEdit(record)}
                                                className="btn-icon edit"
                                                title="Sửa"
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(record.id)}
                                                className="btn-icon delete"
                                                title="Xóa"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>{editingRecord ? 'Sửa bản ghi' : 'Thêm bản ghi mới'}</h3>

                        <div className="form-group">
                            <label>Số QĐ ban hành</label>
                            <input
                                type="text"
                                value={formData.qdbanhanh}
                                onChange={e => setFormData({ ...formData, qdbanhanh: e.target.value })}
                                placeholder="VD: QĐ số: 1234/QĐ-BYT ngày 01/01/2024"
                            />
                        </div>

                        <div className="form-group">
                            <label>Chuyên khoa</label>
                            <input
                                type="text"
                                value={formData.chuyenkhoa}
                                onChange={e => setFormData({ ...formData, chuyenkhoa: e.target.value })}
                                placeholder="VD: Nội khoa"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tên QTKT *</label>
                            <input
                                type="text"
                                value={formData.tenqtkt}
                                onChange={e => setFormData({ ...formData, tenqtkt: e.target.value })}
                                placeholder="Nhập tên quy trình kỹ thuật"
                            />
                        </div>

                        <div className="form-group">
                            <label>Chuẩn QTKT</label>
                            <select
                                value={formData.chuanqtkt}
                                onChange={e => setFormData({ ...formData, chuanqtkt: e.target.value })}
                            >
                                {chuanQTKTOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowModal(false)} className="btn-cancel">
                                Hủy
                            </button>
                            <button onClick={handleSave} className="btn-save">
                                💾 Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
