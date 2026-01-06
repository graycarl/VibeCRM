import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox 
} from '@mui/material';
import { metaApi } from '../../services/metaApi';

interface Props {
  open: boolean;
  onClose: () => void;
  objectId: string;
  onSuccess: () => void;
}

const FIELD_TYPES = ['Text', 'Number', 'Date', 'Boolean', 'Picklist', 'Lookup'];

const FieldCreateDialog: React.FC<Props> = ({ open, onClose, objectId, onSuccess }) => {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [dataType, setDataType] = useState('Text');
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await metaApi.createField(objectId, { 
        name, 
        label, 
        data_type: dataType as any, 
        is_required: required,
        source: 'custom' 
      });
      onSuccess();
      onClose();
      // Reset
      setName('');
      setLabel('');
      setDataType('Text');
      setRequired(false);
    } catch (error) {
      console.error("Failed to create field", error);
      alert("Failed to create field");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Custom Field</DialogTitle>
      <DialogContent sx={{ minWidth: 400 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Label"
          fullWidth
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <TextField
          margin="dense"
          label="API Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          helperText="Unique, lowercase, no spaces."
        />
        
        <FormControl fullWidth margin="dense">
          <InputLabel>Data Type</InputLabel>
          <Select
            value={dataType}
            label="Data Type"
            onChange={(e) => setDataType(e.target.value)}
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
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FieldCreateDialog;
