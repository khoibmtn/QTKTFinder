import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, onTabChange }) => {
    const menuItems = [
        { id: 'category', icon: '📋', label: 'Quản lý danh mục' },
        { id: 'import', icon: '📥', label: 'Import dữ liệu' },
        { id: 'config', icon: '⚙️', label: 'Cấu hình' },
        { id: 'password', icon: '🔐', label: 'Đổi mật khẩu' },
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
            </nav>
        </aside>
    );
};

export default AdminSidebar;
