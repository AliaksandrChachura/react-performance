import { useMemo, Fragment } from 'react';
import type { CO2DataPoint } from '../../types/co2';

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

export default YearlyDataTable;
