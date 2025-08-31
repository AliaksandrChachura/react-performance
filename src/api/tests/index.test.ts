import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  apiFetchCO2Data,
  apiRefetchCO2Data,
  apiGetCountryData,
  apiGetCountriesSummary,
  apiGetTopEmitters,
  apiSearchCountries,
  apiGetEmissionsByYearRange,
  apiGetGlobalEmissionsTrend,
} from '../index';
import type { CountryCO2Data } from '../../types';

const mockBaseFetch = vi.hoisted(() => vi.fn());

vi.mock('../baseFetch', () => ({
  default: mockBaseFetch,
}));

describe('API Functions', () => {
  const mockCountryData: CountryCO2Data = {
    Germany: [
      { year: 2020, emissions: 700000, population: 83000000, isoCode: 'DEU' },
      { year: 2021, emissions: 680000, population: 83100000, isoCode: 'DEU' },
    ],
    France: [
      { year: 2020, emissions: 300000, population: 67000000, isoCode: 'FRA' },
      { year: 2021, emissions: 290000, population: 67100000, isoCode: 'FRA' },
    ],
    China: [
      {
        year: 2020,
        emissions: 10000000,
        population: 1400000000,
        isoCode: 'CHN',
      },
      {
        year: 2021,
        emissions: 9900000,
        population: 1410000000,
        isoCode: 'CHN',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    Object.defineProperty(window, 'fetch', {
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and caches CO2 data successfully', async () => {
    mockBaseFetch.mockResolvedValue(mockCountryData);

    const result = await apiFetchCO2Data();

    expect(result.data).toEqual(mockCountryData);
    expect(result.metadata.totalCountries).toBe(3);
    expect(result.metadata.yearRange).toEqual({ min: 2020, max: 2021 });
    expect(result.metadata.dataSource).toBe('CO2 Emissions Database');
    expect(result.metadata.lastUpdated).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );

    expect(mockBaseFetch).toHaveBeenCalledWith('', {
      baseURL: '/co2-data',
      method: 'GET',
      timeout: 20000,
    });

    const cachedResult = await apiFetchCO2Data();
    expect(cachedResult.data).toEqual(mockCountryData);
    expect(mockBaseFetch).toHaveBeenCalledTimes(1);
  });

  it('refetches data and clears cache when apiRefetchCO2Data is called', async () => {
    mockBaseFetch.mockResolvedValue(mockCountryData);

    const firstResult = await apiFetchCO2Data();
    expect(firstResult.data).toEqual(mockCountryData);

    const secondResult = await apiRefetchCO2Data();
    expect(secondResult.data).toEqual(mockCountryData);
    expect(mockBaseFetch).toHaveBeenCalled();
  });

  it('retrieves country data by name', async () => {
    mockBaseFetch.mockResolvedValue(mockCountryData);

    const germanyData = await apiGetCountryData('Germany');
    expect(germanyData).toEqual(mockCountryData.Germany);

    const nonExistentData = await apiGetCountryData('NonExistent');
    expect(nonExistentData).toBeNull();
  });

  it('generates countries summary with correct calculations', async () => {
    mockBaseFetch.mockResolvedValue(mockCountryData);

    const summaries = await apiGetCountriesSummary();

    expect(summaries).toHaveLength(3);
    expect(summaries[0].name).toBe('China');
    expect(summaries[0].totalEmissions).toBe(19900000);
    expect(summaries[0].averageEmissions).toBe(9950000);
    expect(summaries[0].yearRange).toEqual({ min: 2020, max: 2021 });
    expect(summaries[0].dataPoints).toBe(2);
  });

  it('filters top emitters by limit', async () => {
    mockBaseFetch.mockResolvedValue(mockCountryData);

    const top2 = await apiGetTopEmitters(2);
    expect(top2).toHaveLength(2);
    expect(top2[0].name).toBe('China');
    expect(top2[1].name).toBe('Germany');

    const top1 = await apiGetTopEmitters(1);
    expect(top1).toHaveLength(1);
    expect(top1[0].name).toBe('China');
  });

  it('searches countries by query string', async () => {
    mockBaseFetch.mockResolvedValue(mockCountryData);

    const germanyResults = await apiSearchCountries('germ');
    expect(germanyResults).toEqual(['Germany']);

    const allResults = await apiSearchCountries('');
    expect(allResults).toEqual(['Germany', 'France', 'China']);

    const noResults = await apiSearchCountries('xyz');
    expect(noResults).toEqual([]);
  });

  it('filters emissions data by year range', async () => {
    mockBaseFetch.mockResolvedValue(mockCountryData);

    const year2020Data = await apiGetEmissionsByYearRange(2020, 2020);
    expect(Object.keys(year2020Data)).toHaveLength(3);
    expect(year2020Data.Germany).toHaveLength(1);
    expect(year2020Data.Germany[0].year).toBe(2020);

    const year2021Data = await apiGetEmissionsByYearRange(2021, 2021);
    expect(Object.keys(year2021Data)).toHaveLength(3);
    expect(year2021Data.France).toHaveLength(1);
    expect(year2021Data.France[0].year).toBe(2021);
  });

  it('calculates global emissions trend by year', async () => {
    mockBaseFetch.mockResolvedValue(mockCountryData);

    const trend = await apiGetGlobalEmissionsTrend();

    expect(trend).toHaveLength(2);
    expect(trend[0]).toEqual({ year: 2020, totalEmissions: 11000000 });
    expect(trend[1]).toEqual({ year: 2021, totalEmissions: 10870000 });
  });
});
