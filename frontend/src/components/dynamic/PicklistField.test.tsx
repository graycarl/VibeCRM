import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PicklistField } from './PicklistField';
import { describe, it, expect, vi } from 'vitest';

describe('PicklistField', () => {
  const options = [
    { name: 'male', label: '男' },
    { name: 'female', label: '女' },
  ];

  it('renders correctly with options', () => {
    render(<PicklistField label="性别" options={options} value={null} onChange={() => {}} />);
    expect(screen.getByLabelText('性别')).toBeInTheDocument();
  });

  it('calls onChange when an option is selected', () => {
    const onChange = vi.fn();
    render(<PicklistField label="性别" options={options} value={null} onChange={onChange} />);
    
    const input = screen.getByLabelText('性别');
    fireEvent.mouseDown(input);
    fireEvent.click(screen.getByText('男'));
    
    expect(onChange).toHaveBeenCalledWith('male');
  });

  it('shows the label of the selected value', () => {
    render(<PicklistField label="性别" options={options} value="female" onChange={() => {}} />);
    expect(screen.getByDisplayValue('女')).toBeInTheDocument();
  });

  it('is clearable when not required', () => {
    const onChange = vi.fn();
    render(<PicklistField label="性别" options={options} value="male" onChange={onChange} required={false} />);
    
    const clearBtn = screen.getByLabelText('Clear');
    fireEvent.click(clearBtn);
    
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
