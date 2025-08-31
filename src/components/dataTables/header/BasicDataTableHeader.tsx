import HeaderControlPanel from './HeaderControlPanel';
import HeaderActionButtons from './HeaderActionButtons';

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
}

function BasicDataTableHeader({
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
}: BasicDataTableHeaderProps) {
  const handleYearChange = (year: number) => {
    onYearChange(year);
  };

  return (
    <div className="table-header">
      <h1 className="basic-data-table-title">Countries statistics</h1>

      <HeaderControlPanel
        selectedYear={selectedYear}
        selectedRegion={selectedRegion}
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onYearChange={handleYearChange}
        onRegionChange={onRegionChange}
        onSearchChange={onSearchChange}
        onSortByChange={onSortByChange}
        onSortOrderChange={onSortOrderChange}
      />

      <HeaderActionButtons
        selectedColumns={selectedColumns}
        onColumnsChange={onColumnsChange}
      />
    </div>
  );
}

export default BasicDataTableHeader;
