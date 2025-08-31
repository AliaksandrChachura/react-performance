import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Suspense, useState } from 'react';
import Loading from '../../Loading/Loading';
import { AVAILABLE_COLUMNS } from '../../helpers';
import AsyncCountriesTable from './AsyncCountriesTable';
import BasicDataTableHeader from './header/BasicDataTableHeader';

function BasicDataTable() {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map((col) => col.key)
  );

  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'population'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [highlightedCountries, setHighlightedCountries] = useState<Set<string>>(
    new Set()
  );
  const { co2Data } = useSelector((state: RootState) => state.countries);

  const handleColumnsChange = (newColumns: string[]) => {
    setSelectedColumns(newColumns);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // Highlight countries that have data for this year
    if (co2Data) {
      const countriesWithData = Object.keys(co2Data.data).filter((country) => {
        const countryData = co2Data.data[country];
        return countryData.some((dp) => dp.year === year);
      });
      setHighlightedCountries(new Set(countriesWithData));
      setTimeout(() => setHighlightedCountries(new Set()), 2000);
    }
  };

  return (
    <div className="basic-data-table-container">
      <BasicDataTableHeader
        selectedColumns={selectedColumns}
        selectedYear={selectedYear}
        selectedRegion={selectedRegion}
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onColumnsChange={handleColumnsChange}
        onYearChange={handleYearChange}
        onRegionChange={setSelectedRegion}
        onSearchChange={setSearchQuery}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />

      <table className="basic-data-table">
        <thead className="basic-data-table-header">
          <tr>
            {selectedColumns.map((columnKey) => {
              const column = AVAILABLE_COLUMNS.find(
                (col) => col.key === columnKey
              );
              return <th key={columnKey}>{column?.label || columnKey}</th>;
            })}
          </tr>
        </thead>

        <Suspense
          fallback={
            <tbody className="basic-data-table-body">
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  style={{ textAlign: 'center', padding: '50px' }}
                >
                  <Loading />
                </td>
              </tr>
            </tbody>
          }
        >
          <AsyncCountriesTable
            selectedColumns={selectedColumns}
            selectedYear={selectedYear}
            selectedRegion={selectedRegion}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            highlightedCountries={highlightedCountries}
          />
        </Suspense>
      </table>
    </div>
  );
}

export default BasicDataTable;
