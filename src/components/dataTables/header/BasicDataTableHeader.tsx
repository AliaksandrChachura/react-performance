import { useMemo, useEffect, useCallback } from 'react';
import HeaderControlPanel from './HeaderControlPanel';
import HeaderActionButtons from './HeaderActionButtons';
import type { CO2DataPoint, CountryCO2Data } from '../../../types';

interface BasicDataTableHeaderProps {
  selectedColumns: string[];
  selectedYear: number;
  selectedRegion: string;
  searchQuery: string;
  sortBy: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
  co2Data: { data: CountryCO2Data } | null;
  countries: string[];
  onColumnsChange: (columns: string[]) => void;
  onYearChange: (year: number) => void;
  onRegionChange: (region: string) => void;
  onSearchChange: (query: string) => void;
  onSortByChange: (sortBy: 'name' | 'population') => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onProcessedDataChange: (processedCountries: string[]) => void;
}

function BasicDataTableHeader({
  selectedColumns,
  selectedYear,
  selectedRegion,
  searchQuery,
  sortBy,
  sortOrder,
  co2Data,
  countries,
  onColumnsChange,
  onYearChange,
  onRegionChange,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onProcessedDataChange,
}: BasicDataTableHeaderProps) {
  const regionMap = useMemo<Record<string, string[]>>(
    () => ({
      europe: ['Germany', 'France', 'Italy', 'Spain', 'United Kingdom'],
      asia: ['China', 'India', 'Japan', 'South Korea'],
      africa: ['South Africa', 'Nigeria', 'Egypt'],
      americas: ['United States', 'Canada', 'Brazil', 'Mexico'],
      oceania: ['Australia', 'New Zealand'],
    }),
    []
  );

  const processedCountries = useMemo(() => {
    if (!co2Data || !countries) return [];

    const filteredCountries = countries.filter((country) => {
      const countryData = co2Data.data[country];
      if (!countryData || countryData.length === 0) return false;

      if (
        searchQuery &&
        !country.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (selectedRegion !== 'all') {
        if (!regionMap[selectedRegion]?.includes(country)) return false;
      }

      return true;
    });

    filteredCountries.sort((a, b) => {
      const countryDataA = co2Data.data[a];
      const countryDataB = co2Data.data[b];

      if (!countryDataA || !countryDataB) return 0;

      const dataA =
        countryDataA.find((dp: CO2DataPoint) => dp.year === selectedYear) ||
        countryDataA[0];
      const dataB =
        countryDataB.find((dp: CO2DataPoint) => dp.year === selectedYear) ||
        countryDataB[0];

      if (sortBy === 'population') {
        const popA = dataA.population || 0;
        const popB = dataB.population || 0;
        return sortOrder === 'asc' ? popA - popB : popB - popA;
      } else {
        return sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      }
    });

    return filteredCountries;
  }, [
    co2Data,
    countries,
    searchQuery,
    selectedRegion,
    selectedYear,
    sortBy,
    sortOrder,
    regionMap,
  ]);

  useEffect(() => {
    onProcessedDataChange(processedCountries);
  }, [processedCountries, onProcessedDataChange]);

  const handleYearChange = useCallback(
    (year: number) => {
      onYearChange(year);
    },
    [onYearChange]
  );

  return (
    <div className="table-header">
      <h1 className="basic-data-table-title">Countries statistics</h1>

      <HeaderControlPanel
        selectedYear={selectedYear}
        selectedRegion={selectedRegion}
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onYearChange={handleYearChange}
        onRegionChange={onRegionChange}
        onSearchChange={onSearchChange}
        onSortByChange={onSortByChange}
        onSortOrderChange={onSortOrderChange}
      />

      <HeaderActionButtons
        selectedColumns={selectedColumns}
        onColumnsChange={onColumnsChange}
      />
    </div>
  );
}

export default BasicDataTableHeader;
