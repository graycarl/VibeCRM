import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import DynamicDataGrid from './DynamicDataGrid';
import { GridSortModel } from '@mui/x-data-grid';

// Mock ResizeObserver for DataGrid
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('DynamicDataGrid Sorting', () => {
  const mockFields = [
    { name: 'name', label: 'Name', data_type: 'Text', type: 'Text' },
    { name: 'amount', label: 'Amount', data_type: 'Number', type: 'Number' },
    { name: 'event_date', label: 'Event Date', data_type: 'Datetime', type: 'Datetime' },
  ];

  const mockRows = [
    { id: '1', uid: '1', name: 'A', amount: 10, event_date: '2023-01-01' },
    { id: '2', uid: '2', name: 'B', amount: 20, event_date: '2023-01-02' },
  ];

  it('calls onSortModelChange when a sortable column header is clicked', async () => {
    const handleSortChange = vi.fn();
    const sortModel: GridSortModel = [];

    render(
      <DynamicDataGrid 
        fields={mockFields} 
        rows={mockRows}
        sortModel={sortModel}
        onSortModelChange={handleSortChange}
      />
    );

    // Find the column header for 'Amount' (Number type - sortable)
    const amountHeader = screen.getByRole('columnheader', { name: /Amount/i });
    
    // Click to sort
    // Note: MUI DataGrid interaction in tests can be complex.
    // We target the button inside the header usually.
    const sortButton = amountHeader.querySelector('.MuiDataGrid-columnHeaderTitleContainer');
    fireEvent.click(sortButton!);

    // Wait for callback
    // Note: MUI DataGrid might debounce or delay updates slightly?
    // Actually, checking if it was called with expected params.
    // By default, first click is ASC.
    
    // Since we passed sortModel, it's in controlled mode (server-side sorting).
    // DataGrid should fire onSortModelChange.
    
    // MUI X v6+ might behave differently, but let's try standard click
    // Sometimes need to await.
    await waitFor(() => {
        expect(handleSortChange).toHaveBeenCalled();
    });
    
    const callArgs = handleSortChange.mock.calls[0][0];
    expect(callArgs).toEqual([{ field: 'amount', sort: 'asc' }]);
  });

  it('does NOT call onSortModelChange when a non-sortable column header is clicked', async () => {
    const handleSortChange = vi.fn();
    const sortModel: GridSortModel = [];

    render(
      <DynamicDataGrid 
        fields={mockFields} 
        rows={mockRows}
        sortModel={sortModel}
        onSortModelChange={handleSortChange}
      />
    );

    // Find the column header for 'Name' (Text type - NOT sortable per our logic)
    const nameHeader = screen.getByRole('columnheader', { name: /Name/i });
    const sortButton = nameHeader.querySelector('.MuiDataGrid-columnHeaderTitleContainer');
    
    fireEvent.click(sortButton!);

    // Should not trigger sort change
    // We wait a bit just to be sure it didn't happen asynchronously
    await new Promise(r => setTimeout(r, 100));
    expect(handleSortChange).not.toHaveBeenCalled();
  });
});
