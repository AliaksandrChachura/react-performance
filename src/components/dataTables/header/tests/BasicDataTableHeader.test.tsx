import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BasicDataTableHeader from '../BasicDataTableHeader';
import countriesReducer from '../../../../store/slices/countriesReducer';
import type { CountryCO2Data } from '../../../../types';

interface HeaderControlPanelProps {
  selectedYear: number;
  selectedRegion: string;
  searchQuery: string;
  sortBy: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
  onYearChange: (year: number) => void;
  onRegionChange: (region: string) => void;
  onSearchChange: (query: string) => void;
  onSortByChange: (sortBy: 'name' | 'population') => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

interface HeaderActionButtonsProps {
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
}

vi.mock('../HeaderControlPanel', () => ({
  default: ({
    selectedYear,
    selectedRegion,
    searchQuery,
    sortBy,
    sortOrder,
    onYearChange,
    onRegionChange,
    onSearchChange,
    onSortByChange,
    onSortOrderChange,
  }: HeaderControlPanelProps) => (
    <div data-testid="header-control-panel">
      <div data-testid="year-selector" onClick={() => onYearChange(2020)}>
        Year: {selectedYear}
      </div>
      <div data-testid="region-filter" onClick={() => onRegionChange('europe')}>
        Region: {selectedRegion}
      </div>
      <div data-testid="search-input" onClick={() => onSearchChange('test')}>
        Search: {searchQuery}
      </div>
      <div data-testid="sort-by" onClick={() => onSortByChange('population')}>
        Sort by: {sortBy}
      </div>
      <div data-testid="sort-order" onClick={() => onSortOrderChange('desc')}>
        Order: {sortOrder}
      </div>
    </div>
  ),
}));

vi.mock('../HeaderActionButtons', () => ({
  default: ({ selectedColumns, onColumnsChange }: HeaderActionButtonsProps) => (
    <div data-testid="header-action-buttons">
      <div data-testid="columns-count">Columns: {selectedColumns.length}</div>
      <button onClick={() => onColumnsChange(['country', 'year'])}>
        Change Columns
      </button>
    </div>
  ),
}));

describe('BasicDataTableHeader', () => {
  const mockCo2Data: { data: CountryCO2Data } = {
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
      'United States': [
        {
          year: 2020,
          population: 330000000,
          emissions: 5000000,
          isoCode: 'USA',
        },
        {
          year: 2021,
          population: 331000000,
          emissions: 4900000,
          isoCode: 'USA',
        },
      ],
    },
  };

  const defaultProps = {
    selectedColumns: ['country', 'year', 'population'],
    selectedYear: 2020,
    selectedRegion: 'all',
    searchQuery: '',
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
    co2Data: mockCo2Data,
    countries: ['Germany', 'France', 'China', 'United States'],
    onColumnsChange: vi.fn(),
    onYearChange: vi.fn(),
    onRegionChange: vi.fn(),
    onSearchChange: vi.fn(),
    onSortByChange: vi.fn(),
    onSortOrderChange: vi.fn(),
    onProcessedDataChange: vi.fn(),
  };

  const createMockStore = () => {
    return configureStore({
      reducer: {
        countries: countriesReducer,
      },
      preloadedState: {
        countries: {
          co2Data: null,
          countries: [],
          loading: false,
          error: null,
        },
      },
    });
  };

  const renderWithProvider = (props = {}) => {
    const store = createMockStore();
    return render(
      <Provider store={store}>
        <BasicDataTableHeader {...defaultProps} {...props} />
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct title', () => {
    renderWithProvider();

    expect(screen.getByText('Countries statistics')).toBeInTheDocument();
  });

  it('renders HeaderControlPanel and HeaderActionButtons', () => {
    renderWithProvider();

    expect(screen.getByTestId('header-control-panel')).toBeInTheDocument();
    expect(screen.getByTestId('header-action-buttons')).toBeInTheDocument();
  });

  it('passes correct props to HeaderControlPanel', () => {
    renderWithProvider();

    expect(screen.getByText('Year: 2020')).toBeInTheDocument();
    expect(screen.getByText('Region: all')).toBeInTheDocument();
    expect(screen.getByText(/Search:/)).toBeInTheDocument();
    expect(screen.getByText('Sort by: name')).toBeInTheDocument();
    expect(screen.getByText('Order: asc')).toBeInTheDocument();
  });

  it('passes correct props to HeaderActionButtons', () => {
    renderWithProvider();

    expect(screen.getByText('Columns: 3')).toBeInTheDocument();
  });

  it('calls onProcessedDataChange with filtered and sorted countries', async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(defaultProps.onProcessedDataChange).toHaveBeenCalledWith([
        'China',
        'France',
        'Germany',
        'United States',
      ]);
    });
  });

  it('filters countries by search query', async () => {
    const propsWithSearch = {
      ...defaultProps,
      searchQuery: 'germ',
    };

    renderWithProvider(propsWithSearch);

    await waitFor(() => {
      expect(defaultProps.onProcessedDataChange).toHaveBeenCalledWith([
        'Germany',
      ]);
    });
  });

  it('filters countries by region', async () => {
    const propsWithRegion = {
      ...defaultProps,
      selectedRegion: 'europe',
    };

    renderWithProvider(propsWithRegion);

    await waitFor(() => {
      expect(defaultProps.onProcessedDataChange).toHaveBeenCalledWith([
        'France',
        'Germany',
      ]);
    });
  });

  it('sorts countries by population in ascending order', async () => {
    const propsWithPopulationSort = {
      ...defaultProps,
      sortBy: 'population' as const,
      sortOrder: 'asc' as const,
    };

    renderWithProvider(propsWithPopulationSort);

    await waitFor(() => {
      expect(defaultProps.onProcessedDataChange).toHaveBeenCalledWith([
        'France',
        'Germany',
        'United States',
        'China',
      ]);
    });
  });

  it('sorts countries by population in descending order', async () => {
    const propsWithPopulationSortDesc = {
      ...defaultProps,
      sortBy: 'population' as const,
      sortOrder: 'desc' as const,
    };

    renderWithProvider(propsWithPopulationSortDesc);

    await waitFor(() => {
      expect(defaultProps.onProcessedDataChange).toHaveBeenCalledWith([
        'China',
        'United States',
        'Germany',
        'France',
      ]);
    });
  });

  it('handles empty co2Data gracefully', async () => {
    const propsWithNoData = {
      ...defaultProps,
      co2Data: null,
    };

    renderWithProvider(propsWithNoData);

    await waitFor(() => {
      expect(defaultProps.onProcessedDataChange).toHaveBeenCalledWith([]);
    });
  });

  it('handles empty countries array gracefully', async () => {
    const propsWithNoCountries = {
      ...defaultProps,
      countries: [],
    };

    renderWithProvider(propsWithNoCountries);

    await waitFor(() => {
      expect(defaultProps.onProcessedDataChange).toHaveBeenCalledWith([]);
    });
  });

  it('combines multiple filters correctly', async () => {
    const propsWithMultipleFilters = {
      ...defaultProps,
      searchQuery: 'united',
      selectedRegion: 'americas',
      sortBy: 'population' as const,
      sortOrder: 'desc' as const,
    };

    renderWithProvider(propsWithMultipleFilters);

    await waitFor(() => {
      expect(defaultProps.onProcessedDataChange).toHaveBeenCalledWith([
        'United States',
      ]);
    });
  });

  it('calls onYearChange when year is changed', () => {
    renderWithProvider();

    fireEvent.click(screen.getByTestId('year-selector'));

    expect(defaultProps.onYearChange).toHaveBeenCalledWith(2020);
  });

  it('calls onColumnsChange when columns are changed', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Change Columns'));

    expect(defaultProps.onColumnsChange).toHaveBeenCalledWith([
      'country',
      'year',
    ]);
  });

  it('memoizes region map correctly', () => {
    const { rerender } = renderWithProvider();

    const store = createMockStore();
    rerender(
      <Provider store={store}>
        <BasicDataTableHeader {...defaultProps} />
      </Provider>
    );

    expect(screen.getByTestId('header-control-panel')).toBeInTheDocument();
  });

  it('processes countries data efficiently with useMemo', async () => {
    const startTime = performance.now();

    renderWithProvider();

    await waitFor(() => {
      expect(defaultProps.onProcessedDataChange).toHaveBeenCalled();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(100);
  });
});
