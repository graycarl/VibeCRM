import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, TextField, Button, 
  List, ListItem, ListItemText 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { LoadingOverlay } from '../../components/common/Feedback';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const PageLayoutEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [object, setObject] = useState<MetaObject | null>(null);
  const [fields, setFields] = useState<MetaField[]>([]);
  const [layoutName, setLayoutName] = useState('默认页面布局');
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
        <Typography variant="h4">配置 {object.label} 的页面布局</Typography>
      </Box>
      
      <Paper sx={{ p: 4, mb: 3, borderRadius: 2 }}>
        <TextField
          label="布局名称"
          fullWidth
          variant="outlined"
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
          sx={{ mb: 4 }}
        />
        
        <Typography variant="h6" gutterBottom color="primary">字段排序</Typography>
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {orderedFields.map((fieldName, index) => {
            const field = fields.find(f => f.name === fieldName);
            return (
              <ListItem key={fieldName} divider sx={{ py: 1.5 }}>
                <ListItemText primary={field?.label || fieldName} secondary={fieldName} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    startIcon={<ArrowUpwardIcon />}
                    onClick={() => moveField(index, 'up')} 
                    disabled={index === 0}
                  >
                    上移
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined"
                    startIcon={<ArrowDownwardIcon />}
                    onClick={() => moveField(index, 'down')} 
                    disabled={index === orderedFields.length - 1}
                  >
                    下移
                  </Button>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Paper>
      
      <Box display="flex" justifyContent="flex-end" gap={2} mb={4}>
        <Button variant="contained" onClick={handleSave} size="large">
          保存布局
        </Button>
      </Box>
    </Container>
  );
};

export default PageLayoutEditor;
