import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  InputAdornment, FormControlLabel, Switch, Box, Divider, Typography,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { metaApi, MetaObject } from '../../services/metaApi';
import { RecordTypeOptionsEditor } from './RecordTypeOptionsEditor';

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
  const [hasRecordType, setHasRecordType] = useState(false);
  const [nameField, setNameField] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Need to reload full object to get record types if editing
  const [fullObject, setFullObject] = useState<MetaObject | null>(null);

  const isEditMode = !!objectToEdit;

  useEffect(() => {
    const load = async () => {
        if (objectToEdit && open) {
            try {
                const data = await metaApi.getObject(objectToEdit.id);
                setFullObject(data);
                setName(data.name);
                setLabel(data.label);
                setDescription(data.description || '');
                setHasRecordType(!!data.has_record_type);
                setNameField(data.name_field || '');
            } catch (e) {
                console.error("Failed to load object details", e);
            }
        } else if (!open) {
            setFullObject(null);
            setName('');
            setLabel('');
            setDescription('');
            setHasRecordType(false);
            setNameField('');
        }
    };
    load();
  }, [objectToEdit, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditMode && objectToEdit) {
        await metaApi.updateObject(objectToEdit.id, { 
            label, 
            description,
            has_record_type: hasRecordType,
            name_field: nameField || undefined
        });
      } else {
        const fullName = CUSTOM_PREFIX + name;
        await metaApi.createObject({ 
            name: fullName, 
            label, 
            description, 
            source: 'custom',
            has_record_type: hasRecordType,
            name_field: nameField || undefined
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(isEditMode ? "Failed to update object" : "Failed to create object", error);
      alert((isEditMode ? "Failed to update object: " : "Failed to create object: ") + (error.response?.data?.detail || error.message));
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
  // System objects: cannot toggle record type support (locked)
  const isRecordTypeToggleDisabled = isSystemObject;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditMode ? 'Edit Object' : 'Create Custom Object'}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
            autoFocus
            label="Label (e.g. Sales Order)"
            fullWidth
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            />
            <TextField
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
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isDescriptionDisabled}
            helperText={isDescriptionDisabled ? "System object descriptions cannot be modified." : ""}
            />
            
            {isEditMode && fullObject && (
              <FormControl fullWidth>
                <InputLabel>Name Field (Display Label)</InputLabel>
                <Select
                  value={nameField}
                  label="Name Field (Display Label)"
                  onChange={(e) => setNameField(e.target.value)}
                >
                  <MenuItem value=""><em>None (Use UID)</em></MenuItem>
                  {fullObject.fields.map((field) => (
                     <MenuItem key={field.id} value={field.name}>
                        {field.label} ({field.name})
                     </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="textSecondary">
                  The field value to display when this object is referenced by a Lookup field.
                </Typography>
              </FormControl>
            )}

            <Divider />
            
            <Box>
                <FormControlLabel 
                    control={
                        <Switch 
                            checked={hasRecordType} 
                            onChange={(e) => setHasRecordType(e.target.checked)} 
                            disabled={isRecordTypeToggleDisabled}
                        />
                    }
                    label="Enable Record Types"
                />
                <Typography variant="caption" display="block" color="textSecondary">
                    Allows defining multiple sub-types (e.g. Professional, Enterprise) for this object.
                    {isSystemObject && " (System setting locked)"}
                </Typography>
            </Box>

            {/* Record Type Editor - Only visible in edit mode if enabled, or if creating and enabled (but we can't add options until object exists... so only in Edit mode) */}
            {isEditMode && hasRecordType && fullObject && (
                <RecordTypeOptionsEditor 
                    objectId={fullObject.id}
                    initialRecordTypes={fullObject.record_types || []}
                    readOnly={isSystemObject}
                />
            )}
            {!isEditMode && hasRecordType && (
                <Typography variant="body2" color="warning.main">
                    Note: You can configure record type options after creating the object.
                </Typography>
            )}
        </Box>
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
