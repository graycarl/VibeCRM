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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
  readOnly?: boolean;
}

export const PicklistOptionsEditor: React.FC<PicklistOptionsEditorProps> = ({ fieldId, initialOptions, readOnly }) => {
  const [options, setOptions] = useState<PicklistOption[]>(initialOptions);
  const [newOption, setNewOption] = useState<PicklistOption>({ name: '', label: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<PicklistOption>({ name: '', label: '' });
  const [error, setError] = useState<string | null>(null);
  
  // Deletion & Migration state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<{name: string, label: string, index: number} | null>(null);
  const [migrateTo, setMigrateTo] = useState<string>('_none');

  // Sync state with props when they change
  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

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

  const handleDeleteClick = (name: string, label: string, index: number) => {
    setOptionToDelete({ name, label, index });
    setMigrateTo('_none');
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!optionToDelete) return;
    try {
      setError(null);
      const migrateToValue = migrateTo === '_none' ? undefined : migrateTo;
      await metaApi.deleteOption(fieldId, optionToDelete.name, migrateToValue);
      
      const newOptions = [...options];
      newOptions.splice(optionToDelete.index, 1);
      setOptions(newOptions);
      setDeleteDialogOpen(false);
      setOptionToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete option');
      setDeleteDialogOpen(false);
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

    const previousOptions = options;
    setOptions(newOptions);

    try {
      setError(null);
      // Persist the new order of options to the backend
      await metaApi.reorderOptions(fieldId, newOptions.map((opt) => opt.name));
    } catch (err: any) {
      // Revert to previous order on failure and surface error
      setOptions(previousOptions);
      setError(err.response?.data?.detail || 'Failed to reorder options');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>管理选项</Typography>
      
      {!readOnly && (
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
      )}

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
                    <IconButton size="small" onClick={() => handleMove(index, 'up')} disabled={readOnly || index === 0}>
                      <UpIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleMove(index, 'down')} disabled={readOnly || index === options.length - 1}>
                      <DownIcon />
                    </IconButton>
                    {!readOnly && (
                      <>
                        <IconButton size="small" onClick={() => handleStartEdit(index)} color="info">
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(opt.name, opt.label, index)} 
                          color="error"
                          data-testid={`delete-option-${opt.name}`}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>删除选项</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            确定要删除选项 <strong>{optionToDelete?.label}</strong> ({optionToDelete?.name}) 吗？
            此操作不可撤销。
          </DialogContentText>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="migrate-to-label">将现有数据迁移至</InputLabel>
            <Select
              labelId="migrate-to-label"
              value={migrateTo}
              label="将现有数据迁移至"
              onChange={(e) => setMigrateTo(e.target.value)}
              inputProps={{ 'data-testid': 'migrate-to-select' }}
            >
              <MenuItem value="_none"><em>无（清除现有数据）</em></MenuItem>
              {options
                .filter(opt => opt.name !== optionToDelete?.name)
                .map(opt => (
                  <MenuItem key={opt.name} value={opt.name}>
                    {opt.label} ({opt.name})
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
