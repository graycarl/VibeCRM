import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, TextField, Button, 
  List, ListItem, ListItemText, Checkbox, ListItemSecondaryAction 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { LoadingOverlay } from '../../components/common/Feedback';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const ListViewEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [object, setObject] = useState<MetaObject | null>(null);
  const [fields, setFields] = useState<MetaField[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [viewName, setViewName] = useState('默认列表视图');
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
      alert("保存失败");
    }
  };

  if (!object) return <LoadingOverlay />;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/admin/objects/${id}`)}>
            返回
        </Button>
        <Typography variant="h4">配置 {object.label} 的列表视图</Typography>
      </Box>
      
      <Paper sx={{ p: 4, mb: 3, borderRadius: 2 }}>
        <TextField
          label="视图名称"
          fullWidth
          variant="outlined"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          sx={{ mb: 4 }}
        />
        
        <Typography variant="h6" gutterBottom color="primary">选择显示的列</Typography>
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {fields.map((field) => (
            <ListItem key={field.id} dense divider onClick={() => handleToggle(field.name)} sx={{ cursor: 'pointer' }}>
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
      
      <Box display="flex" justifyContent="flex-end" gap={2} mb={4}>
        <Button variant="contained" onClick={handleSave} disabled={selectedFields.length === 0} size="large">
          保存视图
        </Button>
      </Box>
    </Container>
  );
};

export default ListViewEditor;
