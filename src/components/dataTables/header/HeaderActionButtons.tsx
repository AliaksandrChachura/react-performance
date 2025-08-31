import { useState, useCallback } from 'react';
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

  const handleRefreshFromServer = useCallback(() => {
    console.log('🔄 Refreshing data from server...');
    dispatch(fetchCO2Data());
  }, [dispatch]);

  const handleOpenColumnModal = useCallback(() => {
    setIsColumnModalOpen(true);
  }, []);

  const handleCloseColumnModal = useCallback(() => {
    setIsColumnModalOpen(false);
  }, []);

  return (
    <>
      <div className="action-buttons">
        <button
          onClick={handleOpenColumnModal}
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
        onClose={handleCloseColumnModal}
        onColumnsChange={onColumnsChange}
        currentColumns={selectedColumns}
      />
    </>
  );
}

export default HeaderActionButtons;
