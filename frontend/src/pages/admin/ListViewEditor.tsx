import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, TextField, Button, 
  List, ListItem, ListItemText, Checkbox, ListItemSecondaryAction 
} from '@mui/material';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const ListViewEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [object, setObject] = useState<MetaObject | null>(null);
  const [fields, setFields] = useState<MetaField[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [viewName, setViewName] = useState('Default List View');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await metaApi.getObject(id);
      setObject(data);
      setFields((data as any).fields || []);
    };
    load();
  }, [id]);

  const handleToggle = (fieldName: string) => {
    const currentIndex = selectedFields.indexOf(fieldName);
    const newChecked = [...selectedFields];

    if (currentIndex === -1) {
      newChecked.push(fieldName);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedFields(newChecked);
  };

  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/meta/objects/${id}/list-views`, {
        name: viewName,
        columns: selectedFields,
        source: 'custom'
      });
      navigate(`/admin/objects/${id}`);
    } catch (error) {
      console.error("Failed to save list view", error);
      alert("Failed to save list view");
    }
  };

  if (!object) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Configure List View for {object.label}</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="View Name"
          fullWidth
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          sx={{ mb: 3 }}
        />
        
        <Typography variant="h6">Select Columns to Display</Typography>
        <List>
          {fields.map((field) => (
            <ListItem key={field.id} dense button onClick={() => handleToggle(field.name)}>
              <Checkbox
                edge="start"
                checked={selectedFields.indexOf(field.name) !== -1}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={field.label} secondary={field.name} />
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={() => navigate(`/admin/objects/${id}`)}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={selectedFields.length === 0}>
          Save List View
        </Button>
      </Box>
    </Container>
  );
};

export default ListViewEditor;
