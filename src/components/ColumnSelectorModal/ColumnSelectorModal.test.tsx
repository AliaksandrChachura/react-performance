import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ColumnSelectorModal } from './ColumnSelectorModal';

vi.mock('../../helpers', () => ({
  AVAILABLE_COLUMNS: [
    {
      key: 'country',
      label: 'Country',
      description: 'Country name',
      defaultVisible: true,
    },
    {
      key: 'year',
      label: 'Year',
      description: 'Data collection year',
      defaultVisible: true,
    },
    {
      key: 'population',
      label: 'Population',
      description: 'Country population count',
      defaultVisible: false,
    },
    {
      key: 'emissions',
      label: 'CO2 Emissions',
      description: 'Total CO2 emissions',
      defaultVisible: false,
    },
    {
      key: 'gdp',
      label: 'GDP',
      description: 'Gross Domestic Product',
      defaultVisible: false,
    },
  ],
}));

describe('ColumnSelectorModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onColumnsChange: vi.fn(),
    currentColumns: ['country', 'year'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    render(<ColumnSelectorModal {...defaultProps} />);

    expect(screen.getByText('Select Columns to Display')).toBeInTheDocument();
    expect(screen.getByText('Available Columns (5)')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search columns...')
    ).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<ColumnSelectorModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByText('Select Columns to Display')
    ).not.toBeInTheDocument();
  });

  it('displays current columns as checked', () => {
    render(<ColumnSelectorModal {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    const countryCheckbox = checkboxes[0];
    const yearCheckbox = checkboxes[1];
    const populationCheckbox = checkboxes[2];

    expect(countryCheckbox).toBeChecked();
    expect(yearCheckbox).toBeChecked();
    expect(populationCheckbox).not.toBeChecked();
  });

  it('toggles column selection when checkbox is clicked', () => {
    render(<ColumnSelectorModal {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    const populationCheckbox = checkboxes[2];
    fireEvent.click(populationCheckbox);

    expect(populationCheckbox).toBeChecked();
  });

  it('filters columns based on search term', () => {
    render(<ColumnSelectorModal {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search columns...');
    fireEvent.change(searchInput, { target: { value: 'pop' } });

    expect(screen.getByText('Available Columns (1)')).toBeInTheDocument();
    expect(screen.getByText('Population')).toBeInTheDocument();
    expect(screen.queryByText('Country')).not.toBeInTheDocument();
  });

  it('searches in both label and description', () => {
    render(<ColumnSelectorModal {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search columns...');
    fireEvent.change(searchInput, { target: { value: 'emissions' } });

    expect(screen.getByText('Available Columns (1)')).toBeInTheDocument();
    expect(screen.getByText('CO2 Emissions')).toBeInTheDocument();
  });

  it('resets to default columns when reset button is clicked', () => {
    render(<ColumnSelectorModal {...defaultProps} />);

    const resetButton = screen.getByText('Reset to Default');
    fireEvent.click(resetButton);

    const checkboxes = screen.getAllByRole('checkbox');
    const countryCheckbox = checkboxes[0];
    const yearCheckbox = checkboxes[1];
    const populationCheckbox = checkboxes[2];

    expect(countryCheckbox).toBeChecked();
    expect(yearCheckbox).toBeChecked();
    expect(populationCheckbox).not.toBeChecked();
  });

  it('calls onColumnsChange and onClose when apply button is clicked', () => {
    render(<ColumnSelectorModal {...defaultProps} />);

    const applyButton = screen.getByText('Apply Changes');
    fireEvent.click(applyButton);

    expect(defaultProps.onColumnsChange).toHaveBeenCalledWith([
      'country',
      'year',
    ]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ColumnSelectorModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    render(<ColumnSelectorModal {...defaultProps} />);

    const overlay = screen
      .getByText('Select Columns to Display')
      .closest('.column-selector-modal-overlay');

    if (overlay) {
      fireEvent.click(overlay);
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });

  it('prevents modal close when modal content is clicked', () => {
    render(<ColumnSelectorModal {...defaultProps} />);

    const modalContent = screen
      .getByText('Select Columns to Display')
      .closest('.column-selector-modal');

    if (modalContent) {
      fireEvent.click(modalContent);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    }
  });
});
