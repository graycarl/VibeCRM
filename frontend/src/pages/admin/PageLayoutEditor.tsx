import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, TextField, Button, 
  List, ListItem, ListItemText, Divider 
} from '@mui/material';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const PageLayoutEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [object, setObject] = useState<MetaObject | null>(null);
  const [fields, setFields] = useState<MetaField[]>([]);
  const [layoutName, setLayoutName] = useState('Default Layout');
  // Simple layout: just a list of field names in order
  const [orderedFields, setOrderedFields] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await metaApi.getObject(id);
      setObject(data);
      const f = (data as any).fields || [];
      setFields(f);
      setOrderedFields(f.map((field: MetaField) => field.name));
    };
    load();
  }, [id]);

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...orderedFields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setOrderedFields(newOrder);
  };

  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/meta/objects/${id}/layouts`, {
        name: layoutName,
        config: { sections: [{ name: 'Main', fields: orderedFields }] },
        source: 'custom'
      });
      navigate(`/admin/objects/${id}`);
    } catch (error) {
      console.error("Failed to save layout", error);
      alert("Failed to save layout");
    }
  };

  if (!object) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Configure Page Layout for {object.label}</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Layout Name"
          fullWidth
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
          sx={{ mb: 3 }}
        />
        
        <Typography variant="h6">Field Order (Drag & Drop not implemented, use buttons)</Typography>
        <List>
          {orderedFields.map((fieldName, index) => {
            const field = fields.find(f => f.name === fieldName);
            return (
              <ListItem key={fieldName} divider>
                <ListItemText primary={field?.label || fieldName} secondary={fieldName} />
                <Box>
                  <Button size="small" onClick={() => moveField(index, 'up')} disabled={index === 0}>Up</Button>
                  <Button size="small" onClick={() => moveField(index, 'down')} disabled={index === orderedFields.length - 1}>Down</Button>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Paper>
      
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={() => navigate(`/admin/objects/${id}`)}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Layout
        </Button>
      </Box>
    </Container>
  );
};

export default PageLayoutEditor;
