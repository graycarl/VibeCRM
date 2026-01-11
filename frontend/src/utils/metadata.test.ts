import { getOptionLabel } from './metadata';
import { describe, it, expect } from 'vitest';
import { MetaField } from '../services/metaApi';

describe('getOptionLabel', () => {
  const field: Partial<MetaField> = {
    data_type: 'Picklist',
    options: [
      { name: 'male', label: '男' },
      { name: 'female', label: '女' }
    ]
  };

  it('maps name to label correctly', () => {
    expect(getOptionLabel(field, 'male')).toBe('男');
    expect(getOptionLabel(field, 'female')).toBe('女');
  });

  it('returns original value if name not found', () => {
    expect(getOptionLabel(field, 'other')).toBe('other');
  });

  it('returns empty string for null/undefined/empty values', () => {
    expect(getOptionLabel(field, null)).toBe('');
    expect(getOptionLabel(field, undefined)).toBe('');
    expect(getOptionLabel(field, '')).toBe('');
  });

  it('returns original value if not a picklist', () => {
    const textField: Partial<MetaField> = { data_type: 'Text' };
    expect(getOptionLabel(textField, 'hello')).toBe('hello');
  });
});
