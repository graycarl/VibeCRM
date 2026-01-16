import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  InputAdornment
} from '@mui/material';
import { metaApi } from '../../services/metaApi';

const CUSTOM_PREFIX = 'cs_';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ObjectCreateDialog: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fullName = CUSTOM_PREFIX + name;
      await metaApi.createObject({ name: fullName, label, description, source: 'custom' });
      onSuccess();
      onClose();
      // Reset form
      setName('');
      setLabel('');
      setDescription('');
    } catch (error) {
      console.error("Failed to create object", error);
      alert("Failed to create object");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Custom Object</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Label (e.g. Sales Order)"
          fullWidth
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <TextField
          margin="dense"
          label="API Name (e.g. sales_order)"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          helperText="Must be unique, lowercase, no spaces."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">{CUSTOM_PREFIX}</InputAdornment>
            ),
          }}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ObjectCreateDialog;
