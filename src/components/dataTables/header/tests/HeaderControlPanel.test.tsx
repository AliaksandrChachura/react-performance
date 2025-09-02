import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeaderControlPanel from '../HeaderControlPanel';

vi.mock('../HeaderYearSelector', () => ({
  default: ({
    selectedYear,
    onYearChange,
  }: {
    selectedYear: number;
    onYearChange: (year: number) => void;
  }) => (
    <div data-testid="header-year-selector">
      Year: {selectedYear}
      <button onClick={() => onYearChange(2021)}>Change Year</button>
    </div>
  ),
}));

vi.mock('../HeaderRegionFilter', () => ({
  default: ({
    selectedRegion,
    onRegionChange,
  }: {
    selectedRegion: string;
    onRegionChange: (region: string) => void;
  }) => (
    <div data-testid="header-region-filter">
      Region: {selectedRegion}
      <button onClick={() => onRegionChange('europe')}>Change Region</button>
    </div>
  ),
}));

vi.mock('../HeaderSearchCountries', () => ({
  default: ({
    searchQuery,
    onSearchChange,
  }: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
  }) => (
    <div data-testid="header-search-countries">
      Search: {searchQuery}
      <button onClick={() => onSearchChange('test')}>Change Search</button>
    </div>
  ),
}));

vi.mock('../HeaderSortControls', () => ({
  default: ({
    sortBy,
    onSortByChange,
  }: {
    sortBy: 'name' | 'population';
    onSortByChange: (sortBy: 'name' | 'population') => void;
  }) => (
    <div data-testid="header-sort-controls">
      Sort By: {sortBy}
      <button onClick={() => onSortByChange('population')}>
        Change Sort By
      </button>
    </div>
  ),
}));

vi.mock('../HeaderAscendingOrder', () => ({
  default: ({
    sortOrder,
    onSortOrderChange,
  }: {
    sortOrder: 'asc' | 'desc';
    onSortOrderChange: (order: 'asc' | 'desc') => void;
  }) => (
    <div data-testid="header-ascending-order">
      Order: {sortOrder}
      <button onClick={() => onSortOrderChange('desc')}>Change Order</button>
    </div>
  ),
}));

describe('HeaderControlPanel', () => {
  const mockProps = {
    selectedYear: 2020,
    selectedRegion: 'all',
    searchQuery: '',
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
    onYearChange: vi.fn(),
    onRegionChange: vi.fn(),
    onSearchChange: vi.fn(),
    onSortByChange: vi.fn(),
    onSortOrderChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all child components with correct structure', () => {
    render(<HeaderControlPanel {...mockProps} />);

    expect(screen.getByTestId('header-year-selector')).toBeInTheDocument();
    expect(screen.getByTestId('header-region-filter')).toBeInTheDocument();
    expect(screen.getByTestId('header-search-countries')).toBeInTheDocument();
    expect(screen.getByTestId('header-sort-controls')).toBeInTheDocument();
    expect(screen.getByTestId('header-ascending-order')).toBeInTheDocument();
    expect(screen.getByText('Year: 2020')).toBeInTheDocument();
    expect(screen.getByText('Region: all')).toBeInTheDocument();
    expect(screen.getByText('Search:')).toBeInTheDocument();
    expect(screen.getByText('Sort By: name')).toBeInTheDocument();
    expect(screen.getByText('Order: asc')).toBeInTheDocument();
  });

  it('passes correct props to all child components', () => {
    render(<HeaderControlPanel {...mockProps} />);

    const yearSelector = screen.getByTestId('header-year-selector');
    const regionFilter = screen.getByTestId('header-region-filter');
    const searchCountries = screen.getByTestId('header-search-countries');
    const sortControls = screen.getByTestId('header-sort-controls');
    const ascendingOrder = screen.getByTestId('header-ascending-order');

    expect(yearSelector).toHaveTextContent('Year: 2020');
    expect(regionFilter).toHaveTextContent('Region: all');
    expect(searchCountries).toHaveTextContent('Search:');
    expect(sortControls).toHaveTextContent('Sort By: name');
    expect(ascendingOrder).toHaveTextContent('Order: asc');
  });

  it('has correct CSS class for styling', () => {
    const { container } = render(<HeaderControlPanel {...mockProps} />);

    const controlPanel = container.querySelector('.control-panel');
    expect(controlPanel).toBeInTheDocument();
    expect(controlPanel).toHaveClass('control-panel');
  });
});
