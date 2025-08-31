interface HeaderAscendingOrderProps {
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

function HeaderAscendingOrder({
  sortOrder,
  onSortOrderChange,
}: HeaderAscendingOrderProps) {
  return (
    <div className="control-group">
      <label htmlFor="sort-order">Order:</label>
      <select
        id="sort-order"
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
        className="control-select"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}

export default HeaderAscendingOrder;
