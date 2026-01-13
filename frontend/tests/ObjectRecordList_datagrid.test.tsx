import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ObjectRecordList from '../src/pages/runtime/ObjectRecordList';
import { metaApi } from '../src/services/metaApi';
import { dataApi } from '../src/services/dataApi';
import axios from 'axios';

// Mock dependencies
vi.mock('../src/services/metaApi');
vi.mock('../src/services/dataApi');
vi.mock('axios');

const mockObject = { id: 1, name: 'account', label: 'Account' };
const mockFields = [
  { name: 'name', label: 'Account Name', type: 'Text' },
  { name: 'industry', label: 'Industry', type: 'Text' }
];
const mockRecords = [
  { uid: 'rec1', name: 'Acme', industry: 'Tech' },
  { uid: 'rec2', name: 'Global', industry: 'Finance' }
];

describe('ObjectRecordList with DataGrid', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (metaApi.getObjects as any).mockResolvedValue([mockObject]);
    (metaApi.getObject as any).mockResolvedValue({ ...mockObject, fields: mockFields });
    (dataApi.listRecords as any).mockResolvedValue({ items: mockRecords, total: mockRecords.length });
    (axios.get as any).mockResolvedValue({ data: [] }); // No list views
  });

  it('renders the list using DataGrid', async () => {
    render(
      <MemoryRouter initialEntries={['/app/account']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/app/:objectName" element={<ObjectRecordList />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data loading
    await waitFor(() => {
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    // Verify headers (DataGrid specific)
    expect(screen.getByRole('columnheader', { name: 'Account Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Industry' })).toBeInTheDocument();

    // Verify data
    // DataGrid cells might be a bit tricky to select by role 'cell' if virtualized, 
    // but with 2 rows it should be rendered.
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Global')).toBeInTheDocument();
  });

  it('renders action buttons', async () => {
    render(
      <MemoryRouter initialEntries={['/app/account']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/app/:objectName" element={<ObjectRecordList />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Acme')).toBeInTheDocument();
    });

    // Check for edit and delete buttons (assuming there are 2 rows, there should be 2 of each)
    const editButtons = screen.getAllByTestId('EditIcon');
    expect(editButtons.length).toBeGreaterThanOrEqual(1);

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });
});
