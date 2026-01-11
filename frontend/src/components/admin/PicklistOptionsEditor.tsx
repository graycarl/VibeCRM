import React, { useState } from 'react';
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
import { PicklistOption } from '../../types/metadata';
import { metaApi } from '../../services/metaApi';

interface PicklistOptionsEditorProps {
  fieldId: string;
  initialOptions: PicklistOption[];
}

export const PicklistOptionsEditor: React.FC<PicklistOptionsEditorProps> = ({ fieldId, initialOptions }) => {
  const [options, setOptions] = useState<PicklistOption[]>(initialOptions);
  const [newOption, setNewOption] = useState<PicklistOption>({ name: '', label: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<PicklistOption>({ name: '', label: '' });
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newOption.name || !newOption.label) return;
    try {
      setError(null);
      await metaApi.addOption(fieldId, newOption);
      setOptions([...options, newOption]);
      setNewOption({ name: '', label: '' });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add option');
    }
  };

  const handleDelete = async (name: string, index: number) => {
    try {
      setError(null);
      // For now, no migration support in UI, just delete
      await metaApi.deleteOption(fieldId, name);
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete option');
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(options[index]);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null) return;
    try {
      setError(null);
      await metaApi.updateOption(fieldId, editValue.name, editValue.label);
      const newOptions = [...options];
      newOptions[editingIndex] = editValue;
      setOptions(newOptions);
      setEditingIndex(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update option');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= options.length) return;

    const newOptions = [...options];
    const temp = newOptions[index];
    newOptions[index] = newOptions[newIndex];
    newOptions[newIndex] = temp;

    // TODO: The backend currently doesn't have a reorder endpoint.
    // Based on FR-013, we might need a full-list update for ordering, 
    // or the backend needs to handle ordering in a specific way.
    // Since we only have add/patch/delete, ordering might be tricky if real-time.
    // If we want real-time ordering, we might need a PATCH for the whole field options.
    
    // For now, we update the state and maybe we'll need a way to save order.
    setOptions(newOptions);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>管理选项</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Name (API)"
            value={newOption.name}
            onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
            placeholder="e.g. male"
          />
          <TextField
            size="small"
            label="Label (显示)"
            value={newOption.label}
            onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
            placeholder="e.g. 男"
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={!newOption.name || !newOption.label}
          >
            添加
          </Button>
        </Box>
        {error && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{error}</Typography>}
      </Paper>

      <List>
        {options.map((opt, index) => (
          <React.Fragment key={opt.name}>
            <ListItem>
              {editingIndex === index ? (
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                  <TextField
                    size="small"
                    disabled
                    value={editValue.name}
                    label="Name"
                  />
                  <TextField
                    size="small"
                    value={editValue.label}
                    onChange={(e) => setEditValue({ ...editValue, label: e.target.value })}
                    label="Label"
                    autoFocus
                  />
                  <IconButton onClick={handleSaveEdit} color="primary"><SaveIcon /></IconButton>
                  <IconButton onClick={() => setEditingIndex(null)}><CancelIcon /></IconButton>
                </Box>
              ) : (
                <>
                  <ListItemText 
                    primary={opt.label} 
                    secondary={opt.name} 
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => handleMove(index, 'up')} disabled={index === 0}>
                      <UpIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleMove(index, 'down')} disabled={index === options.length - 1}>
                      <DownIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleStartEdit(index)} color="info">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(opt.name, index)} color="error">
                      <DeleteIcon />
                    </IconButton>
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
