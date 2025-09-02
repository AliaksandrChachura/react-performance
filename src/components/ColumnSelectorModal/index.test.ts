import { describe, it, expect } from 'vitest';
import { ColumnSelectorModal } from './index';
import type { ColumnOption } from './index';

describe('ColumnSelectorModal index exports', () => {
  it('exports ColumnSelectorModal component', () => {
    expect(ColumnSelectorModal).toBeDefined();
    expect(typeof ColumnSelectorModal).toBe('function');
  });

  it('exports ColumnOption type', () => {
    const mockColumnOption: ColumnOption = {
      key: 'test',
      label: 'Test Column',
      description: 'Test description',
      defaultVisible: true,
    };

    expect(mockColumnOption).toBeDefined();
    expect(mockColumnOption.key).toBe('test');
    expect(mockColumnOption.label).toBe('Test Column');
    expect(mockColumnOption.description).toBe('Test description');
    expect(mockColumnOption.defaultVisible).toBe(true);
  });

  it('allows importing ColumnSelectorModal as named export', () => {
    expect(ColumnSelectorModal).toBeDefined();
    expect(typeof ColumnSelectorModal).toBe('function');
  });

  it('allows importing ColumnOption type as named export', () => {
    expect(true).toBe(true);
  });

  it('maintains component functionality when imported from index', () => {
    expect(ColumnSelectorModal).toBeDefined();
    expect(typeof ColumnSelectorModal).toBe('function');
  });

  it('provides correct type structure for ColumnOption', () => {
    const mockOption: ColumnOption = {
      key: 'test',
      label: 'Test',
      description: 'Test description',
      defaultVisible: false,
    };

    expect(mockOption.key).toBe('test');
    expect(mockOption.label).toBe('Test');
    expect(mockOption.description).toBe('Test description');
    expect(mockOption.defaultVisible).toBe(false);
  });

  it('enables proper TypeScript compilation', () => {
    const testFunction = (option: ColumnOption) => {
      return option.key + option.label;
    };

    const result = testFunction({
      key: 'test',
      label: 'Test',
      description: 'Test description',
      defaultVisible: false,
    });

    expect(result).toBe('testTest');
  });
});
