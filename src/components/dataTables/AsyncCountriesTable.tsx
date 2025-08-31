import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useState, Fragment, useCallback } from 'react';
import { getColumnValue } from '../../helpers';
import YearlyDataTable from './YearlyDataTable';

function AsyncCountriesTable({
  selectedColumns,
  selectedYear,
  highlightedCountries,
  processedCountries,
}: {
  selectedColumns: string[];
  selectedYear: number;
  highlightedCountries: Set<string>;
  processedCountries: string[];
}) {
  const { co2Data } = useSelector((state: RootState) => state.countries);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(
    new Set()
  );

  if (!co2Data) {
    throw new Promise(() => {});
  }

  const toggleCountry = useCallback((country: string) => {
    setExpandedCountries((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(country)) {
        newExpanded.delete(country);
      } else {
        newExpanded.add(country);
      }
      return newExpanded;
    });
  }, []);

  const createCountryClickHandler = useCallback(
    (country: string) => {
      return () => toggleCountry(country);
    },
    [toggleCountry]
  );

  const renderCountries = () => {
    return processedCountries.map((country) => {
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
            onClick={createCountryClickHandler(country)}
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
