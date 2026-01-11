import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DynamicDataGrid from '../../src/components/data/DynamicDataGrid';
import { MetaField } from '../../src/services/metaApi';

describe('DynamicDataGrid', () => {
  const mockFields: MetaField[] = [
    { name: 'name', label: 'Name', type: 'Text' },
    { name: 'age', label: 'Age', type: 'Number' },
  ];

  const mockRows = [
    { uid: '1', name: 'John Doe', age: 30 },
    { uid: '2', name: 'Jane Smith', age: 25 },
  ];

  it('renders without crashing', () => {
    render(<DynamicDataGrid fields={mockFields} rows={mockRows} />);
    // Check for column headers using the role 'columnheader' and name
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
  });
});
