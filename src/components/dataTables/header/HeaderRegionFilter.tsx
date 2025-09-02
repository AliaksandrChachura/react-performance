interface HeaderRegionFilterProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

function HeaderRegionFilter({
  selectedRegion,
  onRegionChange,
}: HeaderRegionFilterProps) {
  return (
    <div className="control-group">
      <label htmlFor="region-filter">Region:</label>
      <select
        id="region-filter"
        value={selectedRegion}
        onChange={(e) => onRegionChange(e.target.value)}
        className="control-select"
      >
        <option value="all">All Regions</option>
        <option value="europe">Europe</option>
        <option value="asia">Asia</option>
        <option value="africa">Africa</option>
        <option value="americas">Americas</option>
        <option value="oceania">Oceania</option>
      </select>
    </div>
  );
}

export default HeaderRegionFilter;
