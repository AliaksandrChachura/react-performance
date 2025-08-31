import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeaderAscendingOrder from '../HeaderAscendingOrder';

describe('HeaderAscendingOrder', () => {
  const mockOnSortOrderChange = vi.fn();
  const defaultProps = {
    sortOrder: 'asc' as const,
    onSortOrderChange: mockOnSortOrderChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct structure and labels', () => {
    render(<HeaderAscendingOrder {...defaultProps} />);

    expect(screen.getByText('Order:')).toBeInTheDocument();
    expect(screen.getByLabelText('Order:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ascending')).toBeInTheDocument();
  });

  it('displays correct options and handles ascending selection', () => {
    render(<HeaderAscendingOrder {...defaultProps} />);

    const selectElement = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('asc');
    expect(options[0]).toHaveTextContent('Ascending');
    expect(options[1]).toHaveValue('desc');
    expect(options[1]).toHaveTextContent('Descending');

    expect(selectElement).toHaveValue('asc');
  });

  it('calls onSortOrderChange with correct value when selection changes', () => {
    render(<HeaderAscendingOrder {...defaultProps} />);

    const selectElement = screen.getByRole('combobox');

    fireEvent.change(selectElement, { target: { value: 'desc' } });

    expect(mockOnSortOrderChange).toHaveBeenCalledWith('desc');
    expect(mockOnSortOrderChange).toHaveBeenCalledTimes(1);

    fireEvent.change(selectElement, { target: { value: 'asc' } });

    expect(mockOnSortOrderChange).toHaveBeenCalledWith('asc');
    expect(mockOnSortOrderChange).toHaveBeenCalledTimes(2);
  });
});
