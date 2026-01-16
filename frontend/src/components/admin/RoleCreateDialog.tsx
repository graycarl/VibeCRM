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

const RoleCreateDialog: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState('{}');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let parsedPermissions = {};
      try {
        parsedPermissions = JSON.parse(permissions);
      } catch (e) {
        alert("Invalid JSON for permissions");
        setLoading(false);
        return;
      }

      const fullName = CUSTOM_PREFIX + name;
      await metaApi.createRole({ 
        name: fullName, 
        label, 
        description, 
        permissions: parsedPermissions, 
        source: 'custom' 
      });
      onSuccess();
      onClose();
      // Reset form
      setName('');
      setLabel('');
      setDescription('');
      setPermissions('{}');
    } catch (error) {
      console.error("Failed to create role", error);
      alert("Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Custom Role</DialogTitle>
      <DialogContent>
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
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Permissions (JSON)"
          fullWidth
          multiline
          rows={4}
          value={permissions}
          onChange={(e) => setPermissions(e.target.value)}
          helperText="Enter permissions as a JSON object."
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

export default RoleCreateDialog;
