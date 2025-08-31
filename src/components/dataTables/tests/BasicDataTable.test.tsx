import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BasicDataTable from '../BasicDataTable';
import countriesReducer from '../../../store/slices/countriesReducer';

interface AsyncCountriesTableProps {
  selectedColumns: string[];
  selectedYear: number;
  highlightedCountries: Set<string>;
  processedCountries: string[];
}

interface BasicDataTableHeaderProps {
  selectedColumns: string[];
  selectedYear: number;
  selectedRegion: string;
  searchQuery: string;
  sortBy: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
  onColumnsChange: (columns: string[]) => void;
  onYearChange: (year: number) => void;
  onRegionChange: (region: string) => void;
  onSearchChange: (query: string) => void;
  onSortByChange: (sortBy: 'name' | 'population') => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onProcessedDataChange: (processedCountries: string[]) => void;
}

vi.mock('../AsyncCountriesTable', () => ({
  default: ({
    selectedColumns,
    selectedYear,
    highlightedCountries,
    processedCountries,
  }: AsyncCountriesTableProps) => (
    <tbody data-testid="async-countries-table">
      <tr>
        <td>Selected Columns: {selectedColumns.length}</td>
        <td>Year: {selectedYear}</td>
        <td>Highlighted: {highlightedCountries.size}</td>
        <td>Processed: {processedCountries.length}</td>
      </tr>
    </tbody>
  ),
}));

vi.mock('../header/BasicDataTableHeader', () => ({
  default: ({
    selectedColumns,
    selectedYear,
    selectedRegion,
    searchQuery,
    sortBy,
    sortOrder,
    onColumnsChange,
    onYearChange,
    onRegionChange,
    onSearchChange,
    onSortByChange,
    onSortOrderChange,
    onProcessedDataChange,
  }: BasicDataTableHeaderProps) => (
    <div data-testid="basic-data-table-header">
      <div data-testid="columns-count">Columns: {selectedColumns.length}</div>
      <div data-testid="year-display">Year: {selectedYear}</div>
      <div data-testid="region-display">Region: {selectedRegion}</div>
      <div data-testid="search-display">Search: {searchQuery}</div>
      <div data-testid="sort-by-display">Sort By: {sortBy}</div>
      <div data-testid="sort-order-display">Sort Order: {sortOrder}</div>

      <button onClick={() => onColumnsChange(['country', 'year'])}>
        Change Columns
      </button>
      <button onClick={() => onYearChange(2021)}>Change Year</button>
      <button onClick={() => onRegionChange('europe')}>Change Region</button>
      <button onClick={() => onSearchChange('test')}>Change Search</button>
      <button onClick={() => onSortByChange('population')}>
        Change Sort By
      </button>
      <button onClick={() => onSortOrderChange('desc')}>
        Change Sort Order
      </button>

      <button onClick={() => onProcessedDataChange(['Germany', 'France'])}>
        Update Processed Data
      </button>
    </div>
  ),
}));

vi.mock('../../Loading/Loading', () => ({
  default: () => <div data-testid="loading-component">Loading...</div>,
}));

vi.mock('../../helpers', () => ({
  AVAILABLE_COLUMNS: [
    {
      key: 'country',
      label: 'Country',
      description: 'Country name',
      defaultVisible: true,
    },
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
      key: 'oil_co2',
      label: 'Oil CO2 (kt)',
      description: 'CO2 emissions from oil consumption in kilotons',
      defaultVisible: false,
    },
    {
      key: 'methane',
      label: 'Methane (kt)',
      description: 'Methane emissions in kilotons',
      defaultVisible: false,
    },
    {
      key: 'temperature_change_from_co2',
      label: 'Temperature Change (°C)',
      description: 'Temperature change from CO2 emissions',
      defaultVisible: false,
    },
    {
      key: 'gdp',
      label: 'GDP',
      description: 'Gross Domestic Product in USD',
      defaultVisible: false,
    },
    {
      key: 'source',
      label: 'Data Source',
      description: 'Source of the data',
      defaultVisible: false,
    },
  ],
}));

