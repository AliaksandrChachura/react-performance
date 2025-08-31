import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeaderSearchCountries from '../HeaderSearchCountries';

describe('HeaderSearchCountries', () => {
  const mockOnSearchChange = vi.fn();
  const defaultProps = {
    searchQuery: '',
    onSearchChange: mockOnSearchChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct structure and labels', () => {
    render(<HeaderSearchCountries {...defaultProps} />);

    expect(screen.getByText('Search:')).toBeInTheDocument();
    expect(screen.getByLabelText('Search:')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search countries...')
    ).toBeInTheDocument();
  });

  it('displays the current search query value correctly', () => {
    const searchQuery = 'Germany';
    render(
      <HeaderSearchCountries {...defaultProps} searchQuery={searchQuery} />
    );

    const searchInput = screen.getByDisplayValue('Germany');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('Germany');
  });

  it('calls onSearchChange with correct value when input changes', () => {
    render(<HeaderSearchCountries {...defaultProps} />);

    const searchInput = screen.getByRole('textbox');

    fireEvent.change(searchInput, { target: { value: 'France' } });
    expect(mockOnSearchChange).toHaveBeenCalledWith('France');
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);

    fireEvent.change(searchInput, { target: { value: 'China' } });
    expect(mockOnSearchChange).toHaveBeenCalledWith('China');
    expect(mockOnSearchChange).toHaveBeenCalledTimes(2);
  });
});
