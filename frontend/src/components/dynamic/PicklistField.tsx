import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { PicklistOption } from '../../types/metadata';

interface PicklistFieldProps {
  label: string;
  options: PicklistOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export const PicklistField: React.FC<PicklistFieldProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  required,
  disabled
}) => {
  // Find the selected option object based on the name (value)
  const selectedOption = options.find(opt => opt.name === value) || null;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      value={selectedOption}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.name : null);
      }}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          variant="outlined"
          fullWidth
        />
      )}
      // FR-009: Clearable behavior – required fields are non-clearable, non-required fields are clearable
      disableClearable={!!required} 
    />
  );
};
