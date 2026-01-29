import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { clearQTKTCache } from '../../hooks/useQTKTData';
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
                // Update
                await updateDoc(doc(db, 'qtkt_records', editingRecord.id), formData);
                setCategoryState(prev => ({
                    ...prev,
                    records: prev.records.map(r =>
                        r.id === editingRecord.id ? { ...r, ...formData } : r
                    ),
                    message: '✅ Đã cập nhật bản ghi'
                }));
            } else {
                // Add new
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

    return (
        <div className="category-management">
            <div className="page-header">
                <h2>Danh sách quy trình kỹ thuật</h2>
                <div className="header-actions">
                    {!loaded && (
                        <button onClick={loadData} disabled={loading} className="btn-load">
                            {loading ? 'Đang tải...' : '📥 Tải danh mục'}
                        </button>
                    )}
                    {loaded && (
                        <>
                            <button onClick={loadData} disabled={loading} className="btn-secondary">
                                🔄 Làm mới
                            </button>
                            <button onClick={handleAdd} className="btn-primary">
                                ➕ Thêm mới
                            </button>
                        </>
                    )}
                </div>
            </div>

            {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {!loaded && !loading && (
                <div className="empty-state">
                    <p>Nhấn nút "Tải danh mục" để xem danh sách quy trình kỹ thuật</p>
                </div>
            )}

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {loaded && records.length > 0 && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Chuyên khoa</th>
                                <th>Tên QTKT</th>
                                <th>Chuẩn QTKT</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.chuyenkhoa}</td>
                                    <td>{record.tenqtkt}</td>
                                    <td>{record.chuanqtkt}</td>
                                    <td className="actions">
                                        <button
                                            onClick={() => handleEdit(record)}
                                            className="btn-icon edit"
                                            title="Sửa"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(record.id)}
                                            className="btn-icon delete"
                                            title="Xóa"
                                        >
                                            🗑️
                                        </button>
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
