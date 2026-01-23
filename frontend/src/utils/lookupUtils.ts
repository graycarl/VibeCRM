/**
 * Utility functions for lookup field handling
 */

/**
 * Get the display label for a record based on common name fields.
 * @param record The record object
 * @returns The display label string
 */
export const getDisplayLabel = (record: any): string => {
  // Try common name fields in priority order
  const candidates = ['name', 'title', 'subject', 'label', 'email', 'username', 'uid'];
  for (const key of candidates) {
    if (record[key]) {
      return String(record[key]);
    }
  }
  return record.uid || '';
};
