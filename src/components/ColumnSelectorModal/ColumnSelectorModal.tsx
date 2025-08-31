import { useState, useEffect } from 'react';
import './ColumnSelectorModal.scss';

export interface ColumnOption {
  key: string;
  label: string;
  description: string;
  defaultVisible: boolean;
}

interface ColumnSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColumnsChange: (selectedColumns: string[]) => void;
  currentColumns: string[];
}

const AVAILABLE_COLUMNS: ColumnOption[] = [
  {
    key: 'year',
    label: 'Year',
    description: 'Data collection year',
    defaultVisible: true,
  },
  {
    key: 'isoCode',
    label: 'ISO Code',
    description: 'Country ISO code',
    defaultVisible: true,
  },
  {
    key: 'population',
    label: 'Population',
    description: 'Country population count',
    defaultVisible: true,
  },
  {
    key: 'emissions',
    label: 'CO2 Emissions (kt)',
    description: 'Total CO2 emissions in kilotons',
    defaultVisible: true,
  },
  {
    key: 'per_capita',
    label: 'CO2 per Capita',
    description: 'CO2 emissions per person',
    defaultVisible: true,
  },
  {
    key: 'gdp',
    label: 'GDP',
    description: 'Gross Domestic Product',
    defaultVisible: false,
  },
  {
    key: 'source',
    label: 'Data Source',
    description: 'Source of the data',
    defaultVisible: false,
  },

  {
    key: 'methane',
    label: 'Methane Emissions',
    description: 'Methane emissions data',
    defaultVisible: false,
  },
  {
    key: 'oil_co2',
    label: 'Oil CO2',
    description: 'CO2 from oil consumption',
    defaultVisible: false,
  },
  {
    key: 'temperature_change_from_co2',
    label: 'Temperature Change',
    description: 'Temperature change from CO2',
    defaultVisible: false,
  },
];

export function ColumnSelectorModal({
  isOpen,
  onClose,
  onColumnsChange,
  currentColumns,
}: ColumnSelectorModalProps) {
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(currentColumns);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSelectedColumns(currentColumns);
  }, [currentColumns]);

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(columnKey)) {
        return prev.filter((col) => col !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };

  const handleApply = () => {
    onColumnsChange(selectedColumns);
    onClose();
  };

  const handleReset = () => {
    const defaultColumns = AVAILABLE_COLUMNS.filter(
      (col) => col.defaultVisible
    ).map((col) => col.key);
    setSelectedColumns(defaultColumns);
  };

  const filteredColumns = AVAILABLE_COLUMNS.filter(
    (col) =>
      col.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="column-selector-modal-overlay" onClick={onClose}>
      <div
        className="column-selector-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Select Columns to Display</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="columns-section">
            <div className="columns-header">
              <span>Available Columns ({filteredColumns.length})</span>
              <button className="reset-button" onClick={handleReset}>
                Reset to Default
              </button>
            </div>

            <div className="columns-list">
              {filteredColumns.map((column) => (
                <div key={column.key} className="column-option">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column.key)}
                      onChange={() => handleColumnToggle(column.key)}
                    />
                    <span className="checkbox-custom"></span>
                  </label>
                  <div className="column-info">
                    <span className="column-label">{column.label}</span>
                    <span className="column-description">
                      {column.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="apply-button" onClick={handleApply}>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
