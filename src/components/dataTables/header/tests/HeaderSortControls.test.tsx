import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeaderSortControls from '../HeaderSortControls';

describe('HeaderSortControls', () => {
  const mockOnSortByChange = vi.fn();
  const defaultProps = {
    sortBy: 'name' as const,
    onSortByChange: mockOnSortByChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct structure and options', () => {
    render(<HeaderSortControls {...defaultProps} />);

    expect(screen.getByText('Sort by:')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Name')).toBeInTheDocument();

    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('name');
    expect(options[0]).toHaveTextContent('Name');
    expect(options[1]).toHaveValue('population');
    expect(options[1]).toHaveTextContent('Population');
  });

  it('calls onSortByChange with correct value when selection changes', () => {
    render(<HeaderSortControls {...defaultProps} />);

    const selectElement = screen.getByRole('combobox');

    fireEvent.change(selectElement, { target: { value: 'population' } });
    expect(mockOnSortByChange).toHaveBeenCalledWith('population');
    expect(mockOnSortByChange).toHaveBeenCalledTimes(1);

    fireEvent.change(selectElement, { target: { value: 'name' } });
    expect(mockOnSortByChange).toHaveBeenCalledWith('name');
    expect(mockOnSortByChange).toHaveBeenCalledTimes(2);
  });
});
