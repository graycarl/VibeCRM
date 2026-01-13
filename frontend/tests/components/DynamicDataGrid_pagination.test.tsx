import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DynamicDataGrid from '../../src/components/data/DynamicDataGrid';
import { MetaField } from '../../src/services/metaApi';

const mockFields: (Partial<MetaField> & { name: string, label: string })[] = [
  { name: 'name', label: 'Name', data_type: 'Text' }
];

const mockRows = Array.from({ length: 50 }, (_, i) => ({
  uid: `id-${i}`,
  name: `Record ${i}`
}));

describe('DynamicDataGrid Pagination', () => {
  it('renders pagination controls correctly', () => {
    render(
      <DynamicDataGrid
        fields={mockFields}
        rows={mockRows}
        loading={false}
        rowCount={50}
        paginationModel={{ page: 0, pageSize: 10 }}
      />
    );
    // Check for pagination text like "1–10 of 50"
    expect(screen.getByText(/1–10 of 50/i)).toBeInTheDocument();
  });

  it('triggers pagination change when prop provided', async () => {
    const handlePaginationChange = vi.fn();
    
    render(
      <DynamicDataGrid
        fields={mockFields}
        rows={mockRows.slice(0, 10)}
        loading={false}
        rowCount={100}
        paginationModel={{ page: 0, pageSize: 10 }}
        onPaginationModelChange={handlePaginationChange}
      />
    );

    // Find next page button and click
    const nextButton = screen.getByTitle(/Go to next page/i);
    fireEvent.click(nextButton);

    expect(handlePaginationChange).toHaveBeenCalled();
  });

  it('provides correct page size options', () => {
    render(
      <DynamicDataGrid
        fields={mockFields}
        rows={mockRows.slice(0, 10)}
        loading={false}
        rowCount={100}
        paginationModel={{ page: 0, pageSize: 10 }}
      />
    );

    // Click the rows per page select
    const select = screen.getByLabelText(/Rows per page/i);
    fireEvent.mouseDown(select);

    // Check if options are present (using text matches)
    // Note: MUI Select options might be in a Portal, but Testing Library can usually find them
    expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '25' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
  });
});
