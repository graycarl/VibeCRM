import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Grid, Button, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import { LoadingOverlay } from '../../components/common/Feedback';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const ObjectRecordDetail = () => {
  const { objectName, uid } = useParams<{ objectName: string; uid: string }>();
  const [object, setObject] = useState<MetaObject | null>(null);
  const [fields, setFields] = useState<MetaField[]>([]);
  const [record, setRecord] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
      const load = async () => {
          if (!uid || !objectName) return;
          const objects = await metaApi.getObjects();
          const obj = objects.find(o => o.name === objectName);
          if (obj) {
              setObject(obj);
              const fullObj = await metaApi.getObject(obj.id);
              const allFields: MetaField[] = (fullObj as any).fields || [];

              try {
                  const layoutRes = await axios.get(`${API_URL}/meta/objects/${obj.id}/layouts`);
                  const layouts = layoutRes.data;
                  if (layouts.length > 0) {
                      const fieldNames = layouts[0].layout_config.sections[0].fields;
                      const ordered = fieldNames.map((name: string) => allFields.find(f => f.name === name)).filter(Boolean);
                      setFields(ordered);
                  } else {
                      setFields(allFields);
                  }
              } catch (e) {
                  setFields(allFields);
              }
              
              const data = await dataApi.getRecord(objectName, uid);
              setRecord(data);
          }
      };
      load();
  }, [objectName, uid]);

  if (!object || !record) return <LoadingOverlay />;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate(`/app/${objectName}`)}
                    sx={{ mr: 1 }}
                >
                    返回
                </Button>
                <Typography variant="h4">{object.label} 详情</Typography>
            </Box>
            <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={() => navigate(`/app/${objectName}/${uid}/edit`)}
            >
                编辑
            </Button>
        </Box>
        
        <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">基本信息</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
                {fields.map(field => (
                    <Grid item xs={12} sm={6} key={field.id}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {field.label}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5, minHeight: '1.5em' }}>
                            {typeof record[field.name] === 'boolean' 
                                ? (record[field.name] ? '是' : '否') 
                                : (record[field.name] || '-')}
                        </Typography>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    </Container>
  );
};

export default ObjectRecordDetail;
