interface HeaderSortControlsProps {
  sortBy: 'name' | 'population';
  onSortByChange: (sortBy: 'name' | 'population') => void;
}

function HeaderSortControls({
  sortBy,
  onSortByChange,
}: HeaderSortControlsProps) {
  return (
    <>
      <div className="control-group">
        <label htmlFor="sort-by">Sort by:</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) =>
            onSortByChange(e.target.value as 'name' | 'population')
          }
          className="control-select"
        >
          <option value="name">Name</option>
          <option value="population">Population</option>
        </select>
      </div>
    </>
  );
}

export default HeaderSortControls;
