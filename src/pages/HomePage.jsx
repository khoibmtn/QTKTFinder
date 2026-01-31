import { useQTKTData } from '../hooks/useQTKTData';
import { useSearch } from '../hooks/useSearch';
import Header from '../components/Header';
import FilterPanel from '../components/FilterPanel';
import ResultsTable from '../components/ResultsTable';
import './HomePage.css';

function HomePage() {
    const { records, loading } = useQTKTData();

    const {
        searchQuery,
        setSearchQuery,
        chuanQTKTFilter,
        setChuanQTKTFilter,
        chuyenkhoaFilter,
        setChuyenkhoaFilter,
        searchMethod,
        setSearchMethod,
        isInstantSearch,
        setIsInstantSearch,
        filteredData
    } = useSearch(records);

    return (
        <div className="home-container">
            <Header />
            <div className="main-layout">
                <aside className="sidebar">
                    <FilterPanel
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        chuanQTKT={chuanQTKTFilter}
                        onChuanQTKTChange={setChuanQTKTFilter}
                        chuyenkhoa={chuyenkhoaFilter}
                        onChuyenkhoaChange={setChuyenkhoaFilter}
                        searchMethod={searchMethod}
                        onSearchMethodChange={setSearchMethod}
                        isInstantSearch={isInstantSearch}
                        onInstantSearchChange={setIsInstantSearch}
                    />
                </aside>

                <main className="main-content">
                    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <ResultsTable
                            data={filteredData}
                            loading={loading}
                            chuyenkhoaFilter={chuyenkhoaFilter}
                            searchQuery={searchQuery}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HomePage;

