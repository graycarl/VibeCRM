import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DynamicForm from '../../src/components/dynamic/DynamicForm';
import { MetaObject, MetaField } from '../../src/services/metaApi';

// Mock the metaApi module
vi.mock('../../src/services/metaApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    metaApi: {
      ...actual.metaApi,
      getMetadataOptions: vi.fn().mockResolvedValue([
        { value: 'cs_customer', label: 'Customer' },
        { value: 'cs_order', label: 'Order' }
      ]),
    }
  };
});

describe('DynamicForm Metadata', () => {
    const mockObject: MetaObject = {
        id: '1', name: 'test', label: 'Test', source: 'custom', created_on: '', fields: []
    };
    
    it('fetches options and renders Metadata field', async () => {
        const fields: MetaField[] = [
            { id: 'f1', object_id: '1', name: 'meta_ref', label: 'Ref', data_type: 'Metadata', is_required: false, source: 'custom' }
        ];
        
        render(<DynamicForm object={mockObject} fields={fields} onSubmit={() => {}} />);
        
        // Wait for input to be present (Autocomplete text field)
        const input = await screen.findByLabelText('Ref');
        expect(input).toBeInTheDocument();
        
        // Trigger autocomplete (click to open)
        // MUI Autocomplete usually opens on click or type.
        // We'll try to find the combobox role.
        const combobox = screen.getByRole('combobox', { name: 'Ref' });
        fireEvent.mouseDown(combobox);
        
        // Check if options are rendered in the document (usually in a portal)
        // We use findByText which waits.
        const option = await screen.findByText('Customer');
        expect(option).toBeInTheDocument();
        
        // Select it
        fireEvent.click(option);
        
        // Value should be updated (Display label)
        expect(input).toHaveValue('Customer');
    });
});
