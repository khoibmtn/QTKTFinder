import { useQTKTData } from '../hooks/useQTKTData';
import { useSearch } from '../hooks/useSearch';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ResultsTable from '../components/ResultsTable';

function HomePage() {
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
    );
}

export default HomePage;
