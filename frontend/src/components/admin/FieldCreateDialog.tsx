import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox,
  Box, Divider
} from '@mui/material';
import { metaApi, MetaField } from '../../services/metaApi';
import { PicklistOptionsEditor } from './PicklistOptionsEditor';

interface Props {
  open: boolean;
  onClose: () => void;
  objectId: string;
  onSuccess: () => void;
  fieldToEdit?: MetaField | null; // Added to support editing
}

const FIELD_TYPES = ['Text', 'Number', 'Date', 'Datetime', 'Boolean', 'Picklist', 'Lookup'];

const FieldCreateDialog: React.FC<Props> = ({ open, onClose, objectId, onSuccess, fieldToEdit }) => {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [dataType, setDataType] = useState('Text');
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdField, setCreatedField] = useState<MetaField | null>(null);

  useEffect(() => {
    if (fieldToEdit) {
      setName(fieldToEdit.name);
      setLabel(fieldToEdit.label);
      setDataType(fieldToEdit.data_type);
      setRequired(fieldToEdit.is_required);
      setCreatedField(fieldToEdit);
    } else {
      setName('');
      setLabel('');
      setDataType('Text');
      setRequired(false);
      setCreatedField(null);
    }
  }, [fieldToEdit, open]);

  const handleSubmit = async () => {
    if (fieldToEdit) {
      // For now, let's just handle creation or closing
      onClose();
      return;
    }

    setLoading(true);
    try {
      const field = await metaApi.createField(objectId, { 
        name, 
        label, 
        data_type: dataType as any, 
        is_required: required,
        source: 'custom' 
      });
      setCreatedField(field);
      onSuccess();
      
      if (dataType !== 'Picklist') {
        onClose();
      }
    } catch (error) {
      console.error("Failed to create field", error);
      alert("Failed to create field");
    } finally {
      setLoading(false);
    }
  };

  const isPicklist = dataType === 'Picklist';
  const showOptionsEditor = isPicklist && createdField;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={showOptionsEditor ? "sm" : "xs"}>
      <DialogTitle>{fieldToEdit ? 'Edit Field' : 'Add Custom Field'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            fullWidth
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={!!createdField}
          />
          <TextField
            margin="dense"
            label="API Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText="Unique, lowercase, no spaces."
            disabled={!!createdField}
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Data Type</InputLabel>
            <Select
              value={dataType}
              label="Data Type"
              onChange={(e) => setDataType(e.target.value)}
              disabled={!!createdField}
            >
              {FIELD_TYPES.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Checkbox checked={required} onChange={(e) => setRequired(e.target.checked)} />}
            label="Required"
            sx={{ mt: 1 }}
            disabled={!!createdField}
          />
        </Box>

        {showOptionsEditor && (
          <>
            <Divider sx={{ my: 2 }} />
            <PicklistOptionsEditor 
              fieldId={createdField.id} 
              initialOptions={createdField.options || []} 
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {showOptionsEditor ? 'Close' : 'Cancel'}
        </Button>
        {!createdField && (
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {isPicklist ? 'Next' : 'Add'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FieldCreateDialog;
