import type { CO2DataPoint } from '../types';
import type { ColumnOption } from '../types';

function getColumnValue(
  dataPoint: CO2DataPoint,
  columnKey: string,
  countryName?: string
): string {
  switch (columnKey) {
    case 'country':
      return countryName || 'N/A';
    case 'year':
      return dataPoint.year.toString();
    case 'isoCode':
      return dataPoint.isoCode || 'N/A';
    case 'population':
      return dataPoint.population?.toLocaleString() || 'N/A';
    case 'emissions':
      return dataPoint.emissions?.toLocaleString() || 'N/A';
    case 'oil_co2':
      return dataPoint.oil_co2?.toLocaleString() || 'N/A';
    case 'methane':
      return dataPoint.methane?.toFixed(2) || 'N/A';
    case 'temperature_change_from_co2':
      return dataPoint.temperature_change_from_co2?.toFixed(8) || 'N/A';
    case 'per_capita':
      return dataPoint.per_capita?.toFixed(2) || 'N/A';
    case 'gdp':
      return dataPoint.gdp?.toLocaleString() || 'N/A';
    case 'source':
      return dataPoint.source || 'N/A';
    default:
      return 'N/A';
  }
}

const AVAILABLE_COLUMNS: ColumnOption[] = [
  {
    key: 'country',
    label: 'Country',
    description: 'Country name',
    defaultVisible: true,
  },
  {
    key: 'year',
    label: 'Year',
    description: 'Data collection year',
    defaultVisible: true,
  },
  {
    key: 'isoCode',
    label: 'ISO Code',
    description: 'Country ISO code',
    defaultVisible: true,
  },
  {
    key: 'population',
    label: 'Population',
    description: 'Country population count',
    defaultVisible: true,
  },
  {
    key: 'emissions',
    label: 'CO2 Emissions (kt)',
    description: 'Total CO2 emissions in kilotons',
    defaultVisible: true,
  },
  {
    key: 'per_capita',
    label: 'CO2 per Capita',
    description: 'CO2 emissions per person',
    defaultVisible: true,
  },
  {
    key: 'oil_co2',
    label: 'Oil CO2 (kt)',
    description: 'CO2 emissions from oil consumption in kilotons',
    defaultVisible: false,
  },
  {
    key: 'methane',
    label: 'Methane (kt)',
    description: 'Methane emissions in kilotons',
    defaultVisible: false,
  },
  {
    key: 'temperature_change_from_co2',
    label: 'Temperature Change (°C)',
    description: 'Temperature change from CO2 emissions',
    defaultVisible: false,
  },
  {
    key: 'gdp',
    label: 'GDP',
    description: 'Gross Domestic Product in USD',
    defaultVisible: false,
  },
  {
    key: 'source',
    label: 'Data Source',
    description: 'Source of the data',
    defaultVisible: false,
  },
];

export { getColumnValue, AVAILABLE_COLUMNS };
