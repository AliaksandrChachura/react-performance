interface CO2DataPoint {
  year: number;
  emissions: number;
  oil_co2?: number;
  methane?: number;
  population?: number;
  gdp?: number;
  per_capita?: number;
  source?: string;
  isoCode?: string;
  temperature_change_from_co2?: number;
}

interface CountryCO2Data {
  [country: string]: CO2DataPoint[];
}

interface CO2DataResponse {
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

interface CountrySummary {
  name: string;
  totalEmissions: number;
  averageEmissions: number;
  yearRange: {
    min: number;
    max: number;
  };
  dataPoints: number;
}

interface ColumnOption {
  key: string;
  label: string;
  description: string;
  defaultVisible: boolean;
}

interface ColumnSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColumnsChange: (selectedColumns: string[]) => void;
  currentColumns: string[];
}

export type {
  CO2DataPoint,
  CountryCO2Data,
  CO2DataResponse,
  CountrySummary,
  ColumnOption,
  ColumnSelectorModalProps,
};
