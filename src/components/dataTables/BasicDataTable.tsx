import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Suspense, useState, useMemo, Fragment } from 'react';
import Loading from '../../Loading/Loading';
import { ColumnSelectorModal, type ColumnOption } from '../ColumnSelectorModal';
import type { CO2DataPoint } from '../../types/co2';

const DEFAULT_COLUMNS: ColumnOption[] = [
  {
    key: 'year',
    label: 'Year',
    description: 'Data collection year',
    defaultVisible: true,
  },
  {
    key: 'isoCode',
    label: 'ISO Code',
    description: 'Country ISO code',
    defaultVisible: true,
  },
  {
    key: 'population',
    label: 'Population',
    description: 'Country population count',
    defaultVisible: true,
  },
  {
    key: 'emissions',
    label: 'CO2 Emissions (kt)',
    description: 'Total CO2 emissions in kilotons',
    defaultVisible: true,
  },
  {
    key: 'per_capita',
    label: 'CO2 per Capita',
    description: 'CO2 emissions per person',
    defaultVisible: true,
  },
  {
    key: 'gdp',
    label: 'GDP',
    description: 'Gross Domestic Product',
    defaultVisible: false,
  },
  {
    key: 'source',
    label: 'Data Source',
    description: 'Source of the data',
    defaultVisible: false,
  },
];

function YearlyDataTable({
  country,
  dataPoints,
  selectedColumns,
}: {
  country: string;
  dataPoints: CO2DataPoint[];
  selectedColumns: string[];
}) {
  const sortedData = useMemo(
    () => [...dataPoints].sort((a, b) => b.year - a.year),
    [dataPoints]
  );

  return (
    <Fragment>
      {sortedData.map((dataPoint) => (
        <tr
          key={`${country}-${dataPoint.year}`}
          className="yearly-data-row"
          style={{ backgroundColor: '#f8f9fa' }}
        >
          {selectedColumns.map((columnKey) => (
            <td
              key={columnKey}
              style={columnKey === 'year' ? { paddingLeft: '32px' } : {}}
            >
              {getColumnValue(dataPoint, columnKey)}
            </td>
          ))}
        </tr>
      ))}
    </Fragment>
  );
}

function getColumnValue(dataPoint: CO2DataPoint, columnKey: string): string {
  switch (columnKey) {
    case 'year':
      return dataPoint.year.toString();
    case 'isoCode':
      return dataPoint.isoCode || 'N/A';
    case 'population':
      return dataPoint.population?.toLocaleString() || 'N/A';
    case 'emissions':
      return dataPoint.emissions?.toLocaleString() || 'N/A';
    case 'per_capita':
      return dataPoint.per_capita?.toFixed(2) || 'N/A';
    case 'gdp':
      return dataPoint.gdp?.toLocaleString() || 'N/A';
    case 'source':
      return dataPoint.source || 'N/A';
    default:
      return 'N/A';
  }
}

function AsyncCountriesTable({
  selectedColumns,
}: {
  selectedColumns: string[];
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
    return countries.map((country) => {
      const countryData = co2Data?.data[country];
      const isExpanded = expandedCountries.has(country);

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

      const sortedData = [...countryData].sort((a, b) => b.year - a.year);
      const latestData = sortedData[0];

      return (
        <Fragment key={country}>
          {/* Main country row */}
          <tr
            className="country-row"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleCountry(country)}
          >
            {selectedColumns.map((columnKey) => (
              <td
                key={columnKey}
                className={columnKey === 'year' ? 'country-row-cell' : ''}
              >
                {columnKey === 'year' && (
                  <span style={{ marginRight: '8px' }}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                )}
                {columnKey === 'year'
                  ? country
                  : getColumnValue(latestData, columnKey)}
              </td>
            ))}
          </tr>

          {/* Expanded yearly data rows */}
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

function BasicDataTable() {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    DEFAULT_COLUMNS.filter((col) => col.defaultVisible).map((col) => col.key)
  );
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  const handleColumnsChange = (newColumns: string[]) => {
    setSelectedColumns(newColumns);
  };

  return (
    <div className="basic-data-table-container">
      <div className="table-header">
        <h1 className="basic-data-table-title">Countries statistics</h1>
        <button
          className="column-selector-button"
          onClick={() => {
            setIsColumnModalOpen(true);
          }}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'block',
            margin: '10px 0',
          }}
        >
          ⚙️ Customize Columns
        </button>
      </div>

      <table className="basic-data-table">
        <thead className="basic-data-table-header">
          <tr>
            {selectedColumns.map((columnKey) => {
              const column = DEFAULT_COLUMNS.find(
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
          <AsyncCountriesTable selectedColumns={selectedColumns} />
        </Suspense>
      </table>

      <ColumnSelectorModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onColumnsChange={handleColumnsChange}
        currentColumns={selectedColumns}
      />
    </div>
  );
}

export default BasicDataTable;
