import { describe, it, expect, vi } from 'vitest';
import store, { type RootState, type AppDispatch } from './index';

describe('Store Configuration', () => {
  it('exports store as default export', () => {
    expect(store).toBeDefined();
    expect(typeof store).toBe('object');
  });

  it('exports RootState type', () => {
    const mockState: RootState = {
      countries: {
        co2Data: null,
        countries: [],
        loading: false,
        error: null,
      },
    };

    expect(mockState).toBeDefined();
    expect(mockState.countries).toBeDefined();
    expect(mockState.countries.co2Data).toBeNull();
    expect(mockState.countries.countries).toEqual([]);
    expect(mockState.countries.loading).toBe(false);
    expect(mockState.countries.error).toBeNull();
  });

  it('exports AppDispatch type', () => {
    const mockDispatch: AppDispatch = vi.fn();

    expect(mockDispatch).toBeDefined();
    expect(typeof mockDispatch).toBe('function');
  });

  it('has correct store structure', () => {
    expect(store).toHaveProperty('getState');
    expect(store).toHaveProperty('dispatch');
    expect(store).toHaveProperty('subscribe');
    expect(store).toHaveProperty('replaceReducer');
  });

  it('has countries reducer in store', () => {
    const state = store.getState();

    expect(state).toHaveProperty('countries');
    expect(state.countries).toBeDefined();
  });

  it('maintains type safety for RootState', () => {
    const mockState: RootState = {
      countries: {
        co2Data: {
          data: {
            Germany: [
              {
                year: 2020,
                population: 83000000,
                emissions: 700000,
                isoCode: 'DEU',
              },
            ],
          },
          metadata: {
            totalCountries: 1,
            yearRange: { min: 2020, max: 2020 },
            lastUpdated: '2024-01-01',
            dataSource: 'test',
          },
        },
        countries: ['Germany'],
        loading: false,
        error: null,
      },
    };

    expect(mockState.countries.co2Data?.data.Germany[0].year).toBe(2020);
    expect(mockState.countries.countries).toContain('Germany');
  });

  it('maintains type safety for AppDispatch', () => {
    const mockDispatch: AppDispatch = vi.fn();
    const mockAction = { type: 'test/action', payload: 'test' };

    mockDispatch(mockAction);

    expect(mockDispatch).toHaveBeenCalledWith(mockAction);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('store getState returns valid state structure', () => {
    const state = store.getState();

    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
    expect(state).toHaveProperty('countries');
  });

  it('store dispatch function is callable', () => {
    expect(typeof store.dispatch).toBe('function');

    const mockAction = { type: 'test/action', payload: 'test' };
    expect(() => store.dispatch(mockAction)).not.toThrow();
  });

  it('enables proper TypeScript compilation with store types', () => {
    const testFunction = (state: RootState, dispatch: AppDispatch) => {
      if (state.countries.loading) {
        return 'Loading...';
      }

      if (state.countries.error) {
        return 'Error occurred';
      }

      if (state.countries.co2Data) {
        dispatch({ type: 'test/action', payload: 'success' });
        return `Loaded ${state.countries.countries.length} countries`;
      }

      return 'No data';
    };

    const mockState: RootState = {
      countries: {
        co2Data: null,
        countries: [],
        loading: false,
        error: null,
      },
    };

    const mockDispatch: AppDispatch = vi.fn();

    const result = testFunction(mockState, mockDispatch);

    expect(result).toBe('No data');
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
