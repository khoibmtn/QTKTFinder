import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const CONFIG_PASSWORD = '123456';

const Header = () => {
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleConfigClick = () => {
        setShowPasswordModal(true);
        setPasswordInput('');
        setPasswordError('');
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === CONFIG_PASSWORD) {
            setShowPasswordModal(false);
            navigate('/admin?tab=config');
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
        <>
            <header className="app-header">
                <div className="header-left">
                    <span className="header-icon">📋</span>
                    <h1 className="app-title">Phòng Kế hoạch - Nghiệp vụ (TTYT Thủy Nguyên): Ứng dụng tra cứu quy trình kỹ thuật</h1>
                </div>
                <div className="header-right">
                    <button
                        type="button"
                        className="btn-settings-header"
                        onClick={handleConfigClick}
                        title="Cấu hình hệ thống"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>
                </div>
            </header>

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
        </>
    );
};

export default Header;
