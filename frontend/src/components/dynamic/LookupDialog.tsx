import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  List, ListItem, ListItemText, Typography, CircularProgress
} from '@mui/material';
import { dataApi } from '../../services/dataApi';

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

  useEffect(() => {
    if (open && objectName) {
      loadRecords();
    }
  }, [open, objectName]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const result = await dataApi.listRecords(objectName, 0, 100);
      setRecords(result.items);
    } catch (error) {
      console.error("Failed to load lookup records", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (record: any) => {
    onSelect(record);
    onClose();
  };

  // Determine display label for a record:
  // Since list API now returns enriched lookup fields (e.g. some_field__label),
  // but for the record itself, we rely on what list API returns.
  // The list API doesn't know which field is the "name_field" unless we ask metaApi, 
  // OR we can assume the backend might send a standard label if we asked for it, 
  // OR we just show UID if we don't know better.
  // However, the previous step: we added name_field to MetaObject.
  // But here we only have record data. 
  // Simple approach: show UID, and any likely name fields (name, title, subject, label, email, username)
  
  const getDisplayLabel = (record: any) => {
    // Try common name fields
    const candidates = ['name', 'title', 'subject', 'label', 'email', 'username', 'uid'];
    for (const key of candidates) {
        if (record[key]) return record[key];
    }
    return record.uid;
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
               <ListItem button key={record.uid} onClick={() => handleSelect(record)}>
                 <ListItemText 
                    primary={getDisplayLabel(record)}
                    secondary={`ID: ${record.uid}`} 
                 />
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
