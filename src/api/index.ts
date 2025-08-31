import baseFetch from './baseFetch';
const DEFAULT_BASE_URL =
  import.meta.env.VITE_COUNTRIES_BASE_URL || '/co2-data.json';
const EXTERNAL_API_URL =
  'https://nyc3.digitaloceanspaces.com/owid-public/data/co2/owid-co2-data.json';

import type {
  CO2DataPoint,
  CountryCO2Data,
  CO2DataResponse,
  CountrySummary,
} from '../types/index.js';

const dataCache = new Map<string, CO2DataResponse>();
const CACHE_KEY = 'co2Data';

async function apiFetchCO2Data(
  dataUrl: string = DEFAULT_BASE_URL
): Promise<CO2DataResponse> {
  const cached = dataCache.get(CACHE_KEY);
  if (cached) {
    return cached;
  }

  try {
    const raw = await baseFetch('', {
      baseURL: dataUrl,
      method: 'GET',
      timeout: 20000,
    });

    let transformedData: CountryCO2Data;
    try {
      if (isValidCO2Data(raw)) {
        transformedData = raw;
      } else {
        transformedData = transformExternalData(raw);
      }
    } catch (transformError: unknown) {
      console.error('Data transformation failed:', transformError);
      const message =
        transformError instanceof Error
          ? transformError.message
          : 'Unknown transformation error';
      throw new Error(`Invalid CO2 data structure: ${message}`);
    }

    const processed = processData(transformedData);
    dataCache.set(CACHE_KEY, processed);
    return processed;
  } catch (error) {
    console.error('External API failed, trying local data:', error);

    try {
      const externalResponse = await fetch(EXTERNAL_API_URL);

      if (externalResponse.ok) {
        const externalData = await externalResponse.json();

        let transformedData: CountryCO2Data;
        try {
          if (isValidCO2Data(externalData)) {
            transformedData = externalData;
          } else {
            transformedData = transformExternalData(externalData);
          }
        } catch (transformError: unknown) {
          console.error(
            'External API data transformation failed:',
            transformError
          );
          const message =
            transformError instanceof Error
              ? transformError.message
              : 'Unknown transformation error';
          throw new Error(`Invalid external API data structure: ${message}`);
        }

        const processed = processData(transformedData);
        dataCache.set(CACHE_KEY, processed);
        return processed;
      }
    } catch (externalError) {
      console.error('External API direct access failed:', externalError);
    }

    try {
      const localResponse = await fetch('/co2-data.json');

      if (localResponse.ok) {
        const localData = await localResponse.json();

        if (isValidCO2Data(localData)) {
          const processed = processData(localData);
          dataCache.set(CACHE_KEY, processed);
          return processed;
        }
      }
    } catch (localError) {
      console.error('Local data also failed:', localError);
    }

    throw error;
  }
}

async function apiRefetchCO2Data(
  dataUrl: string = DEFAULT_BASE_URL
): Promise<CO2DataResponse> {
  clearCache();
  return apiFetchCO2Data(dataUrl);
}

function clearCache(): void {
  dataCache.clear();
}

async function apiGetCountryData(
  countryName: string,
  dataUrl?: string
): Promise<CO2DataPoint[] | null> {
  const dataset = await apiFetchCO2Data(dataUrl);
  return dataset.data[countryName] || null;
}

async function apiGetCountriesSummary(
  dataUrl?: string
): Promise<CountrySummary[]> {
  const dataset = await apiFetchCO2Data(dataUrl);

  const summaries: CountrySummary[] = [];
  Object.entries(dataset.data).forEach(([countryName, dataPoints]) => {
    const emissions = dataPoints
      .map((dp) => dp.emissions)
      .filter((e): e is number => typeof e === 'number');

    if (emissions.length > 0) {
      const totalEmissions = emissions.reduce((s, e) => s + e, 0);
      const averageEmissions = totalEmissions / emissions.length;
      const years = dataPoints.map((dp) => dp.year).sort((a, b) => a - b);

      summaries.push({
        name: countryName,
        totalEmissions,
        averageEmissions,
        yearRange: {
          min: years[0],
          max: years[years.length - 1],
        },
        dataPoints: dataPoints.length,
      });
    }
  });

  return summaries.sort((a, b) => b.totalEmissions - a.totalEmissions);
}

async function apiGetTopEmitters(
  limit = 10,
  dataUrl?: string
): Promise<CountrySummary[]> {
  const all = await apiGetCountriesSummary(dataUrl);
  return all.slice(0, limit);
}

async function apiSearchCountries(
  query: string,
  dataUrl?: string
): Promise<string[]> {
  const dataset = await apiFetchCO2Data(dataUrl);
  const lower = query.toLowerCase();
  return Object.keys(dataset.data).filter((c) =>
    c.toLowerCase().includes(lower)
  );
}

