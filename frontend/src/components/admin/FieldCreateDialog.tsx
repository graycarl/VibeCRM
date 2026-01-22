import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox,
  Box, Divider, InputAdornment
} from '@mui/material';
import { metaApi, MetaField, MetaObject } from '../../services/metaApi';
import { PicklistOptionsEditor } from './PicklistOptionsEditor';

const CUSTOM_PREFIX = 'cs_';

interface Props {
  open: boolean;
  onClose: () => void;
  objectId: string;
  onSuccess: () => void;
  fieldToEdit?: MetaField | null;
}

const FIELD_TYPES = ['Text', 'Number', 'Date', 'Datetime', 'Boolean', 'Picklist', 'Lookup'];

const FieldCreateDialog: React.FC<Props> = ({ open, onClose, objectId, onSuccess, fieldToEdit }) => {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState('Text');
  const [lookupObject, setLookupObject] = useState('');
  const [availableObjects, setAvailableObjects] = useState<MetaObject[]>([]);
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdField, setCreatedField] = useState<MetaField | null>(null);

  const isEditMode = !!fieldToEdit;
  const isSystem = fieldToEdit?.source === 'system';

  useEffect(() => {
    // Load available objects for lookup
    if (open) {
      metaApi.getObjects().then(setAvailableObjects);
    }
  }, [open]);

  useEffect(() => {
    if (fieldToEdit) {
      setName(fieldToEdit.name);
      setLabel(fieldToEdit.label);
      setDescription(fieldToEdit.description || '');
      setDataType(fieldToEdit.data_type);
      setLookupObject(fieldToEdit.lookup_object || '');
      setRequired(fieldToEdit.is_required);
      setCreatedField(fieldToEdit);
    } else {
      setName('');
      setLabel('');
      setDescription('');
      setDataType('Text');
      setLookupObject('');
      setRequired(false);
      setCreatedField(null);
    }
  }, [fieldToEdit, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditMode && fieldToEdit) {
        const updatedField = await metaApi.updateField(fieldToEdit.id, { 
          label, 
          is_required: required,
          description
        });
        setCreatedField(updatedField);
        onSuccess();
        
        if (updatedField.data_type !== 'Picklist') {
          onClose();
        }
        return;
      }

      // Create Mode
      const fullName = CUSTOM_PREFIX + name;
      const field = await metaApi.createField(objectId, { 
        name: fullName, 
        label, 
        description,
        data_type: dataType as any, 
        lookup_object: dataType === 'Lookup' ? lookupObject : undefined,
        is_required: required,
        source: 'custom' 
      });
      setCreatedField(field);
      onSuccess();
      
      if (dataType !== 'Picklist') {
        onClose();
      }
    } catch (error) {
      console.error(isEditMode ? "Failed to update field" : "Failed to create field", error);
      alert(isEditMode ? "Failed to update field" : "Failed to create field");
    } finally {
      setLoading(false);
    }
  };

  const isPicklist = dataType === 'Picklist';
  const isLookup = dataType === 'Lookup';
  // True when a newly created Picklist field exists and we're now configuring its options;
  // in this state we treat the dialog as being in the post-creation options-editing phase.
  const isNewPicklistJustCreated = !isEditMode && !!createdField && isPicklist;
  const showOptionsEditor = isPicklist && !!createdField;

  // Permission Logic
  const isFullyLocked = !isEditMode && !!createdField; // Just created a new field, awaiting option edits or closure
  
  const isNameDisabled = isEditMode || isFullyLocked;
  const isTypeDisabled = isEditMode || isFullyLocked;
  const isLabelDisabled = isFullyLocked;
  const isDescriptionDisabled = isFullyLocked || (isEditMode && isSystem);
  const isRequiredDisabled = isFullyLocked || (isEditMode && isSystem);
  const isLookupObjectDisabled = isEditMode || isFullyLocked;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={showOptionsEditor ? "sm" : "xs"}>
      <DialogTitle>{isEditMode ? 'Edit Field' : 'Add Custom Field'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            fullWidth
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={isLabelDisabled}
          />
          <TextField
            margin="dense"
            label="API Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText={isEditMode ? "Cannot be changed after creation." : "Unique, lowercase, no spaces."}
            disabled={isNameDisabled}
            InputProps={isEditMode ? undefined : {
              startAdornment: (
                <InputAdornment position="start">{CUSTOM_PREFIX}</InputAdornment>
              ),
            }}
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Data Type</InputLabel>
            <Select
              value={dataType}
              label="Data Type"
              onChange={(e) => setDataType(e.target.value)}
              disabled={isTypeDisabled}
            >
              {FIELD_TYPES.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {isLookup && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Referenced Object</InputLabel>
              <Select
                value={lookupObject}
                label="Referenced Object"
                onChange={(e) => setLookupObject(e.target.value)}
                disabled={isLookupObjectDisabled}
              >
                {availableObjects.map(obj => (
                  <MenuItem key={obj.id} value={obj.name}>{obj.label} ({obj.name})</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isDescriptionDisabled}
            helperText={isDescriptionDisabled && isEditMode ? "System field descriptions cannot be modified." : ""}
          />

          <FormControlLabel
            control={<Checkbox checked={required} onChange={(e) => setRequired(e.target.checked)} />}
            label="Required"
            sx={{ mt: 1 }}
            disabled={isRequiredDisabled}
          />
        </Box>

        {showOptionsEditor && createdField && (
          <>
            <Divider sx={{ my: 2 }} />
            <PicklistOptionsEditor 
              fieldId={createdField.id} 
              initialOptions={createdField.options || []} 
              readOnly={isSystem}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {isNewPicklistJustCreated ? 'Close' : 'Cancel'}
        </Button>
        {!isNewPicklistJustCreated && (
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {isEditMode ? 'Save' : (isPicklist ? 'Next' : 'Add')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FieldCreateDialog;
