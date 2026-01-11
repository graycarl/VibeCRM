import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DynamicForm from '../../src/components/dynamic/DynamicForm';
import { MetaObject, MetaField } from '../../src/services/metaApi';

describe('DynamicForm', () => {
  const mockObject: MetaObject = {
    id: '1',
    name: 'account',
    label: 'Account',
    source: 'system'
  };

  const mockFields: MetaField[] = [
    { id: 'f1', object_id: '1', name: 'name', label: 'Name', data_type: 'Text', is_required: true, source: 'custom' },
    { id: 'f2', object_id: '1', name: 'start_at', label: 'Start At', data_type: 'Datetime', is_required: false, source: 'custom' },
    { id: 'f3', object_id: '1', name: 'created_at', label: 'Created At', data_type: 'Datetime', is_required: false, source: 'system' },
  ];

  it('renders datetime-local input for Datetime fields', () => {
    render(<DynamicForm object={mockObject} fields={mockFields} onSubmit={() => {}} />);
    
    const startAtInput = screen.getByLabelText('Start At');
    expect(startAtInput).toHaveAttribute('type', 'datetime-local');
  });

  it('converts UTC ISO string to local format for value and back for onChange', async () => {
    const onSubmit = vi.fn();
    const initialValues = {
      name: 'Test',
      start_at: '2023-10-27T10:00:00.000Z'
    };
    
    render(
      <DynamicForm 
        object={mockObject} 
        fields={mockFields} 
        initialValues={initialValues} 
        onSubmit={onSubmit} 
      />
    );

    const startAtInput = screen.getByLabelText('Start At') as HTMLInputElement;
    
    // Check initial value conversion (Value in input should be local)
    // new Date('2023-10-27T10:00:00.000Z') -> YYYY-MM-DDTHH:mm
    const date = new Date('2023-10-27T10:00:00.000Z');
    const expectedValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    expect(startAtInput.value).toBe(expectedValue);

    // Change value
    fireEvent.change(startAtInput, { target: { value: '2023-12-25T15:30' } });
    
    const saveButton = screen.getByText('保存记录');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    const submittedData = onSubmit.mock.calls[0][0];
    expect(submittedData.name).toBe('Test');
    
    // submitted value should be UTC ISO
    const submittedDate = new Date(submittedData.start_at);
    expect(submittedDate.toISOString()).toBe(new Date('2023-12-25T15:30').toISOString());
  });

  it('disables created_at and updated_at fields', () => {
    render(<DynamicForm object={mockObject} fields={mockFields} onSubmit={() => {}} />);
    
    const createdAtInput = screen.getByLabelText('Created At');
    expect(createdAtInput).toBeDisabled();
    
    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).not.toBeDisabled();
    
    const startAtInput = screen.getByLabelText('Start At');
    expect(startAtInput).not.toBeDisabled();
  });
});
