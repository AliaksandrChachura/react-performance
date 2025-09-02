import { useMemo, Fragment } from 'react';
import type { CO2DataPoint } from '../../types';
import { getColumnValue } from '../../helpers';

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

export default YearlyDataTable;
