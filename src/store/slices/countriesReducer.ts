import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetchCO2Data } from '../../api/index';
import type { CO2DataResponse } from '../../types';

export const fetchCO2Data = createAsyncThunk(
  'countries/fetchCO2Data',
  async () => {
    const data = await apiFetchCO2Data();
    return data;
  }
);

interface CountriesState {
  countries: string[];
  co2Data: CO2DataResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: CountriesState = {
  countries: [],
  co2Data: null,
  loading: false,
  error: null,
};

const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    setCountries: (state, action) => {
      state.countries = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCO2Data.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCO2Data.fulfilled, (state, action) => {
        state.loading = false;
        state.co2Data = action.payload;
        state.countries = Object.keys(action.payload.data);
      })
      .addCase(fetchCO2Data.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch CO2 data';
      });
  },
});

export const { setCountries } = countriesSlice.actions;
export default countriesSlice.reducer;
