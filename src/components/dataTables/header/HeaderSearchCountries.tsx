interface HeaderSearchCountriesProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function HeaderSearchCountries({
  searchQuery,
  onSearchChange,
}: HeaderSearchCountriesProps) {
  return (
    <div className="control-group">
      <label htmlFor="search-input">Search:</label>
      <input
        id="search-input"
        type="text"
        placeholder="Search countries..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="control-input"
      />
    </div>
  );
}

export default HeaderSearchCountries;
