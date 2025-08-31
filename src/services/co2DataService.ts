import type {
  CO2DataPoint,
  CountryCO2Data,
  CO2DataResponse,
  CountrySummary,
} from '../types/index.js';

class CO2DataService {
  private dataCache: Map<string, unknown> = new Map();
  private dataUrl: string;

  constructor(dataUrl: string = '/co2-data.json') {
    this.dataUrl = dataUrl;
  }

  async fetchCO2Data(): Promise<CO2DataResponse> {
    try {
      const response = await fetch(this.dataUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch CO2 data: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      // Validate data structure
      if (!this.isValidCO2Data(data)) {
        throw new Error('Invalid CO2 data structure');
      }

      // Process and cache the data
      const processedData = this.processData(data);
      this.dataCache.set('co2Data', processedData);

      return processedData;
    } catch (error) {
      console.error('Error fetching CO2 data:', error);
      throw error;
    }
  }

  /**
   * Get data for a specific country
   */
  getCountryData(countryName: string): CO2DataPoint[] | null {
    const cachedData = this.dataCache.get('co2Data') as
      | CO2DataResponse
      | undefined;
    if (!cachedData) return null;

    const countryData = cachedData.data[countryName];
    return countryData || null;
  }

  /**
   * Get summary statistics for all countries
   */
  getCountriesSummary(): CountrySummary[] {
    const cachedData = this.dataCache.get('co2Data') as
      | CO2DataResponse
      | undefined;
    if (!cachedData) return [];

    const summaries: CountrySummary[] = [];

    Object.entries(cachedData.data).forEach(([countryName, dataPoints]) => {
      const emissions = dataPoints
        .map((dp: CO2DataPoint) => dp.emissions)
        .filter((e: number) => e !== undefined);

      if (emissions.length > 0) {
        const totalEmissions = emissions.reduce(
          (sum: number, e: number) => sum + e,
          0
        );
        const averageEmissions = totalEmissions / emissions.length;
        const years = dataPoints
          .map((dp: CO2DataPoint) => dp.year)
          .sort((a: number, b: number) => a - b);

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

  /**
   * Get top emitting countries
   */
  getTopEmitters(limit: number = 10): CountrySummary[] {
    return this.getCountriesSummary().slice(0, limit);
  }

  /**
   * Search countries by name (case-insensitive)
   */
  searchCountries(query: string): string[] {
    const cachedData = this.dataCache.get('co2Data') as
      | CO2DataResponse
      | undefined;
    if (!cachedData) return [];

    const countries = Object.keys(cachedData.data);
    const lowerQuery = query.toLowerCase();

    return countries.filter((country) =>
      country.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get emissions data for a specific year range
   */
  getEmissionsByYearRange(
    startYear: number,
    endYear: number
  ): Record<string, CO2DataPoint[]> {
    const cachedData = this.dataCache.get('co2Data') as
      | CO2DataResponse
      | undefined;
    if (!cachedData) return {};

    const filteredData: Record<string, CO2DataPoint[]> = {};

    Object.entries(cachedData.data).forEach(([country, dataPoints]) => {
      const filteredPoints = dataPoints.filter(
        (dp: CO2DataPoint) => dp.year >= startYear && dp.year <= endYear
      );

      if (filteredPoints.length > 0) {
        filteredData[country] = filteredPoints;
      }
    });

    return filteredData;
  }

  /**
   * Get global emissions trend
   */
  getGlobalEmissionsTrend(): { year: number; totalEmissions: number }[] {
    const cachedData = this.dataCache.get('co2Data') as
      | CO2DataResponse
      | undefined;
    if (!cachedData) return [];

    const yearMap = new Map<number, number>();

    Object.values(cachedData.data).forEach((dataPoints) => {
      dataPoints.forEach((dp: CO2DataPoint) => {
        if (dp.emissions !== undefined) {
          yearMap.set(dp.year, (yearMap.get(dp.year) || 0) + dp.emissions);
        }
      });
    });

    return Array.from(yearMap.entries())
      .map(([year, totalEmissions]) => ({ year, totalEmissions }))
      .sort((a, b) => a.year - b.year);
  }

  /**
   * Clear data cache
   */
  clearCache(): void {
    this.dataCache.clear();
  }

  /**
   * Validate CO2 data structure
   */
  private isValidCO2Data(data: unknown): data is CountryCO2Data {
    if (!data || typeof data !== 'object') return false;

    // Check if it's a simple object with country names as keys
    const countries = Object.keys(data as Record<string, unknown>);
    if (countries.length === 0) return false;

    // Sample validation - check first country's data structure
    const firstCountry = countries[0];
    const firstCountryData = (data as Record<string, unknown>)[firstCountry];

    if (!Array.isArray(firstCountryData)) return false;

    // Check if data points have required fields
    if (firstCountryData.length > 0) {
      const firstDataPoint = firstCountryData[0];
      if (
        typeof firstDataPoint.year !== 'number' ||
        typeof firstDataPoint.emissions !== 'number'
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Process and structure the raw data
   */
  private processData(rawData: CountryCO2Data): CO2DataResponse {
    const countries = Object.keys(rawData);
    const allYears = new Set<number>();

    // Collect all years from all countries
    Object.values(rawData).forEach((dataPoints) => {
      dataPoints.forEach((dp) => allYears.add(dp.year));
    });

    const years = Array.from(allYears).sort((a, b) => a - b);

    return {
      data: rawData,
      metadata: {
        totalCountries: countries.length,
        yearRange: {
          min: years[0] || 0,
          max: years[years.length - 1] || 0,
        },
        lastUpdated: new Date().toISOString(),
        dataSource: 'CO2 Emissions Database',
      },
    };
  }
}

export default CO2DataService;
