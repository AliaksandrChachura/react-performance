import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Suspense, useState, useMemo, useCallback } from 'react';
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
  const [processedCountries, setProcessedCountries] = useState<string[]>([]);

  const { co2Data, countries } = useSelector(
    (state: RootState) => state.countries
  );

  const memoizedSelectedColumns = useMemo(
    () => selectedColumns,
    [selectedColumns]
  );

  const headerColumns = useMemo(
    () =>
      memoizedSelectedColumns.map((columnKey) => {
        const column = AVAILABLE_COLUMNS.find((col) => col.key === columnKey);
        return { key: columnKey, label: column?.label || columnKey };
      }),
    [memoizedSelectedColumns]
  );

  const handleColumnsChange = useCallback((newColumns: string[]) => {
    setSelectedColumns(newColumns);
  }, []);

  const handleYearChange = useCallback(
    (year: number) => {
      setSelectedYear(year);

      if (co2Data) {
        const countriesWithData = Object.keys(co2Data.data).filter(
          (country) => {
            const countryData = co2Data.data[country];
            return countryData.some((dp) => dp.year === year);
          }
        );
        setHighlightedCountries(new Set(countriesWithData));
        setTimeout(() => setHighlightedCountries(new Set()), 2000);
      }
    },
    [co2Data]
  );

  const handleRegionChange = useCallback((region: string) => {
    setSelectedRegion(region);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSortByChange = useCallback((sortBy: 'name' | 'population') => {
    setSortBy(sortBy);
  }, []);

  const handleSortOrderChange = useCallback((order: 'asc' | 'desc') => {
    setSortOrder(order);
  }, []);

  const handleProcessedDataChange = useCallback((processedData: string[]) => {
    setProcessedCountries(processedData);
  }, []);

  return (
    <div className="basic-data-table-container">
      <BasicDataTableHeader
        selectedColumns={memoizedSelectedColumns}
        selectedYear={selectedYear}
        selectedRegion={selectedRegion}
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        co2Data={co2Data}
        countries={countries}
        onColumnsChange={handleColumnsChange}
        onYearChange={handleYearChange}
        onRegionChange={handleRegionChange}
        onSearchChange={handleSearchChange}
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
        onProcessedDataChange={handleProcessedDataChange}
      />

      <table className="basic-data-table">
        <thead className="basic-data-table-header">
          <tr>
            {headerColumns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>

        <Suspense
          fallback={
            <tbody className="basic-data-table-body">
              <tr>
                <td
                  colSpan={memoizedSelectedColumns.length}
                  style={{ textAlign: 'center', padding: '50px' }}
                >
                  <Loading />
                </td>
              </tr>
            </tbody>
          }
        >
          <AsyncCountriesTable
            selectedColumns={memoizedSelectedColumns}
            selectedYear={selectedYear}
            highlightedCountries={highlightedCountries}
            processedCountries={processedCountries}
          />
        </Suspense>
      </table>
    </div>
  );
}

export default BasicDataTable;
