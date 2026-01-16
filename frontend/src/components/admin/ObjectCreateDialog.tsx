import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  InputAdornment
} from '@mui/material';
import { metaApi, MetaObject } from '../../services/metaApi';

const CUSTOM_PREFIX = 'cs_';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  objectToEdit?: MetaObject | null;
}

const ObjectCreateDialog: React.FC<Props> = ({ open, onClose, onSuccess, objectToEdit }) => {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditMode = !!objectToEdit;

  useEffect(() => {
    if (objectToEdit) {
      // For editing, we display the full name
      setName(objectToEdit.name);
      setLabel(objectToEdit.label);
      setDescription(objectToEdit.description || '');
    } else {
      // Reset for create mode
      setName('');
      setLabel('');
      setDescription('');
    }
  }, [objectToEdit, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditMode && objectToEdit) {
        await metaApi.updateObject(objectToEdit.id, { label, description });
      } else {
        const fullName = CUSTOM_PREFIX + name;
        await metaApi.createObject({ name: fullName, label, description, source: 'custom' });
      }
      onSuccess();
      onClose();
      // Reset form if creating
      if (!isEditMode) {
        setName('');
        setLabel('');
        setDescription('');
      }
    } catch (error) {
      console.error(isEditMode ? "Failed to update object" : "Failed to create object", error);
      alert(isEditMode ? "Failed to update object" : "Failed to create object");
    } finally {
      setLoading(false);
    }
  };

  // Permission Logic
  const isSystemObject = objectToEdit?.source === 'system';
  
  // Name is always disabled in edit mode
  // Description is disabled for system objects
  const isNameDisabled = isEditMode;
  const isDescriptionDisabled = isEditMode && isSystemObject;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEditMode ? 'Edit Object' : 'Create Custom Object'}</DialogTitle>
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
          label={isEditMode ? "API Name" : "API Name (e.g. sales_order)"}
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          helperText={isEditMode ? "Cannot be changed after creation." : "Must be unique, lowercase, no spaces."}
          disabled={isNameDisabled}
          InputProps={!isEditMode ? {
            startAdornment: (
              <InputAdornment position="start">{CUSTOM_PREFIX}</InputAdornment>
            ),
          } : undefined}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isDescriptionDisabled}
          helperText={isDescriptionDisabled ? "System object descriptions cannot be modified." : ""}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {isEditMode ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ObjectCreateDialog;
