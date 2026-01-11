import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DynamicDataGrid from '../../src/components/data/DynamicDataGrid';
import { MetaField } from '../../src/services/metaApi';

describe('DynamicDataGrid', () => {
  const mockFields: any[] = [
    { name: 'name', label: 'Name', data_type: 'Text' },
    { name: 'age', label: 'Age', data_type: 'Number' },
    { name: 'created_at', label: 'Created At', data_type: 'Datetime' },
  ];

  const mockRows = [
    { uid: '1', name: 'John Doe', age: 30, created_at: '2026-01-11T12:00:00Z' },
    { uid: '2', name: 'Jane Smith', age: 25, created_at: '2026-01-11T13:00:00Z' },
  ];

  it('renders without crashing', () => {
    render(<DynamicDataGrid fields={mockFields} rows={mockRows} />);
    // Check for column headers using the role 'columnheader' and name
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Created At' })).toBeInTheDocument();
  });
});