async function apiGetEmissionsByYearRange(
  startYear: number,
  endYear: number,
  dataUrl?: string
): Promise<Record<string, CO2DataPoint[]>> {
  const dataset = await apiFetchCO2Data(dataUrl);
  const filtered: Record<string, CO2DataPoint[]> = {};

  Object.entries(dataset.data).forEach(([country, points]) => {
    const inRange = points.filter(
      (dp) => dp.year >= startYear && dp.year <= endYear
    );
    if (inRange.length > 0) filtered[country] = inRange;
  });

  return filtered;
}

async function apiGetGlobalEmissionsTrend(
  dataUrl?: string
): Promise<{ year: number; totalEmissions: number }[]> {
  const dataset = await apiFetchCO2Data(dataUrl);
  const yearMap = new Map<number, number>();

  Object.values(dataset.data).forEach((points) => {
    points.forEach((dp) => {
      if (typeof dp.emissions === 'number') {
        yearMap.set(dp.year, (yearMap.get(dp.year) || 0) + dp.emissions);
      }
    });
  });

  return Array.from(yearMap.entries())
    .map(([year, totalEmissions]) => ({ year, totalEmissions }))
    .sort((a, b) => a.year - b.year);
}

function transformExternalData(rawData: unknown): CountryCO2Data {
  if (isValidCO2Data(rawData)) {
    return rawData;
  }

  if (rawData && typeof rawData === 'object') {
    const transformed: CountryCO2Data = {};

    let countryData = null;

    countryData = rawData as Record<string, unknown>;

    if (countryData) {
      Object.keys(countryData).forEach((key) => {
        const countryInfo = countryData[key];

        if (countryInfo && typeof countryInfo === 'object') {
          const countryInfoObj = countryInfo as Record<string, unknown>;

          const emissionsData = countryInfoObj.data as unknown[];
          const countryIsoCode = countryInfoObj.iso_code as string;

          if (emissionsData && Array.isArray(emissionsData)) {
            const transformedPoints: CO2DataPoint[] = emissionsData.map(
              (point: unknown) => {
                const pointObj = point as Record<string, unknown>;
                return {
                  year: (pointObj.year as number) || new Date().getFullYear(),
                  emissions:
                    (pointObj.co2 as number) ||
                    (pointObj.cement_co2 as number) ||
                    (pointObj.gas_co2 as number) ||
                    (pointObj.coal_co2 as number) ||
                    0,
                  oil_co2: pointObj.oil_co2 as number | undefined,
                  methane: pointObj.methane as number | undefined,
                  temperature_change_from_co2:
                    pointObj.temperature_change_from_co2 as number | undefined,
                  population: pointObj.population as number | undefined,
                  gdp: pointObj.gdp as number | undefined,
                  per_capita:
                    (pointObj.co2_per_capita as number) ||
                    (pointObj.cement_co2_per_capita as number) ||
                    (pointObj.oil_co2_per_capita as number) ||
                    (pointObj.gas_co2_per_capita as number) ||
                    (pointObj.coal_co2_per_capita as number) ||
                    undefined,
                  source: 'Our World in Data' as string | undefined,
                  isoCode: countryIsoCode,
                };
              }
            );

            if (transformedPoints.length > 0) {
              transformed[key] = transformedPoints;
            }
          }
        }
      });
    }

    if (Object.keys(transformed).length > 0) {
      return transformed;
    }
  }

  throw new Error('Unable to transform external data to expected format');
}

function isValidCO2Data(data: unknown): data is CountryCO2Data {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const countries = Object.keys(data as Record<string, unknown>);
  if (countries.length === 0) {
    return false;
  }

  const first = (data as Record<string, unknown>)[countries[0]];

  if (!Array.isArray(first)) {
    return false;
  }

  if (first.length > 0) {
    const firstPoint = first[0] as Partial<CO2DataPoint>;

    if (typeof firstPoint.year !== 'number') {
      return false;
    }
    if (typeof firstPoint.emissions !== 'number') {
      return false;
    }
  }

  return true;
}

function processData(rawData: CountryCO2Data): CO2DataResponse {
  const countries = Object.keys(rawData);
  const allYears = new Set<number>();

  Object.values(rawData).forEach((points) => {
    points.forEach((dp) => allYears.add(dp.year));
  });

  const years = Array.from(allYears).sort((a, b) => a - b);

  return {
    data: rawData,
    metadata: {
      totalCountries: countries.length,
      yearRange: {
        min: years[0] ?? 0,
        max: years[years.length - 1] ?? 0,
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'CO2 Emissions Database',
    },
  };
}

export {
  apiFetchCO2Data,
  apiRefetchCO2Data,
  apiGetCountryData,
  apiGetCountriesSummary,
  apiGetTopEmitters,
  apiSearchCountries,
  apiGetEmissionsByYearRange,
  apiGetGlobalEmissionsTrend,
};
