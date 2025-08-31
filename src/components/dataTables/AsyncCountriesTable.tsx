import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useState, Fragment } from 'react';
import { getColumnValue } from '../../helpers';
import YearlyDataTable from './YearlyDataTable';

function AsyncCountriesTable({
  selectedColumns,
  selectedYear,
  selectedRegion,
  searchQuery,
  sortBy,
  sortOrder,
  highlightedCountries,
}: {
  selectedColumns: string[];
  selectedYear: number;
  selectedRegion: string;
  searchQuery: string;
  sortBy: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
  highlightedCountries: Set<string>;
}) {
  const { countries, co2Data } = useSelector(
    (state: RootState) => state.countries
  );
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(
    new Set()
  );

  if (!co2Data) {
    throw new Promise(() => {});
  }

  const toggleCountry = (country: string) => {
    setExpandedCountries((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(country)) {
        newExpanded.delete(country);
      } else {
        newExpanded.add(country);
      }
      return newExpanded;
    });
  };

  const renderCountries = () => {
    const filteredCountries = countries.filter((country) => {
      const countryData = co2Data?.data[country];
      if (!countryData || countryData.length === 0) return false;

      if (
        searchQuery &&
        !country.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (selectedRegion !== 'all') {
        const regionMap: Record<string, string[]> = {
          europe: ['Germany', 'France', 'Italy', 'Spain', 'United Kingdom'],
          asia: ['China', 'India', 'Japan', 'South Korea'],
          africa: ['South Africa', 'Nigeria', 'Egypt'],
          americas: ['United States', 'Canada', 'Brazil', 'Mexico'],
          oceania: ['Australia', 'New Zealand'],
        };
        if (!regionMap[selectedRegion]?.includes(country)) return false;
      }

      return true;
    });

    filteredCountries.sort((a, b) => {
      const countryDataA = co2Data?.data[a];
      const countryDataB = co2Data?.data[b];

      if (!countryDataA || !countryDataB) return 0;

      const dataA =
        countryDataA.find((dp) => dp.year === selectedYear) || countryDataA[0];
      const dataB =
        countryDataB.find((dp) => dp.year === selectedYear) || countryDataB[0];

      if (sortBy === 'population') {
        const popA = dataA.population || 0;
        const popB = dataB.population || 0;
        return sortOrder === 'asc' ? popA - popB : popB - popA;
      } else {
        return sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      }
    });

    return filteredCountries.map((country) => {
      const countryData = co2Data?.data[country];
      const isExpanded = expandedCountries.has(country);
      const isHighlighted = highlightedCountries.has(country);

      if (!countryData || countryData.length === 0) {
        return (
          <tr key={country}>
            <td
              colSpan={selectedColumns.length}
              style={{ textAlign: 'center', color: '#999' }}
            >
              No data available for {country}
            </td>
          </tr>
        );
      }

      const yearData = countryData.find((dp) => dp.year === selectedYear);
      const sortedData = [...countryData].sort((a, b) => b.year - a.year);
      const displayData = yearData || sortedData[0];

      return (
        <Fragment key={country}>
          <tr
            className={`country-row ${isHighlighted ? 'highlighted' : ''}`}
            style={{
              cursor: 'pointer',
              backgroundColor: isHighlighted ? '#fef3c7' : undefined,
              transition: 'background-color 0.3s ease',
            }}
            onClick={() => toggleCountry(country)}
          >
            {selectedColumns.map((columnKey) => (
              <td
                key={columnKey}
                className={columnKey === 'country' ? 'country-row-cell' : ''}
              >
                {columnKey === 'country' && (
                  <span style={{ marginRight: '8px' }}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                )}
                {columnKey === 'country'
                  ? country
                  : getColumnValue(displayData, columnKey, country)}
              </td>
            ))}
          </tr>

          {isExpanded && (
            <YearlyDataTable
              country={country}
              dataPoints={countryData}
              selectedColumns={selectedColumns}
            />
          )}
        </Fragment>
      );
    });
  };

  return <tbody className="basic-data-table-body">{renderCountries()}</tbody>;
}

export default AsyncCountriesTable;
