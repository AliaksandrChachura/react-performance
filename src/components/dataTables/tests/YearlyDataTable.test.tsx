import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import YearlyDataTable from '../YearlyDataTable';
import type { CO2DataPoint } from '../../../types';

describe('YearlyDataTable', () => {
  const mockDataPoints: CO2DataPoint[] = [
    {
      year: 2020,
      emissions: 700000,
      population: 83000000,
      isoCode: 'DEU',
      oil_co2: 200000,
      methane: 45.5,
      temperature_change_from_co2: 0.00001234,
      per_capita: 8.43,
      gdp: 3845630000000,
      source: 'Test Source',
    },
    {
      year: 2021,
      emissions: 680000,
      population: 83100000,
      isoCode: 'DEU',
      oil_co2: 190000,
      methane: 44.2,
      temperature_change_from_co2: 0.00001198,
      per_capita: 8.18,
      gdp: 4223110000000,
      source: 'Test Source',
    },
    {
      year: 2019,
      emissions: 750000,
      population: 82900000,
      isoCode: 'DEU',
      oil_co2: 210000,
      methane: 46.1,
      temperature_change_from_co2: 0.00001267,
      per_capita: 9.05,
      gdp: 3456000000000,
      source: 'Test Source',
    },
  ];

  it('renders yearly data rows for each data point', () => {
    const selectedColumns = ['year', 'emissions', 'population'];

    render(
      <table>
        <tbody>
          <YearlyDataTable
            country="Germany"
            dataPoints={mockDataPoints}
            selectedColumns={selectedColumns}
          />
        </tbody>
      </table>
    );

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);

    rows.forEach((row) => {
      expect(row).toHaveClass('yearly-data-row');
    });
  });

  it('sorts data points by year in descending order (newest first)', () => {
    const selectedColumns = ['year', 'emissions'];

    render(
      <table>
        <tbody>
          <YearlyDataTable
            country="Germany"
            dataPoints={mockDataPoints}
            selectedColumns={selectedColumns}
          />
        </tbody>
      </table>
    );

    const year2021 = screen.getByText('2021');
    const year2020 = screen.getByText('2020');
    const year2019 = screen.getByText('2019');

    expect(year2021).toBeInTheDocument();
    expect(year2020).toBeInTheDocument();
    expect(year2019).toBeInTheDocument();

    const firstRow = year2021.closest('tr');
    expect(firstRow).toBeInTheDocument();
    expect(firstRow).toHaveClass('yearly-data-row');
  });

  it('displays correct column values for each data point', () => {
    const selectedColumns = ['year', 'emissions', 'population', 'isoCode'];

    render(
      <table>
        <tbody>
          <YearlyDataTable
            country="Germany"
            dataPoints={mockDataPoints}
            selectedColumns={selectedColumns}
          />
        </tbody>
      </table>
    );
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByText('680,000')).toBeInTheDocument();
    expect(screen.getByText('83,100,000')).toBeInTheDocument();

    const isoCodeElements = screen.getAllByText('DEU');
    expect(isoCodeElements).toHaveLength(3);
  });

  it('applies special styling for year column (padding-left: 32px)', () => {
    const selectedColumns = ['year', 'emissions'];

    render(
      <table>
        <tbody>
          <YearlyDataTable
            country="Germany"
            dataPoints={mockDataPoints}
            selectedColumns={selectedColumns}
          />
        </tbody>
      </table>
    );

    const yearCell = screen.getByText('2021').closest('td');
    expect(yearCell).toHaveStyle({ paddingLeft: '32px' });

    const emissionsCell = screen.getByText('680,000').closest('td');
    expect(emissionsCell).not.toHaveStyle({ paddingLeft: '32px' });
  });

  it('handles empty data points gracefully', () => {
    const selectedColumns = ['year', 'emissions', 'population'];

    render(
      <table>
        <tbody>
          <YearlyDataTable
            country="Germany"
            dataPoints={[]}
            selectedColumns={selectedColumns}
          />
        </tbody>
      </table>
    );

    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(0);
  });

  it('renders rows with correct background color styling', () => {
    const selectedColumns = ['year', 'emissions'];

    render(
      <table>
        <tbody>
          <YearlyDataTable
            country="Germany"
            dataPoints={mockDataPoints}
            selectedColumns={selectedColumns}
          />
        </tbody>
      </table>
    );

    const rows = screen.getAllByRole('row');
    rows.forEach((row) => {
      expect(row).toHaveStyle({ backgroundColor: '#f8f9fa' });
    });
  });
});
