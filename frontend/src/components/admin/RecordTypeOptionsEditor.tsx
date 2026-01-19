import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Paper,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  ArrowUpward as UpIcon, 
  ArrowDownward as DownIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { MetaObjectRecordType, metaApi } from '../../services/metaApi';

interface Props {
  objectId: string;
  initialRecordTypes: MetaObjectRecordType[];
  readOnly?: boolean;
}

export const RecordTypeOptionsEditor: React.FC<Props> = ({ objectId, initialRecordTypes, readOnly }) => {
  const [recordTypes, setRecordTypes] = useState<MetaObjectRecordType[]>(initialRecordTypes);
  const [newRT, setNewRT] = useState({ name: '', label: '', description: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<MetaObjectRecordType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sort by order
    const sorted = [...initialRecordTypes].sort((a, b) => a.order - b.order);
    setRecordTypes(sorted);
  }, [initialRecordTypes]);

  const handleAdd = async () => {
    if (!newRT.name || !newRT.label) return;
    try {
      setError(null);
      const added = await metaApi.addRecordTypeOption(objectId, { ...newRT, source: 'custom' });
      setRecordTypes([...recordTypes, added]);
      setNewRT({ name: '', label: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add record type');
    }
  };

  const handleDelete = async (rt: MetaObjectRecordType, index: number) => {
    if (!window.confirm(`Are you sure you want to delete ${rt.label}? This will fail if records use this type.`)) return;
    
    try {
      setError(null);
      await metaApi.deleteRecordTypeOption(rt.id);
      const newRTs = [...recordTypes];
      newRTs.splice(index, 1);
      setRecordTypes(newRTs);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete record type');
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue({ ...recordTypes[index] });
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null || !editValue) return;
    try {
      setError(null);
      await metaApi.updateRecordTypeOption(editValue.id, { 
          label: editValue.label, 
          description: editValue.description || undefined
      });
      const newRTs = [...recordTypes];
      newRTs[editingIndex] = editValue;
      setRecordTypes(newRTs);
      setEditingIndex(null);
      setEditValue(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update record type');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= recordTypes.length) return;

    const newRTs = [...recordTypes];
    const temp = newRTs[index];
    newRTs[index] = newRTs[newIndex];
    newRTs[newIndex] = temp;

    // Optimistic update
    const previousRTs = recordTypes;
    setRecordTypes(newRTs);

    try {
      setError(null);
      // Backend expects list of IDs in order
      await metaApi.reorderRecordTypeOptions(objectId, newRTs.map(rt => rt.id));
    } catch (err: any) {
      setRecordTypes(previousRTs);
      setError(err.response?.data?.detail || 'Failed to reorder');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>Record Types</Typography>
      
      {!readOnly && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Name (API)"
              value={newRT.name}
              onChange={(e) => setNewRT({ ...newRT, name: e.target.value })}
              placeholder="e.g. enterprise"
            />
            <TextField
              size="small"
              label="Label"
              value={newRT.label}
              onChange={(e) => setNewRT({ ...newRT, label: e.target.value })}
              placeholder="e.g. Enterprise"
            />
             <TextField
              size="small"
              label="Description"
              value={newRT.description}
              onChange={(e) => setNewRT({ ...newRT, description: e.target.value })}
              placeholder="Optional"
              sx={{ flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={!newRT.name || !newRT.label}
            >
              Add
            </Button>
          </Box>
          {error && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{error}</Typography>}
        </Paper>
      )}

      <List>
        {recordTypes.map((rt, index) => (
          <React.Fragment key={rt.id}>
            <ListItem>
              {editingIndex === index && editValue ? (
                <Box sx={{ display: 'flex', gap: 1, width: '100%', alignItems: 'center' }}>
                  <TextField size="small" disabled value={editValue.name} label="Name" />
                  <TextField
                    size="small"
                    value={editValue.label}
                    onChange={(e) => setEditValue({ ...editValue, label: e.target.value })}
                    label="Label"
                  />
                  <TextField
                    size="small"
                    value={editValue.description || ''}
                    onChange={(e) => setEditValue({ ...editValue, description: e.target.value })}
                    label="Description"
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton onClick={handleSaveEdit} color="primary"><SaveIcon /></IconButton>
                  <IconButton onClick={() => setEditingIndex(null)}><CancelIcon /></IconButton>
                </Box>
              ) : (
                <>
                  <ListItemText 
                    primary={`${rt.label} (${rt.name})`} 
                    secondary={rt.description || 'No description'} 
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => handleMove(index, 'up')} disabled={readOnly || index === 0}>
                      <UpIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleMove(index, 'down')} disabled={readOnly || index === recordTypes.length - 1}>
                      <DownIcon />
                    </IconButton>
                    
                    {/* System options only allow label edit if permission allows, but logic says system options might be locked.
                        For now, let's allow editing labels for system options as per our backend logic.
                        However, if readOnly (passed from parent when object is system), block add/delete, but maybe allow edit?
                        Current implementation: if readOnly prop is true, buttons are hidden.
                        If object is system, readOnly is true. But we want to allow editing Labels of system types?
                        Let's assume "readOnly" means "Full Lock". To support partial edit, we need finer grains.
                        For MVP/Spec: "System source objects do not allow editing record_type config". 
                        So full readOnly is correct for system objects.
                    */}
                    {!readOnly && (
                        <>
                            <IconButton size="small" onClick={() => handleStartEdit(index)} color="info">
                            <EditIcon />
                            </IconButton>
                            <IconButton 
                            size="small" 
                            onClick={() => handleDelete(rt, index)} 
                            color="error"
                            disabled={rt.source === 'system'}
                            >
                            <DeleteIcon />
                            </IconButton>
                        </>
                    )}
                  </ListItemSecondaryAction>
                </>
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};
