import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeaderYearSelector from '../HeaderYearSelector';

describe('HeaderYearSelector', () => {
  const mockOnYearChange = vi.fn();
  const defaultProps = {
    selectedYear: 2020,
    onYearChange: mockOnYearChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct structure and year options', () => {
    render(<HeaderYearSelector {...defaultProps} />);

    expect(screen.getByText('Year:')).toBeInTheDocument();
    expect(screen.getByLabelText('Year:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(11);

    const expectedYears = [
      1750, 1800, 1850, 1900, 1950, 2000, 2020, 2022, 2023, 2024, 2025,
    ];
    expectedYears.forEach((year, index) => {
      expect(options[index]).toHaveValue(year.toString());
      expect(options[index]).toHaveTextContent(year.toString());
    });
  });

  it('calls onYearChange with correct year value when selection changes', () => {
    render(<HeaderYearSelector {...defaultProps} />);

    const selectElement = screen.getByRole('combobox');

    fireEvent.change(selectElement, { target: { value: '2022' } });
    expect(mockOnYearChange).toHaveBeenCalledWith(2022);
    expect(mockOnYearChange).toHaveBeenCalledTimes(1);

    fireEvent.change(selectElement, { target: { value: '2000' } });
    expect(mockOnYearChange).toHaveBeenCalledWith(2000);
    expect(mockOnYearChange).toHaveBeenCalledTimes(2);

    fireEvent.change(selectElement, { target: { value: '1750' } });
    expect(mockOnYearChange).toHaveBeenCalledWith(1750);
    expect(mockOnYearChange).toHaveBeenCalledTimes(3);
  });
});
