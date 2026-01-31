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
            navigate('/admin');
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
                        ⚙️
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
