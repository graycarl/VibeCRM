import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import { RecordTypeSelectorDialog } from './RecordTypeSelectorDialog';
import { MetaObjectRecordType } from '../../services/metaApi';

const mockRecordTypes: MetaObjectRecordType[] = [
    { id: '1', object_id: 'obj1', name: 'professional', label: 'Professional', order: 1, source: 'custom' },
    { id: '2', object_id: 'obj1', name: 'enterprise', label: 'Enterprise', order: 0, source: 'custom' }
];

describe('RecordTypeSelectorDialog', () => {
    test('renders correctly when open', () => {
        const handleClose = vi.fn();
        const handleSelect = vi.fn();
        
        render(
            <RecordTypeSelectorDialog 
                open={true} 
                recordTypes={mockRecordTypes}
                onClose={handleClose}
                onSelect={handleSelect}
            />
        );
        
        expect(screen.getByText('Select Record Type')).toBeInTheDocument();
        expect(screen.getByText('Professional')).toBeInTheDocument();
        expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    test('sorts record types by order', () => {
        const handleClose = vi.fn();
        const handleSelect = vi.fn();
        
        render(
            <RecordTypeSelectorDialog 
                open={true} 
                recordTypes={mockRecordTypes}
                onClose={handleClose}
                onSelect={handleSelect}
            />
        );
        
        const items = screen.getAllByRole('button');
        // Enterprise has order 0, Professional order 1
        expect(items[0]).toHaveTextContent('Enterprise');
        expect(items[1]).toHaveTextContent('Professional');
    });

    test('calls onSelect when clicking an item', () => {
        const handleClose = vi.fn();
        const handleSelect = vi.fn();
        
        render(
            <RecordTypeSelectorDialog 
                open={true} 
                recordTypes={mockRecordTypes}
                onClose={handleClose}
                onSelect={handleSelect}
            />
        );
        
        fireEvent.click(screen.getByText('Professional'));
        expect(handleSelect).toHaveBeenCalledWith(mockRecordTypes[0]);
    });
    
    test('calls onClose when clicking Cancel', () => {
        const handleClose = vi.fn();
        const handleSelect = vi.fn();
        
        render(
            <RecordTypeSelectorDialog 
                open={true} 
                recordTypes={mockRecordTypes}
                onClose={handleClose}
                onSelect={handleSelect}
            />
        );
        
        fireEvent.click(screen.getByText('Cancel'));
        expect(handleClose).toHaveBeenCalled();
    });
});
