import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { PicklistOptionsEditor } from './PicklistOptionsEditor';
import { metaApi } from '../../services/metaApi';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock metaApi
vi.mock('../../services/metaApi', () => ({
  metaApi: {
    addOption: vi.fn(),
    updateOption: vi.fn(),
    deleteOption: vi.fn(),
  },
}));

describe('PicklistOptionsEditor', () => {
  const fieldId = 'test-field-id';
  const initialOptions = [
    { name: 'opt1', label: 'Option 1' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial options', () => {
    render(<PicklistOptionsEditor fieldId={fieldId} initialOptions={initialOptions} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('opt1')).toBeInTheDocument();
  });

  it('adds a new option', async () => {
    (metaApi.addOption as any).mockResolvedValue({});
    render(<PicklistOptionsEditor fieldId={fieldId} initialOptions={[]} />);

    fireEvent.change(screen.getByLabelText(/Name \(API\)/i), { target: { value: 'new_opt' } });
    fireEvent.change(screen.getByLabelText(/Label \(显示\)/i), { target: { value: 'New Label' } });
    fireEvent.click(screen.getByText('添加'));

    await waitFor(() => {
      expect(metaApi.addOption).toHaveBeenCalledWith(fieldId, { name: 'new_opt', label: 'New Label' });
      expect(screen.getByText('New Label')).toBeInTheDocument();
    });
  });

  it('updates an option', async () => {
    (metaApi.updateOption as any).mockResolvedValue({});
    render(<PicklistOptionsEditor fieldId={fieldId} initialOptions={initialOptions} />);

    // Material UI IconButton with tooltip might not have Label text directly.
    // I'll search for the icon or use a more specific selector.
    // In PicklistOptionsEditor I added color="info" for EditIcon
    const editBtn = screen.getAllByRole('button').find(btn => btn.querySelector('svg[data-testid="EditIcon"]'));
    if (editBtn) fireEvent.click(editBtn);

    // After clicking edit, there are multiple Labels. The one we want is the one we just opened.
    const labelInputs = screen.getAllByLabelText(/Label/i);
    // Usually the last one added to DOM or we can check the value.
    const targetInput = labelInputs.find(input => (input as HTMLInputElement).value === 'Option 1');
    if (targetInput) fireEvent.change(targetInput, { target: { value: 'Updated Label' } });
    
    const saveBtn = screen.getByTestId('SaveIcon').parentElement;
    if (saveBtn) fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(metaApi.updateOption).toHaveBeenCalledWith(fieldId, 'opt1', 'Updated Label');
      expect(screen.getByText('Updated Label')).toBeInTheDocument();
    });
  });

  it('deletes an option without migration', async () => {
    (metaApi.deleteOption as any).mockResolvedValue({});
    render(<PicklistOptionsEditor fieldId={fieldId} initialOptions={initialOptions} />);

    const deleteBtn = screen.getByTestId('delete-option-opt1');
    fireEvent.click(deleteBtn);

    // Wait for Dialog to be open
    await waitFor(() => {
      expect(screen.getByText(/确定要删除选项/)).toBeInTheDocument();
    });
    
    // Click delete in dialog (which is red button with "删除" text)
    const confirmDeleteBtn = screen.getByRole('button', { name: '删除' });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(metaApi.deleteOption).toHaveBeenCalledWith(fieldId, 'opt1', undefined);
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('deletes an option with migration', async () => {
    const multiOptions = [
      { name: 'opt1', label: 'Option 1' },
      { name: 'opt2', label: 'Option 2' },
    ];
    (metaApi.deleteOption as any).mockResolvedValue({});
    render(<PicklistOptionsEditor fieldId={fieldId} initialOptions={multiOptions} />);

    // Find delete button for Option 1
    const deleteBtn = screen.getByTestId('delete-option-opt1');
    fireEvent.click(deleteBtn);

    // Wait for Dialog
    await waitFor(() => {
      expect(screen.getByTestId('migrate-to-select')).toBeInTheDocument();
    });

    // Select Option 2 for migration
    // For MUI Select, we usually need to click the element with the label
    const select = screen.getByLabelText(/将现有数据迁移至/i);
    fireEvent.mouseDown(select);
    
    // MUI renders options in a listbox
    const listbox = await screen.findByRole('listbox');
    const option2 = within(listbox).getByText(/Option 2/);
    fireEvent.click(option2);

    // Click delete in dialog
    const confirmDeleteBtn = screen.getByRole('button', { name: '删除' });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(metaApi.deleteOption).toHaveBeenCalledWith(fieldId, 'opt1', 'opt2');
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });
});
