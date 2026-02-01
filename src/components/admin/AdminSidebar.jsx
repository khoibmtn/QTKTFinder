import { Link } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, onTabChange }) => {
    const menuItems = [
        { id: 'category', icon: '📋', label: 'Quản lý danh mục' },
        { id: 'import', icon: '📥', label: 'Import dữ liệu' },
        { id: 'config', icon: '⚙️', label: 'Cấu hình' },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h2>Admin</h2>
                <div className="admin-badge">
                    <span className="admin-icon">👤</span>
                    <span>Admin</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => onTabChange(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}

                <Link to="/" className="nav-item nav-back">
                    <span className="nav-icon">←</span>
                    <span className="nav-label">Quay lại tìm kiếm</span>
                </Link>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
