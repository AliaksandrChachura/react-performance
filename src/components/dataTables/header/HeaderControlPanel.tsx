import HeaderYearSelector from './HeaderYearSelector';
import HeaderRegionFilter from './HeaderRegionFilter';
import HeaderSearchCountries from './HeaderSearchCountries';
import HeaderSortControls from './HeaderSortControls';
import HeaderAscendingOrder from './HeaderAscendingOrder';

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

function HeaderControlPanel({
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
}: HeaderControlPanelProps) {
  return (
    <div className="control-panel">
      <HeaderYearSelector
        selectedYear={selectedYear}
        onYearChange={onYearChange}
      />

      <HeaderRegionFilter
        selectedRegion={selectedRegion}
        onRegionChange={onRegionChange}
      />

      <HeaderSearchCountries
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      <HeaderSortControls sortBy={sortBy} onSortByChange={onSortByChange} />
      <HeaderAscendingOrder
        onSortOrderChange={onSortOrderChange}
        sortOrder={sortOrder}
      />
    </div>
  );
}

export default HeaderControlPanel;
