import './Header.css';

const Header = () => {
    return (
        <header className="app-header">
            <div className="header-left">
                <svg className="search-icon-header" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h1 className="app-title">Tra cứu quy trình kỹ thuật</h1>
            </div>
            <div className="header-right">
                <button
                    className="btn-admin"
                    onClick={() => window.location.href = '/admin'} // Simple navigation for now
                >
                    <span className="icon-settings">⚙️</span>
                    Admin
                </button>
            </div>
        </header>
    );
};

export default Header;
