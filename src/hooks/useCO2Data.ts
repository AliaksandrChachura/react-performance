import { useState, useEffect, useCallback, useMemo } from 'react';
import CO2DataService from '../services/co2DataService.js';
import type {
  CO2DataResponse,
  CountrySummary,
  CO2DataPoint,
} from '../types/co2.js';

interface UseCO2DataReturn {
  data: CO2DataResponse | null;
  countries: string[];
  topEmitters: CountrySummary[];
  globalTrend: { year: number; totalEmissions: number }[];

  isLoading: boolean;
  isInitialized: boolean;

  error: string | null;

  refresh: () => Promise<void>;
  searchCountries: (query: string) => string[];
  getCountryData: (countryName: string) => CO2DataPoint[] | null;
  getEmissionsByYearRange: (
    startYear: number,
    endYear: number
  ) => Record<string, CO2DataPoint[]>;
  clearCache: () => void;
}

const co2Service = new CO2DataService();

export const useCO2Data = (): UseCO2DataReturn => {
  const [data, setData] = useState<CO2DataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await co2Service.fetchCO2Data();
      setData(result);
      setIsInitialized(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch CO2 data';
      setError(errorMessage);
      console.error('Error in useCO2Data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized computed values
  const countries = useMemo(() => {
    return data ? Object.keys(data.data) : [];
  }, [data]);

  const topEmitters = useMemo(() => {
    return data ? co2Service.getTopEmitters(10) : [];
  }, [data]);

  const globalTrend = useMemo(() => {
    return data ? co2Service.getGlobalEmissionsTrend() : [];
  }, [data]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const searchCountries = useCallback((query: string): string[] => {
    return co2Service.searchCountries(query);
  }, []);

  const getCountryData = useCallback(
    (countryName: string): CO2DataPoint[] | null => {
      return co2Service.getCountryData(countryName);
    },
    []
  );

  const getEmissionsByYearRange = useCallback(
    (startYear: number, endYear: number) => {
      return co2Service.getEmissionsByYearRange(startYear, endYear);
    },
    []
  );

  const clearCache = useCallback(() => {
    co2Service.clearCache();
    setData(null);
    setIsInitialized(false);
  }, []);

  return {
    data,
    countries,
    topEmitters,
    globalTrend,
    isLoading,
    isInitialized,
    error,
    refresh,
    searchCountries,
    getCountryData,
    getEmissionsByYearRange,
    clearCache,
  };
};
