import { useState } from 'react';
import { useQTKTData } from './hooks/useQTKTData';
import { useSearch } from './hooks/useSearch';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import ResultsTable from './components/ResultsTable';
import AdminUpload from './components/AdminUpload';
import './App.css';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const { records, loading } = useQTKTData();

  const {
    searchQuery,
    setSearchQuery,
    chuanQTKTFilter,
    setChuanQTKTFilter,
    chuyenkhoaFilter,
    setChuyenkhoaFilter,
    filteredData
  } = useSearch(records);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🔍 Tìm kiếm Quy trình Kỹ thuật</h1>
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="admin-toggle"
          >
            {showAdmin ? '← Quay lại tìm kiếm' : '⚙️ Admin'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {showAdmin ? (
          <AdminUpload />
        ) : (
          <div className="search-section">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />

            <FilterPanel
              chuanQTKT={chuanQTKTFilter}
              onChuanQTKTChange={setChuanQTKTFilter}
              chuyenkhoa={chuyenkhoaFilter}
              onChuyenkhoaChange={setChuyenkhoaFilter}
            />

            <ResultsTable
              data={filteredData}
              loading={loading}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 QTKT Finder - Powered by Firebase & React</p>
      </footer>
    </div>
  );
}

export default App;
