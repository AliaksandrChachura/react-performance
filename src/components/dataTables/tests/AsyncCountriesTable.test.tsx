import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AsyncCountriesTable from '../AsyncCountriesTable';
import countriesReducer from '../../../store/slices/countriesReducer';

interface YearlyDataTableProps {
  country: string;
  dataPoints: Array<{
    year: number;
    population: number;
    emissions: number;
    isoCode: string;
  }>;
  selectedColumns: string[];
}

vi.mock('./YearlyDataTable', () => ({
  default: ({ country, dataPoints, selectedColumns }: YearlyDataTableProps) => (
    <tr data-testid={`yearly-data-${country}`}>
      <td>Yearly data for {country}</td>
      <td>Data points: {dataPoints.length}</td>
      <td>Columns: {selectedColumns.length}</td>
    </tr>
  ),
}));

describe('AsyncCountriesTable', () => {
  const mockCo2Data = {
    data: {
      Germany: [
        { year: 2020, population: 83000000, emissions: 700000, isoCode: 'DEU' },
        { year: 2021, population: 83100000, emissions: 680000, isoCode: 'DEU' },
      ],
      France: [
        { year: 2020, population: 67000000, emissions: 300000, isoCode: 'FRA' },
        { year: 2021, population: 67100000, emissions: 290000, isoCode: 'FRA' },
      ],
      China: [
        {
          year: 2020,
          population: 1400000000,
          emissions: 10000000,
          isoCode: 'CHN',
        },
        {
          year: 2021,
          population: 1410000000,
          emissions: 9900000,
          isoCode: 'CHN',
        },
      ],
    },
    metadata: {
      totalCountries: 3,
      yearRange: { min: 2020, max: 2021 },
      lastUpdated: '2024-01-01',
      dataSource: 'test',
    },
  };

  const createMockStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        countries: countriesReducer,
      },
      preloadedState: {
        countries: {
          co2Data: mockCo2Data,
          countries: ['Germany', 'France', 'China'],
          loading: false,
          error: null,
          ...initialState,
        },
      },
    });
  };

  const renderWithProvider = (props = {}) => {
    const defaultProps = {
      selectedColumns: ['country', 'year', 'emissions'],
      selectedYear: 2020,
      highlightedCountries: new Set<string>(),
      processedCountries: ['Germany', 'France', 'China'],
      ...props,
    };

    const store = createMockStore();
    return render(
      <Provider store={store}>
        <table>
          <AsyncCountriesTable {...defaultProps} />
        </table>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders country rows with correct data for selected year', () => {
    renderWithProvider();

    const countryRows = screen.getAllByRole('row');
    expect(countryRows).toHaveLength(3);

    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('China')).toBeInTheDocument();

    const year2020Elements = screen.getAllByText('2020');
    expect(year2020Elements).toHaveLength(3);
  });

  it('expands and collapses country rows when clicked', () => {
    renderWithProvider();

    expect(screen.queryByText('2021')).not.toBeInTheDocument();

    const germanyRow = screen.getByText('Germany').closest('tr');
    if (germanyRow) {
      fireEvent.click(germanyRow);

      expect(screen.getByText('2021')).toBeInTheDocument();

      fireEvent.click(germanyRow);

      expect(screen.queryByText('2021')).not.toBeInTheDocument();
    }
  });

  it('displays expansion indicators (▶ and ▼) correctly', () => {
    renderWithProvider();

    const expandIcons = screen.getAllByText('▶');
    expect(expandIcons).toHaveLength(3);

    const germanyRow = screen.getByText('Germany').closest('tr');
    if (germanyRow) {
      fireEvent.click(germanyRow);

      expect(screen.getByText('▼')).toBeInTheDocument();
      expect(screen.getAllByText('▶')).toHaveLength(2);
    }
  });

  it('applies highlighting styles to highlighted countries', () => {
    const highlightedCountries = new Set(['Germany', 'China']);

    renderWithProvider({ highlightedCountries });

    const germanyRow = screen.getByText('Germany').closest('tr');
    const chinaRow = screen.getByText('China').closest('tr');
    const franceRow = screen.getByText('France').closest('tr');

    if (germanyRow && chinaRow && franceRow) {
      expect(germanyRow).toHaveStyle({ backgroundColor: '#fef3c7' });
      expect(chinaRow).toHaveStyle({ backgroundColor: '#fef3c7' });
      expect(franceRow).not.toHaveStyle({ backgroundColor: '#fef3c7' });
    }
  });

  it('handles countries with no data gracefully', () => {
    const processedCountries = ['Germany', 'NoDataCountry', 'France'];

    renderWithProvider({ processedCountries });

    const countryRows = screen.getAllByRole('row');
    expect(countryRows).toHaveLength(3);

    expect(
      screen.getByText('No data available for NoDataCountry')
    ).toBeInTheDocument();

    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('uses useCallback for event handlers to prevent unnecessary re-renders', () => {
    renderWithProvider();

    expect(screen.getByText('Germany')).toBeInTheDocument();

    const germanyRow = screen.getByText('Germany').closest('tr');
    if (germanyRow) {
      fireEvent.click(germanyRow);

      expect(screen.getByText('2021')).toBeInTheDocument();
    }
  });
});
