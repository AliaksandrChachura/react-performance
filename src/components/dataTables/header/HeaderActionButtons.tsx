import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store';
import { fetchCO2Data } from '../../../store/slices/countriesReducer';
import { ColumnSelectorModal } from '../../ColumnSelectorModal';

interface HeaderActionButtonsProps {
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
}

function HeaderActionButtons({
  selectedColumns,
  onColumnsChange,
}: HeaderActionButtonsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  const handleRefreshFromServer = () => {
    console.log('🔄 Refreshing data from server...');
    dispatch(fetchCO2Data());
  };

  return (
    <>
      <div className="action-buttons">
        <button
          onClick={() => setIsColumnModalOpen(true)}
          className="customize-columns-btn"
        >
          ⚙️ Customize Columns
        </button>
        <button onClick={handleRefreshFromServer} className="refresh-btn">
          🔄 Refresh from Server
        </button>
      </div>

      <ColumnSelectorModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onColumnsChange={onColumnsChange}
        currentColumns={selectedColumns}
      />
    </>
  );
}

export default HeaderActionButtons;
