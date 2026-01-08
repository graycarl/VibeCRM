import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Checkbox, FormControlLabel, Grid, Paper } from '@mui/material';
import { MetaObject, MetaField } from '../../services/metaApi';

interface Props {
  object: MetaObject;
  fields: MetaField[];
  onSubmit: (data: any) => void;
  initialValues?: any;
}

const DEFAULT_INITIAL_VALUES = {};

const DynamicForm: React.FC<Props> = ({ object, fields, onSubmit, initialValues = DEFAULT_INITIAL_VALUES }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialValues
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const renderField = (field: MetaField) => {
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
                control={<Checkbox checked={!!value} onChange={onChange} color="primary" />}
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
                error={!!errors[field.name]}
                helperText={errors[field.name] ? '该字段必填' : ''}
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
