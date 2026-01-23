import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  List, ListItem, ListItemText, Typography, CircularProgress, ListItemButton
} from '@mui/material';
import { dataApi } from '../../services/dataApi';
import { getDisplayLabel } from '../../utils/lookupUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  objectName: string;
  onSelect: (record: any) => void;
  title?: string;
}

export const LookupDialog: React.FC<Props> = ({ open, onClose, objectName, onSelect, title }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await dataApi.listRecords(objectName, 0, 100);
      setRecords(result.items);
    } catch (error) {
      console.error("Failed to load lookup records", error);
    } finally {
      setLoading(false);
    }
  }, [objectName]);

  useEffect(() => {
    if (open && objectName) {
      loadRecords();
    }
  }, [open, objectName, loadRecords]);

  const handleSelect = (record: any) => {
    onSelect(record);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title || `Select ${objectName}`}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
             {records.length === 0 && <Typography p={2}>No records found.</Typography>}
             {records.map((record) => (
               <ListItem key={record.uid} disablePadding>
                 <ListItemButton onClick={() => handleSelect(record)}>
                   <ListItemText 
                      primary={getDisplayLabel(record)}
                      secondary={`ID: ${record.uid}`} 
                   />
                 </ListItemButton>
               </ListItem>
             ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
