import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Checkbox, FormControlLabel, Grid, Paper } from '@mui/material';
import { MetaObject, MetaField } from '../../services/metaApi';
import { PicklistField } from './PicklistField';

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
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialValues
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const renderField = (field: MetaField) => {
    const isSystemTimestamp = ['created_at', 'updated_at'].includes(field.name);
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
    </Paper>
  );
};

export default DynamicForm;
