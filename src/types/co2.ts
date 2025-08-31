export interface CO2DataPoint {
  year: number;
  emissions: number;
  population?: number;
  gdp?: number;
  per_capita?: number;
  source?: string;
  isoCode?: string;
}

export interface CountryCO2Data {
  [country: string]: CO2DataPoint[];
}

export interface CO2DataResponse {
  data: CountryCO2Data;
  metadata: {
    totalCountries: number;
    yearRange: {
      min: number;
      max: number;
    };
    lastUpdated: string;
    dataSource: string;
  };
}

export interface CountrySummary {
  name: string;
  totalEmissions: number;
  averageEmissions: number;
  yearRange: {
    min: number;
    max: number;
  };
  dataPoints: number;
}
