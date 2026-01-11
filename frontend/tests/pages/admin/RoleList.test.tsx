import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RoleList from '../../../src/pages/admin/RoleList';
import { metaApi } from '../../../src/services/metaApi';

vi.mock('../../../src/services/metaApi');

const mockRoles = [
  { id: 'role1', name: 'admin', label: 'Administrator', source: 'system' },
  { id: 'role2', name: 'sales', label: 'Sales Rep', source: 'custom' }
];

describe('RoleList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (metaApi.getRoles as any).mockResolvedValue(mockRoles);
  });

  it('renders role list', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RoleList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
      expect(screen.getByText('Sales Rep')).toBeInTheDocument();
    });
  });

  it('renders new role button', async () => {
    render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <RoleList />
        </MemoryRouter>
    );
    await waitFor(() => {
        expect(screen.getByText(/New Role/i)).toBeInTheDocument();
    });
  });
});
