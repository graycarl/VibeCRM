import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DynamicDataGrid from '../../src/components/data/DynamicDataGrid';
import { MetaField } from '../../src/services/metaApi';

describe('DynamicDataGrid', () => {
  const mockFields: MetaField[] = [
    { id: '1', object_id: 'obj1', name: 'name', label: 'Name', data_type: 'Text', is_required: true, source: 'custom' },
    { id: '2', object_id: 'obj1', name: 'age', label: 'Age', data_type: 'Number', is_required: false, source: 'custom' },
    { id: '3', object_id: 'obj1', name: 'created_at', label: 'Created At', data_type: 'Datetime', is_required: false, source: 'system' },
  ];

  const mockRows = [
    { uid: '1', name: 'John Doe', age: 30, created_at: '2026-01-11T12:00:00Z' },
    { uid: '2', name: 'Jane Smith', age: 25, created_at: '2026-01-11T13:00:00Z' },
    { uid: '3', name: 'Null Date', age: 40, created_at: null },
  ];

  it('renders without crashing', () => {
    render(<DynamicDataGrid fields={mockFields} rows={mockRows} />);
    // Check for column headers using the role 'columnheader' and name
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Created At' })).toBeInTheDocument();
  });
});
