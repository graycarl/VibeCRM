import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Checkbox, FormControlLabel, Grid, Paper, InputAdornment, IconButton } from '@mui/material';
import { MetaObject, MetaField } from '../../services/metaApi';
import { PicklistField } from './PicklistField';
import { LookupDialog } from './LookupDialog';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface Props {
  object: MetaObject;
  fields: MetaField[];
  onSubmit: (data: any) => void;
  initialValues?: any;
  readOnlyFields?: string[];
  recordTypeLabels?: Record<string, string>;
}

const DEFAULT_INITIAL_VALUES = {};

const toLocalDatetime = (utcString: string | undefined) => {
  if (!utcString) return '';
  const date = new Date(utcString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toUTCISO = (localString: string) => {
  if (!localString) return '';
  const date = new Date(localString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString();
};

const DynamicForm: React.FC<Props> = ({ 
    object, 
    fields, 
    onSubmit, 
    initialValues = DEFAULT_INITIAL_VALUES,
    readOnlyFields = [],
    recordTypeLabels = {}
}) => {
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: initialValues
  });
  
  const [lookupOpen, setLookupOpen] = useState(false);
  const [activeLookupField, setActiveLookupField] = useState<MetaField | null>(null);

  // Keep track of lookup labels manually or via form state if we want to show them
  // We can store label in a separate state map or rely on initialValues providing a __label field
  const [lookupLabels, setLookupLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
      
      // Extract initial labels
      const labels: Record<string, string> = {};
      fields.forEach(f => {
         if (f.data_type === 'Lookup') {
             if (initialValues[f.name + '__label']) {
                 labels[f.name] = initialValues[f.name + '__label'];
             } else if (initialValues[f.name]) {
                 // If we have value but no label, shows ID until loaded? 
                 // Or maybe initialValues already came from list/get API which has enriched data.
                 // If it's a create form, it's empty.
                 labels[f.name] = initialValues[f.name]; 
             }
         }
      });
      setLookupLabels(labels);
    }
  }, [initialValues, reset, fields]);

  const handleLookupClick = (field: MetaField) => {
    setActiveLookupField(field);
    setLookupOpen(true);
  };

  const handleLookupSelect = (record: any) => {
    if (activeLookupField) {
        // Update form value (ID)
        setValue(activeLookupField.name, record.id, { shouldDirty: true });
        
        // Update display label
        // Try to guess display label again or just use what dialog logic did?
        // Dialog logic logic isn't exposed here. 
        // We do: try name, label, title, subject, etc. 
        const candidates = ['name', 'title', 'subject', 'label', 'email', 'username', 'uid'];
        let label = record.uid;
        for (const key of candidates) {
            if (record[key]) {
                label = record[key];
                break;
            }
        }
        
        setLookupLabels(prev => ({ ...prev, [activeLookupField.name]: label }));
    }
  };

  const handleLookupClear = (fieldName: string) => {
      setValue(fieldName, null, { shouldDirty: true });
      setLookupLabels(prev => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
      });
  };

  const renderField = (field: MetaField) => {
    const isSystemTimestamp = ['created_on', 'modified_on'].includes(field.name);
    const isReadOnly = readOnlyFields.includes(field.name);
    const isDisabled = isSystemTimestamp || isReadOnly;
    
    // Special handling for record_type field to show label instead of name
    if (field.name === 'record_type' && isDisabled) {
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { value } }) => (
              <TextField
                label={field.label}
                fullWidth
                variant="outlined"
                // Show label if available, otherwise value
                value={(value && recordTypeLabels[value]) ? recordTypeLabels[value] : (value || '')}
                disabled
                InputProps={{ readOnly: true }}
              />
            )}
          />
        );
    }

    switch (field.data_type) {
      case 'Text':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.is_required }}
            render={({ field: { onChange, value } }) => (
              <TextField
                label={field.label}
                fullWidth
                variant="outlined"
                value={value || ''}
                onChange={onChange}
                disabled={isDisabled}
                error={!!errors[field.name]}
                helperText={errors[field.name] ? '该字段必填' : ''}
              />
            )}
          />
        );
      case 'Number':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.is_required }}
            render={({ field: { onChange, value } }) => (
              <TextField
                label={field.label}
                type="number"
                fullWidth
                variant="outlined"
                value={value || ''}
                onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={isDisabled}
                error={!!errors[field.name]}
                helperText={errors[field.name] ? '该字段必填' : ''}
              />
            )}
          />
        );
      case 'Boolean':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                control={<Checkbox checked={!!value} onChange={onChange} color="primary" disabled={isDisabled} />}
                label={field.label}
              />
            )}
          />
        );
      case 'Date':
         return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.is_required }}
            render={({ field: { onChange, value } }) => (
              <TextField
                label={field.label}
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={value || ''}
                onChange={onChange}
                disabled={isDisabled}
                error={!!errors[field.name]}
                helperText={errors[field.name] ? '该字段必填' : ''}
              />
            )}
          />
        );
      case 'Datetime':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.is_required }}
            render={({ field: { onChange, value } }) => (
              <TextField
                label={field.label}
                type="datetime-local"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={toLocalDatetime(value)}
                onChange={(e) => onChange(toUTCISO(e.target.value))}
                disabled={isDisabled}
                error={!!errors[field.name]}
                helperText={errors[field.name] ? '该字段必填' : ''}
              />
            )}
          />
        );
      case 'Picklist':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.is_required }}
            render={({ field: { onChange, value } }) => (
              <PicklistField
                label={field.label}
                options={field.options || []}
                value={value || null}
                onChange={onChange}
                disabled={isDisabled}
                error={!!errors[field.name]}
                helperText={errors[field.name] ? '该字段必填' : ''}
                required={field.is_required}
              />
            )}
          />
        );
      case 'Lookup':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.is_required }}
            render={({ field: { value } }) => (
              <TextField
                label={field.label}
                fullWidth
                variant="outlined"
                value={lookupLabels[field.name] || value || ''}
                disabled={isDisabled}
                error={!!errors[field.name]}
                helperText={errors[field.name] ? 'This field is required' : ''}
                InputProps={{
                  readOnly: true,
                  endAdornment: !isDisabled && (
                    <InputAdornment position="end">
                       {value && (
                           <IconButton onClick={() => handleLookupClear(field.name)} edge="end" sx={{ mr: 0.5 }}>
                               <ClearIcon />
                           </IconButton>
                       )}
                       <IconButton onClick={() => handleLookupClick(field)} edge="end">
                           <SearchIcon />
                       </IconButton>
                    </InputAdornment>
                  )
                }}
                onClick={!isDisabled ? () => handleLookupClick(field) : undefined}
                sx={{ cursor: !isDisabled ? 'pointer' : 'default', '& .MuiInputBase-input': { cursor: !isDisabled ? 'pointer' : 'default' } }}
              />
            )}
          />
        );
      default:
        return (
             <Controller
            name={field.name}
            control={control}
            rules={{ required: field.is_required }}
            render={({ field: { onChange, value } }) => (
              <TextField
                label={field.label}
                fullWidth
                variant="outlined"
                value={value || ''}
                onChange={onChange}
                disabled={isDisabled}
                error={!!errors[field.name]}
                helperText={errors[field.name] ? '该字段必填' : ''}
              />
            )}
          />
        );
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
            {fields.map(field => (
                <Grid item xs={12} sm={field.data_type === 'Boolean' ? 12 : 6} key={field.id}>
                    {renderField(field)}
                </Grid>
            ))}
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button type="submit" variant="contained" size="large">
                保存记录
            </Button>
        </Box>
        </Box>
        
        {activeLookupField && (
            <LookupDialog
                open={lookupOpen}
                onClose={() => setLookupOpen(false)}
                objectName={activeLookupField.lookup_object || ''}
                onSelect={handleLookupSelect}
                title={`Select ${activeLookupField.label}`}
            />
        )}
    </Paper>
  );
};

export default DynamicForm;
