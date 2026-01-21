import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, List, ListItemText, Typography,
  ListItemButton
} from '@mui/material';
import { MetaObjectRecordType } from '../../services/metaApi';

interface Props {
  open: boolean;
  recordTypes: MetaObjectRecordType[];
  onSelect: (recordType: MetaObjectRecordType) => void;
  onClose: () => void;
}

export const RecordTypeSelectorDialog: React.FC<Props> = ({ open, recordTypes, onSelect, onClose }) => {
  // Sort record types by order
  const sorted = [...recordTypes].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Record Type</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="textSecondary" paragraph>
          Select a record type for the new record.
        </Typography>
        <List>
            {sorted.map((rt) => (
                <ListItemButton key={rt.id} onClick={() => onSelect(rt)} divider>
                    <ListItemText 
                        primary={rt.label} 
                        secondary={rt.description} 
                    />
                </ListItemButton>
            ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
