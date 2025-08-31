interface HeaderYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

function HeaderYearSelector({
  selectedYear,
  onYearChange,
}: HeaderYearSelectorProps) {
  return (
    <div className="control-group">
      <label htmlFor="year-selector">Year:</label>
      <select
        id="year-selector"
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="control-select"
      >
        <option value={1750}>1750</option>
        <option value={1800}>1800</option>
        <option value={1850}>1850</option>
        <option value={1900}>1900</option>
        <option value={1950}>1950</option>
        <option value={2000}>2000</option>
        <option value={2020}>2020</option>
        <option value={2022}>2022</option>
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
        <option value={2025}>2025</option>
      </select>
    </div>
  );
}

export default HeaderYearSelector;