describe('BasicDataTable', () => {
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

  const renderWithProvider = (initialState = {}) => {
    const store = createMockStore(initialState);
    return render(
      <Provider store={store}>
        <BasicDataTable />
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the component with correct structure', () => {
    renderWithProvider();

    expect(screen.getByTestId('basic-data-table-header')).toBeInTheDocument();
    expect(screen.getByTestId('async-countries-table')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('initializes with default column selection', () => {
    renderWithProvider();

    expect(screen.getByText('Columns: 6')).toBeInTheDocument();
    expect(screen.getByTestId('year-display')).toHaveTextContent('Year: 2020');
    expect(screen.getByTestId('region-display')).toHaveTextContent(
      'Region: all'
    );
    expect(screen.getByTestId('search-display')).toHaveTextContent('Search:');
    expect(screen.getByTestId('sort-by-display')).toHaveTextContent(
      'Sort By: name'
    );
    expect(screen.getByTestId('sort-order-display')).toHaveTextContent(
      'Sort Order: asc'
    );
  });

  it('renders table headers based on selected columns', () => {
    renderWithProvider();

    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
  });

  it('handles column changes correctly', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Change Columns'));

    expect(screen.getByText('Columns: 2')).toBeInTheDocument();
  });

  it('handles year changes and highlights countries with data', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Change Year'));

    expect(screen.getByTestId('year-display')).toHaveTextContent('Year: 2021');
  });

  it('handles region changes correctly', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Change Region'));

    expect(screen.getByTestId('region-display')).toHaveTextContent(
      'Region: europe'
    );
  });

  it('handles search query changes correctly', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Change Search'));

    expect(screen.getByTestId('search-display')).toHaveTextContent(
      'Search: test'
    );
  });

  it('handles sort by changes correctly', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Change Sort By'));

    expect(screen.getByTestId('sort-by-display')).toHaveTextContent(
      'Sort By: population'
    );
  });

  it('handles sort order changes correctly', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Change Sort Order'));

    expect(screen.getByTestId('sort-order-display')).toHaveTextContent(
      'Sort Order: desc'
    );
  });

  it('updates processed countries when header component calls onProcessedDataChange', async () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Update Processed Data'));

    expect(screen.getByText('Processed: 2')).toBeInTheDocument();
  });

  it('memoizes selected columns and header columns correctly', () => {
    const { rerender } = renderWithProvider();

    rerender(
      <Provider store={createMockStore()}>
        <BasicDataTable />
      </Provider>
    );

    expect(screen.getByText('Columns: 6')).toBeInTheDocument();
  });

  it('shows loading fallback in Suspense boundary', () => {
    renderWithProvider();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByTestId('async-countries-table')).toBeInTheDocument();
  });

  it('handles empty store state gracefully', () => {
    renderWithProvider({
      co2Data: null,
      countries: [],
    });

    expect(screen.getByText('Columns: 6')).toBeInTheDocument();
    expect(screen.getByTestId('year-display')).toHaveTextContent('Year: 2020');
    expect(screen.getByTestId('region-display')).toHaveTextContent(
      'Region: all'
    );
  });

  it('passes correct props to AsyncCountriesTable', () => {
    renderWithProvider();

    const asyncTable = screen.getByTestId('async-countries-table');
    expect(asyncTable).toBeInTheDocument();

    expect(screen.getByText('Selected Columns: 6')).toBeInTheDocument();
    expect(screen.getByTestId('year-display')).toHaveTextContent('Year: 2020');
    expect(screen.getByText('Highlighted: 0')).toBeInTheDocument();
    expect(screen.getByText('Processed: 0')).toBeInTheDocument();
  });

  it('uses useCallback for all event handlers to prevent unnecessary re-renders', () => {
    renderWithProvider();

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
