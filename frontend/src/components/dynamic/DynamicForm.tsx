import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { MetaObject, MetaField } from '../../services/metaApi';

interface Props {
  object: MetaObject;
  fields: MetaField[];
  onSubmit: (data: any) => void;
  initialValues?: any;
}

const DynamicForm: React.FC<Props> = ({ object, fields, onSubmit, initialValues = {} }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialValues
  });

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
                margin="normal"
                value={value || ''}
                onChange={onChange}
                error={!!errors[field.name]}
                helperText={errors[field.name] ? 'Required' : ''}
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
                margin="normal"
                value={value || ''}
                onChange={(e) => onChange(Number(e.target.value))}
                error={!!errors[field.name]}
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
                control={<Checkbox checked={!!value} onChange={onChange} />}
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
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={value || ''}
                onChange={onChange}
                error={!!errors[field.name]}
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
                margin="normal"
                value={value || ''}
                onChange={onChange}
                error={!!errors[field.name]}
              />
            )}
          />
        );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      {fields.map(field => (
        <Box key={field.id} mb={2}>
          {renderField(field)}
        </Box>
      ))}
      <Button type="submit" variant="contained" color="primary">
        Save
      </Button>
    </Box>
  );
};

export default DynamicForm;
