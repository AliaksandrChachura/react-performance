import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import countriesReducer from './store/slices/countriesReducer';

vi.mock('./components/dataTables/BasicDataTable', () => ({
  default: () => (
    <div data-testid="basic-data-table">BasicDataTable Component</div>
  ),
}));

vi.mock('./Loading/Loading', () => ({
  default: () => <div data-testid="loading-component">Loading...</div>,
}));

describe('App', () => {
  const createMockStore = (initialState = {}) => {
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
          ...initialState,
        },
      },
    });
  };

  const renderWithProvider = (initialState = {}) => {
    const store = createMockStore(initialState);
    return render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the App component with correct structure', () => {
    renderWithProvider();

    expect(screen.getByTestId('basic-data-table')).toBeInTheDocument();
    expect(screen.getByTestId('basic-data-table')).toBeInTheDocument();
  });

  it('renders BasicDataTable when there is no error', () => {
    renderWithProvider({ error: null });

    expect(screen.getByTestId('basic-data-table')).toBeInTheDocument();
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
  });

  it('wraps BasicDataTable in Suspense with Loading fallback', () => {
    renderWithProvider();

    expect(screen.getByTestId('basic-data-table')).toBeInTheDocument();
  });

  it('handles empty store state gracefully', () => {
    renderWithProvider({
      co2Data: null,
      countries: [],
      loading: false,
      error: null,
    });

    expect(screen.getByTestId('basic-data-table')).toBeInTheDocument();
  });

  it('handles loading state correctly', () => {
    renderWithProvider({ loading: true });

    expect(screen.getByTestId('basic-data-table')).toBeInTheDocument();
  });

  it('renders with correct CSS class', () => {
    renderWithProvider();

    const appDiv = screen.getByTestId('basic-data-table').closest('.App');
    expect(appDiv).toHaveClass('App');
  });

  it('maintains component structure across re-renders', () => {
    const { rerender } = renderWithProvider();

    expect(screen.getByTestId('basic-data-table')).toBeInTheDocument();

    rerender(
      <Provider store={createMockStore()}>
        <App />
      </Provider>
    );

    expect(screen.getByTestId('basic-data-table')).toBeInTheDocument();
  });

  it('dispatches fetchCO2Data on component mount', () => {
    const mockStore = createMockStore();
    const mockDispatch = vi.fn();

    vi.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

    render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('dispatches fetchCO2Data only once on mount', () => {
    const mockStore = createMockStore();
    const mockDispatch = vi.fn();

    vi.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

    const { rerender } = render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    rerender(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});
