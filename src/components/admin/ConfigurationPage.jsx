import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { updateAccessCode } from '../../services/firestore';
import './ConfigurationPage.css';

// Color palette matching the mockup - light row (pastel) and dark row (solid)
const PRESET_COLORS = [
    // Light/pastel colors (top row)
    { value: '#E0E0E0', label: 'Xám nhạt' },
    { value: '#FFEBEE', label: 'Hồng nhạt' },
    { value: '#FFE0B2', label: 'Cam nhạt' },
    { value: '#FFF9C4', label: 'Vàng nhạt' },
    { value: '#DCEDC8', label: 'Xanh lá nhạt' },
    { value: '#B3E5FC', label: 'Xanh dương nhạt' },
    { value: '#E0F7FA', label: 'Cyan nhạt' },
    { value: '#E8EAF6', label: 'Tím nhạt' },
    // Dark/solid colors (bottom row)
    { value: '#424242', label: 'Xám đậm' },
    { value: '#C62828', label: 'Đỏ' },
    { value: '#6D4C41', label: 'Nâu' },
    { value: '#33691E', label: 'Xanh lá đậm' },
    { value: '#1B5E20', label: 'Xanh đậm' },
    { value: '#0D47A1', label: 'Xanh dương' },
    { value: '#01579B', label: 'Xanh navy' },
    { value: '#4A148C', label: 'Tím đậm' },
];

const FIELD_OPTIONS = [
    { value: 'qdbanhanh', label: 'QĐ ban hành' },
    { value: 'chuyenkhoa', label: 'Chuyên khoa' },
    { value: 'tenqtkt', label: 'Tên QTKT' },
];

// Text color icon (A with underline)
const TextColorIcon = ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <text x="6" y="16" fontSize="14" fontWeight="bold" fill={color || '#666'}>A</text>
        <rect x="4" y="18" width="16" height="3" fill={color || '#C62828'} rx="1" />
    </svg>
);

// Background color icon (paint bucket)
const BgColorIcon = ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M19 11.5s-2 2.17-2 3.5a2 2 0 1 0 4 0c0-1.33-2-3.5-2-3.5z" fill={color || '#666'} />
        <path d="M5.21 10.79L10 6l6.5 6.5a2.5 2.5 0 0 1 0 3.54L12.04 20.5a2.5 2.5 0 0 1-3.54 0L3.04 15A2.5 2.5 0 0 1 3.04 11.46L5.21 10.79z" fill={color || '#4CAF50'} stroke="#333" strokeWidth="1" />
    </svg>
);

