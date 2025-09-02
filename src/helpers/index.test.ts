import { describe, it, expect } from 'vitest';
import { getColumnValue, AVAILABLE_COLUMNS } from './index';
import type { CO2DataPoint } from '../types';

describe('Helpers', () => {
  const mockDataPoint: CO2DataPoint = {
    year: 2020,
    population: 83000000,
    emissions: 700000,
    isoCode: 'DEU',
    oil_co2: 500000,
    methane: 45.67,
    temperature_change_from_co2: 0.00001234,
    per_capita: 8.43,
    gdp: 4000000000000,
    source: 'World Bank',
  };

  describe('getColumnValue', () => {
    it('returns correct values for basic columns', () => {
      expect(getColumnValue(mockDataPoint, 'country', 'Germany')).toBe(
        'Germany'
      );
      expect(getColumnValue(mockDataPoint, 'year')).toBe('2020');
      expect(getColumnValue(mockDataPoint, 'isoCode')).toBe('DEU');
    });

    it('formats numeric values with proper formatting', () => {
      expect(getColumnValue(mockDataPoint, 'population')).toBe('83,000,000');
      expect(getColumnValue(mockDataPoint, 'emissions')).toBe('700,000');
      expect(getColumnValue(mockDataPoint, 'oil_co2')).toBe('500,000');
      expect(getColumnValue(mockDataPoint, 'gdp')).toBe('4,000,000,000,000');
    });

    it('formats decimal values with appropriate precision', () => {
      expect(getColumnValue(mockDataPoint, 'methane')).toBe('45.67');
      expect(getColumnValue(mockDataPoint, 'per_capita')).toBe('8.43');
      expect(getColumnValue(mockDataPoint, 'temperature_change_from_co2')).toBe(
        '0.00001234'
      );
    });

    it('handles missing or undefined values gracefully', () => {
      const incompleteDataPoint: Partial<CO2DataPoint> = {
        year: 2020,
        population: undefined,
        emissions: undefined,
        isoCode: undefined,
      };

      expect(
        getColumnValue(incompleteDataPoint as CO2DataPoint, 'population')
      ).toBe('N/A');
      expect(
        getColumnValue(incompleteDataPoint as CO2DataPoint, 'emissions')
      ).toBe('N/A');
      expect(
        getColumnValue(incompleteDataPoint as CO2DataPoint, 'isoCode')
      ).toBe('N/A');
      expect(
        getColumnValue(incompleteDataPoint as CO2DataPoint, 'country')
      ).toBe('N/A');
    });

    it('returns N/A for unknown column keys', () => {
      expect(getColumnValue(mockDataPoint, 'unknown_column')).toBe('N/A');
      expect(getColumnValue(mockDataPoint, 'invalid_key')).toBe('N/A');
    });
  });

  describe('AVAILABLE_COLUMNS', () => {
    it('contains all expected column definitions', () => {
      expect(AVAILABLE_COLUMNS).toHaveLength(11);

      const columnKeys = AVAILABLE_COLUMNS.map((col) => col.key);
      expect(columnKeys).toContain('country');
      expect(columnKeys).toContain('year');
      expect(columnKeys).toContain('isoCode');
      expect(columnKeys).toContain('population');
      expect(columnKeys).toContain('emissions');
      expect(columnKeys).toContain('per_capita');
      expect(columnKeys).toContain('oil_co2');
      expect(columnKeys).toContain('methane');
      expect(columnKeys).toContain('temperature_change_from_co2');
      expect(columnKeys).toContain('gdp');
      expect(columnKeys).toContain('source');
    });

    it('has correct structure for each column option', () => {
      AVAILABLE_COLUMNS.forEach((column) => {
        expect(column).toHaveProperty('key');
        expect(column).toHaveProperty('label');
        expect(column).toHaveProperty('description');
        expect(column).toHaveProperty('defaultVisible');
        expect(typeof column.key).toBe('string');
        expect(typeof column.label).toBe('string');
        expect(typeof column.description).toBe('string');
        expect(typeof column.defaultVisible).toBe('boolean');
      });
    });

    it('sets appropriate default visibility for columns', () => {
      const visibleColumns = AVAILABLE_COLUMNS.filter(
        (col) => col.defaultVisible
      );
      const hiddenColumns = AVAILABLE_COLUMNS.filter(
        (col) => !col.defaultVisible
      );

      expect(visibleColumns).toHaveLength(6);
      expect(hiddenColumns).toHaveLength(5);

      expect(visibleColumns.map((col) => col.key)).toEqual([
        'country',
        'year',
        'isoCode',
        'population',
        'emissions',
        'per_capita',
      ]);

      expect(hiddenColumns.map((col) => col.key)).toEqual([
        'oil_co2',
        'methane',
        'temperature_change_from_co2',
        'gdp',
        'source',
      ]);
    });
  });
});
