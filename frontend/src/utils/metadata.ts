import { MetaField } from '../services/metaApi';

/**
 * Gets the display label for a picklist value.
 * @param field The metadata field definition.
 * @param value The value (name) to map to a label.
 * @returns The label if found, otherwise the original value.
 */
export const getOptionLabel = (field: Partial<MetaField>, value: any): string => {
  if (value == null || value === '') return '';
  if (field.data_type !== 'Picklist' || !field.options) return String(value);

  const option = field.options.find((opt: any) => opt.name === value);
  return option ? option.label : String(value);
};
