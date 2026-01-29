import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🔍 Tìm kiếm Quy trình Kỹ thuật</h1>
          <Link to={isAdmin ? '/' : '/admin'} className="admin-toggle">
            {isAdmin ? '← Quay lại tìm kiếm' : '⚙️ Admin'}
          </Link>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>© 2026 QTKT Finder - Powered by Firebase & React</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