const ColorPicker = ({ value, onChange, onReset, type }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [customColor, setCustomColor] = useState(value || '#000000');

    const handleColorSelect = (color) => {
        onChange(color);
        setShowPicker(false);
    };

    const handleReset = () => {
        onReset();
        setShowPicker(false);
    };

    return (
        <div className="color-picker-wrapper">
            <div
                className="color-icon-btn"
                onClick={() => setShowPicker(!showPicker)}
                title={type === 'text' ? 'Màu chữ' : 'Màu nền'}
            >
                {type === 'text' ? (
                    <TextColorIcon color={value} />
                ) : (
                    <BgColorIcon color={value} />
                )}
                <span className="dropdown-arrow">▼</span>
            </div>
            {showPicker && (
                <>
                    <div className="color-dropdown-overlay" onClick={() => setShowPicker(false)} />
                    <div className="color-dropdown">
                        <div className="color-dropdown-header">COLOURS</div>
                        <div className="color-grid">
                            {PRESET_COLORS.map((color) => (
                                <div
                                    key={color.value}
                                    className={`color-circle ${value === color.value ? 'selected' : ''}`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => handleColorSelect(color.value)}
                                    title={color.label}
                                />
                            ))}
                        </div>
                        <div className="custom-color-section">
                            <span className="custom-label">Custom</span>
                            <input
                                type="color"
                                value={customColor}
                                onChange={(e) => {
                                    setCustomColor(e.target.value);
                                    onChange(e.target.value);
                                }}
                                className="custom-color-input"
                            />
                        </div>
                        <button onClick={handleReset} className="reset-btn">
                            🚫 Reset
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const ConfigurationPage = ({ chuanQTKTOptions, setChuanQTKTOptions }) => {
    const [newCode, setNewCode] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // Color rules state
    const [colorRules, setColorRules] = useState({
        chuanCu: { textColor: null, bgColor: null },
        chuanMoi: { textColor: null, bgColor: null },
        customRules: []
    });

    // New chuẩn QTKT input
    const [newChuanName, setNewChuanName] = useState('');
    const [editingChuan, setEditingChuan] = useState(null);

    // Quick access links - now array-based with id, name, url, icon
    const [quickLinks, setQuickLinks] = useState([]);
    const [newLinkName, setNewLinkName] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

    useEffect(() => {
        loadColorRules();
        loadQuickLinks();
    }, []);

    const loadColorRules = async () => {
        try {
            const docRef = doc(db, 'settings', 'colorRules');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setColorRules(docSnap.data());
            }
        } catch (error) {
            console.error('Error loading color rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveColorRules = async (newRules) => {
        try {
            await setDoc(doc(db, 'settings', 'colorRules'), newRules);
            setColorRules(newRules);
            setMessage('✅ Đã lưu cài đặt màu sắc');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Firestore error:', error);
            setMessage(`❌ Lỗi: ${error.message}`);
        }
    };

    const loadQuickLinks = async () => {
        try {
            const docRef = doc(db, 'settings', 'quickLinks');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Check if it's the new array format or old object format
                if (Array.isArray(data.links)) {
                    setQuickLinks(data.links);
                } else {
                    // Migrate old format to new format
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
                            id: `link_${key}_${Date.now()}`,
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

    const saveQuickLinks = async (links) => {
        try {
            await setDoc(doc(db, 'settings', 'quickLinks'), { links });
            setQuickLinks(links);
            setMessage('✅ Đã lưu cấu hình liên kết');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Firestore error:', error);
            setMessage(`❌ Lỗi: ${error.message}`);
        }
    };

    const addQuickLink = () => {
        if (!newLinkName.trim() || !newLinkUrl.trim()) {
            setMessage('❌ Vui lòng nhập cả tên và URL');
            return;
        }
        const newLink = {
            id: `link_${Date.now()}`,
            name: newLinkName.trim(),
            url: newLinkUrl.trim(),
            icon: '🔗'
        };
        const newLinks = [...quickLinks, newLink];
        saveQuickLinks(newLinks);
        setNewLinkName('');
        setNewLinkUrl('');
    };

    const updateQuickLink = (id, field, value) => {
        const newLinks = quickLinks.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        );
        setQuickLinks(newLinks);
    };

    const saveQuickLinkUpdate = () => {
        saveQuickLinks(quickLinks);
    };

    const deleteQuickLink = (id) => {
        const newLinks = quickLinks.filter(link => link.id !== id);
        saveQuickLinks(newLinks);
    };

    const moveQuickLink = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= quickLinks.length) return;

        const newLinks = [...quickLinks];
        const temp = newLinks[index];
        newLinks[index] = newLinks[newIndex];
        newLinks[newIndex] = temp;
        saveQuickLinks(newLinks);
    };

    const saveChuanQTKTOptions = async (options) => {
        try {
            await setDoc(doc(db, 'settings', 'chuanQTKT'), { options });
            setChuanQTKTOptions(options);
            setMessage('✅ Đã lưu cấu hình chuẩn QTKT');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Firestore error:', error);
            setMessage(`❌ Lỗi: ${error.message}`);
        }
    };

    const handleChangeCode = async () => {
        if (!newCode || newCode.length < 4) {
            setMessage('❌ Mã mới phải có ít nhất 4 ký tự!');
            return;
        }

        const result = await updateAccessCode(newCode);
        if (result.success) {
            setMessage('✅ Đã đổi mã truy cập thành công!');
            setNewCode('');
        } else {
            setMessage(`❌ Lỗi: ${result.error}`);
        }
    };

    const updateChuanColor = (type, field, value) => {
        const newRules = {
            ...colorRules,
            [type]: { ...colorRules[type], [field]: value }
        };
        saveColorRules(newRules);
    };

    const resetChuanColor = (type, field) => {
        const newRules = {
            ...colorRules,
            [type]: { ...colorRules[type], [field]: null }
        };
        saveColorRules(newRules);
    };

    const addChuanQTKT = () => {
        if (!newChuanName.trim()) return;
        const newOption = { value: newChuanName.trim(), label: newChuanName.trim() };
        const newOptions = [...chuanQTKTOptions, newOption];
        saveChuanQTKTOptions(newOptions);
        setNewChuanName('');
    };

    const updateChuanQTKT = (oldValue, newValue) => {
        const newOptions = chuanQTKTOptions.map(opt =>
            opt.value === oldValue ? { value: newValue, label: newValue } : opt
        );
        saveChuanQTKTOptions(newOptions);
        setEditingChuan(null);
    };

    const deleteChuanQTKT = (value) => {
        if (chuanQTKTOptions.length <= 1) {
            setMessage('❌ Phải giữ ít nhất 1 loại chuẩn QTKT');
            return;
        }
        const newOptions = chuanQTKTOptions.filter(opt => opt.value !== value);
        saveChuanQTKTOptions(newOptions);
    };

    const addCustomRule = () => {
        const newRule = {
            id: `rule_${Date.now()}`,
            field: 'chuyenkhoa',
            keyword: '',
            textColor: null,
            bgColor: null
        };
        const newRules = {
            ...colorRules,
            customRules: [...(colorRules.customRules || []), newRule]
        };
        setColorRules(newRules);
    };

    const updateCustomRule = (id, field, value, shouldSave = false) => {
        const newRules = {
            ...colorRules,
            customRules: (colorRules.customRules || []).map(rule =>
                rule.id === id ? { ...rule, [field]: value } : rule
            )
        };
        setColorRules(newRules);
        // Save immediately with the new rules to avoid stale closure issue
        if (shouldSave) {
            saveColorRules(newRules);
        }
    };

    const saveCustomRule = () => {
        saveColorRules(colorRules);
    };

    const deleteCustomRule = (id) => {
        const newRules = {
            ...colorRules,
            customRules: (colorRules.customRules || []).filter(rule => rule.id !== id)
        };
        saveColorRules(newRules);
    };

    if (loading) {
        return <div className="config-loading">Đang tải cài đặt...</div>;
    }

    return (
        <div className="configuration-page">
            <div className="config-card">
                <h2>Cấu hình hệ thống</h2>

                {message && (
                    <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                {/* Section 1: Chuẩn QTKT Options */}
                <section className="config-section">
                    <h3>Cấu hình Chuẩn QTKT</h3>
                    <p className="section-desc">Danh sách các loại chuẩn QTKT dùng trong quản lý danh mục</p>

                    <div className="chuan-list">
                        {chuanQTKTOptions.map((opt) => (
                            <div key={opt.value} className="chuan-item">
                                {editingChuan === opt.value ? (
                                    <input
                                        type="text"
                                        defaultValue={opt.label}
                                        autoFocus
                                        onBlur={(e) => updateChuanQTKT(opt.value, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && updateChuanQTKT(opt.value, e.target.value)}
                                    />
                                ) : (
                                    <>
                                        <span className="chuan-label">{opt.label}</span>
                                        <div className="chuan-actions">
                                            <button
                                                onClick={() => setEditingChuan(opt.value)}
                                                className="btn-icon-small"
                                                title="Sửa"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => deleteChuanQTKT(opt.value)}
                                                className="btn-icon-small"
                                                title="Xóa"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="add-chuan-form">
                        <input
                            type="text"
                            placeholder="Thêm loại chuẩn mới..."
                            value={newChuanName}
                            onChange={(e) => setNewChuanName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addChuanQTKT()}
                        />
                        <button onClick={addChuanQTKT} className="btn-add-small">
                            ➕
                        </button>
                    </div>
                </section>

                {/* Section 2: Standard Color Rules */}
                <section className="config-section">
                    <h3>Quy tắc hiển thị màu sắc theo chuẩn</h3>

                    <div
                        className="color-rule-row"
                        style={{
                            color: colorRules.chuanCu?.textColor || undefined,
                            backgroundColor: colorRules.chuanCu?.bgColor || undefined
                        }}
                    >
                        <span className="rule-label">QTKT theo chuẩn cũ</span>
                        <div className="color-pickers-inline">
                            <div className="picker-with-label">
                                <span>Màu chữ</span>
                                <ColorPicker
                                    value={colorRules.chuanCu?.textColor}
                                    onChange={(color) => updateChuanColor('chuanCu', 'textColor', color)}
                                    onReset={() => resetChuanColor('chuanCu', 'textColor')}
                                    type="text"
                                />
                            </div>
                            <div className="picker-with-label">
                                <span>Màu nền</span>
                                <ColorPicker
                                    value={colorRules.chuanCu?.bgColor}
                                    onChange={(color) => updateChuanColor('chuanCu', 'bgColor', color)}
                                    onReset={() => resetChuanColor('chuanCu', 'bgColor')}
                                    type="bg"
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        className="color-rule-row"
                        style={{
                            color: colorRules.chuanMoi?.textColor || undefined,
                            backgroundColor: colorRules.chuanMoi?.bgColor || undefined
                        }}
                    >
                        <span className="rule-label">QTKT theo chuẩn mới</span>
                        <div className="color-pickers-inline">
                            <div className="picker-with-label">
                                <span>Màu chữ</span>
                                <ColorPicker
                                    value={colorRules.chuanMoi?.textColor}
                                    onChange={(color) => updateChuanColor('chuanMoi', 'textColor', color)}
                                    onReset={() => resetChuanColor('chuanMoi', 'textColor')}
                                    type="text"
                                />
                            </div>
                            <div className="picker-with-label">
                                <span>Màu nền</span>
                                <ColorPicker
                                    value={colorRules.chuanMoi?.bgColor}
                                    onChange={(color) => updateChuanColor('chuanMoi', 'bgColor', color)}
                                    onReset={() => resetChuanColor('chuanMoi', 'bgColor')}
                                    type="bg"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Custom Keyword Rules */}
                <section className="config-section">
                    <h3>Tùy chỉnh màu theo từ khóa</h3>

                    <div className="custom-rules-list">
                        {(colorRules.customRules || []).map((rule) => (
                            <div key={rule.id} className="custom-rule-row">
                                <select
                                    value={rule.field}
                                    onChange={(e) => {
                                        updateCustomRule(rule.id, 'field', e.target.value);
                                    }}
                                >
                                    {FIELD_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    placeholder="từ khóa"
                                    value={rule.keyword}
                                    onChange={(e) => updateCustomRule(rule.id, 'keyword', e.target.value)}
                                    onBlur={saveCustomRule}
                                />

                                <div className="picker-group-inline">
                                    <ColorPicker
                                        value={rule.textColor}
                                        onChange={(color) => {
                                            updateCustomRule(rule.id, 'textColor', color, true);
                                        }}
                                        onReset={() => {
                                            updateCustomRule(rule.id, 'textColor', null, true);
                                        }}
                                        type="text"
                                    />
                                    <ColorPicker
                                        value={rule.bgColor}
                                        onChange={(color) => {
                                            updateCustomRule(rule.id, 'bgColor', color, true);
                                        }}
                                        onReset={() => {
                                            updateCustomRule(rule.id, 'bgColor', null, true);
                                        }}
                                        type="bg"
                                    />
                                </div>

                                <button
                                    onClick={() => deleteCustomRule(rule.id)}
                                    className="btn-delete"
                                    title="Xóa quy tắc"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    <button onClick={addCustomRule} className="btn-add-rule">
                        <span className="plus-icon">+</span>
                        Thêm quy tắc mới
                    </button>
                </section>

                {/* Section 5: Quick Access Links */}
                <section className="config-section">
                    <h3>Liên kết truy cập nhanh</h3>
                    <p className="section-desc">Cấu hình các đường link hiển thị ở trang tìm kiếm. Kéo thả để sắp xếp thứ tự.</p>

                    <div className="quick-links-list">
                        {quickLinks.map((link, index) => (
                            <div key={link.id} className="quick-link-row">
                                <div className="reorder-buttons">
                                    <button
                                        onClick={() => moveQuickLink(index, -1)}
                                        className="btn-reorder"
                                        title="Di chuyển lên"
                                        disabled={index === 0}
                                    >
                                        ↑
                                    </button>
                                    <button
                                        onClick={() => moveQuickLink(index, 1)}
                                        className="btn-reorder"
                                        title="Di chuyển xuống"
                                        disabled={index === quickLinks.length - 1}
                                    >
                                        ↓
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Tên hiển thị"
                                    value={link.name}
                                    onChange={(e) => updateQuickLink(link.id, 'name', e.target.value)}
                                    onBlur={saveQuickLinkUpdate}
                                    className="link-name-input"
                                />

                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={link.url}
                                    onChange={(e) => updateQuickLink(link.id, 'url', e.target.value)}
                                    onBlur={saveQuickLinkUpdate}
                                    className="link-url-input"
                                />

                                <button
                                    onClick={() => deleteQuickLink(link.id)}
                                    className="btn-delete"
                                    title="Xóa liên kết"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="add-quick-link-form">
                        <input
                            type="text"
                            placeholder="Tên hiển thị..."
                            value={newLinkName}
                            onChange={(e) => setNewLinkName(e.target.value)}
                            className="link-name-input"
                        />
                        <input
                            type="url"
                            placeholder="https://..."
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addQuickLink()}
                            className="link-url-input"
                        />
                        <button onClick={addQuickLink} className="btn-add-small">
                            ➕
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ConfigurationPage;
