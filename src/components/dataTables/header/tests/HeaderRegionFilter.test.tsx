import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeaderRegionFilter from '../HeaderRegionFilter';

describe('HeaderRegionFilter', () => {
  const mockOnRegionChange = vi.fn();
  const defaultProps = {
    selectedRegion: 'all',
    onRegionChange: mockOnRegionChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct structure and labels', () => {
    render(<HeaderRegionFilter {...defaultProps} />);

    expect(screen.getByText('Region:')).toBeInTheDocument();
    expect(screen.getByLabelText('Region:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Regions')).toBeInTheDocument();
  });

  it('displays all region options with correct values', () => {
    render(<HeaderRegionFilter {...defaultProps} />);

    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(6);
    expect(options[0]).toHaveValue('all');
    expect(options[0]).toHaveTextContent('All Regions');
    expect(options[1]).toHaveValue('europe');
    expect(options[1]).toHaveTextContent('Europe');
    expect(options[2]).toHaveValue('asia');
    expect(options[2]).toHaveTextContent('Asia');
    expect(options[3]).toHaveValue('africa');
    expect(options[3]).toHaveTextContent('Africa');
    expect(options[4]).toHaveValue('americas');
    expect(options[4]).toHaveTextContent('Americas');
    expect(options[5]).toHaveValue('oceania');
    expect(options[5]).toHaveTextContent('Oceania');
  });

  it('calls onRegionChange with correct value when selection changes', () => {
    render(<HeaderRegionFilter {...defaultProps} />);

    const selectElement = screen.getByRole('combobox');

    fireEvent.change(selectElement, { target: { value: 'europe' } });
    expect(mockOnRegionChange).toHaveBeenCalledWith('europe');
    expect(mockOnRegionChange).toHaveBeenCalledTimes(1);

    fireEvent.change(selectElement, { target: { value: 'asia' } });
    expect(mockOnRegionChange).toHaveBeenCalledWith('asia');
    expect(mockOnRegionChange).toHaveBeenCalledTimes(2);

    fireEvent.change(selectElement, { target: { value: 'all' } });
    expect(mockOnRegionChange).toHaveBeenCalledWith('all');
    expect(mockOnRegionChange).toHaveBeenCalledTimes(3);
  });
});
