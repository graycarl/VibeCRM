import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DynamicForm from './DynamicForm';
import { MetaObject, MetaField } from '../../services/metaApi';
import React from 'react';

const mockObject: MetaObject = {
  id: '1',
  name: 'test_obj',
  label: 'Test Object',
  source: 'custom'
};

const mockFields: MetaField[] = [
  {
    id: 'f1',
    object_id: '1',
    name: 'name',
    label: 'Name',
    data_type: 'Text',
    is_required: true,
    source: 'custom'
  },
  {
    id: 'f2',
    object_id: '1',
    name: 'age',
    label: 'Age',
    data_type: 'Number',
    is_required: false,
    source: 'custom'
  }
];

describe('DynamicForm', () => {
  it('renders fields correctly', () => {
    render(<DynamicForm object={mockObject} fields={mockFields} onSubmit={() => {}} />);
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const handleSubmit = vi.fn();
    render(<DynamicForm object={mockObject} fields={mockFields} onSubmit={handleSubmit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /保存记录/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/该字段必填/i)).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits valid data', async () => {
    const handleSubmit = vi.fn();
    render(<DynamicForm object={mockObject} fields={mockFields} onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /保存记录/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ name: 'Test User', age: 25 }, expect.anything());
    });
  });

  it('populates initial values', () => {
    const initialValues = { name: 'Existing User', age: 30 };
    render(<DynamicForm object={mockObject} fields={mockFields} onSubmit={() => {}} initialValues={initialValues} />);
    
    expect(screen.getByLabelText(/Name/i)).toHaveValue('Existing User');
    expect(screen.getByLabelText(/Age/i)).toHaveValue(30);
  });
});
