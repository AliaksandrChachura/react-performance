import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import HeaderActionButtons from '../HeaderActionButtons';
import countriesReducer from '../../../../store/slices/countriesReducer';

describe('HeaderActionButtons', () => {
  const mockOnColumnsChange = vi.fn();
  const defaultProps = {
    selectedColumns: ['country', 'year', 'population'],
    onColumnsChange: mockOnColumnsChange,
  };

  const createMockStore = () => {
    return configureStore({
      reducer: {
        countries: countriesReducer,
      },
      preloadedState: {
        countries: {
          co2Data: null,
          countries: [],
          loading: false,
          error: null,
        },
      },
    });
  };

  const renderWithProvider = (props = {}) => {
    const store = createMockStore();
    return render(
      <Provider store={store}>
        <HeaderActionButtons {...defaultProps} {...props} />
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders action buttons with correct labels and classes', () => {
    renderWithProvider();

    const customizeButton = screen.getByText('⚙️ Customize Columns');
    const refreshButton = screen.getByText('🔄 Refresh from Server');

    expect(customizeButton).toBeInTheDocument();
    expect(refreshButton).toBeInTheDocument();

    expect(customizeButton).toHaveClass('customize-columns-btn');
    expect(refreshButton).toHaveClass('refresh-btn');
  });

  it('opens column selector modal when customize columns button is clicked', () => {
    renderWithProvider();

    expect(
      screen.queryByText('Select Columns to Display')
    ).not.toBeInTheDocument();

    const customizeButton = screen.getByText('⚙️ Customize Columns');
    fireEvent.click(customizeButton);

    expect(screen.getByText('Select Columns to Display')).toBeInTheDocument();
    expect(screen.getByText('Available Columns (11)')).toBeInTheDocument();
  });

  it('closes modal and applies column changes when modal actions are triggered', () => {
    renderWithProvider();

    const customizeButton = screen.getByText('⚙️ Customize Columns');
    fireEvent.click(customizeButton);

    expect(screen.getByText('Select Columns to Display')).toBeInTheDocument();

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(
      screen.queryByText('Select Columns to Display')
    ).not.toBeInTheDocument();

    fireEvent.click(customizeButton);
    const applyButton = screen.getByText('Apply Changes');
    fireEvent.click(applyButton);

    expect(mockOnColumnsChange).toHaveBeenCalledWith([
      'country',
      'year',
      'population',
    ]);
  });
});
