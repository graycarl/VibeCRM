import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Grid, Button, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import { LoadingOverlay } from '../../components/common/Feedback';
import { getOptionLabel } from '../../utils/metadata';
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
              const fullObj = await metaApi.getObject(obj.id);
              setObject(fullObj);
              const allFields: MetaField[] = fullObj.fields || [];

              // Inject record_type field logic similar to Edit page
              if (fullObj.has_record_type) {
                  if (!allFields.find(f => f.name === 'record_type')) {
                      allFields.unshift({
                          id: 'rt_pseudo',
                          object_id: fullObj.id,
                          name: 'record_type',
                          label: 'Record Type',
                          data_type: 'Text', 
                          is_required: true,
                          source: 'system'
                      });
                  }
              }

              let orderedFields = allFields;
              try {
                  const layoutRes = await axios.get(`${API_URL}/meta/objects/${obj.id}/layouts`);
                  const layouts = layoutRes.data;
                  if (layouts.length > 0) {
                      const fieldNames = layouts[0].layout_config.sections[0].fields;
                      const layoutFields = fieldNames.map((name: string) => allFields.find(f => f.name === name)).filter(Boolean);
                      
                      // Ensure record_type is displayed if enabled
                      if (fullObj.has_record_type && !layoutFields.find((f: any) => f.name === 'record_type')) {
                          const rtField = allFields.find(f => f.name === 'record_type');
                          if (rtField) layoutFields.unshift(rtField);
                      }
                      orderedFields = layoutFields;
                  } else {
                      // Fallback: if record_type enabled, put it first in default order if not there
                      // (already unshifted above)
                  }
              } catch (e) {
                  // Ignore layout error
              }
              setFields(orderedFields);
              
              const data = await dataApi.getRecord(objectName, uid);
              setRecord(data);
          }
      };
      load();
  }, [objectName, uid]);
  
  const getDisplayValue = (field: MetaField, value: any) => {
      if (field.name === 'record_type' && object?.has_record_type && object?.record_types) {
          const rt = object.record_types.find(r => r.name === value);
          return rt ? rt.label : value;
      }
      
      if (field.data_type === 'Picklist') {
          return getOptionLabel(field, value);
      }
      if (field.data_type === 'Lookup') {
          return record[`${field.name}__label`] || value || '-';
      }
      if (field.data_type === 'Boolean' || typeof value === 'boolean') {
          return value ? '是' : '否';
      }
      return value || '-';
  };

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
                            {getDisplayValue(field, record[field.name])}
                        </Typography>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    </Container>
  );
};

export default ObjectRecordDetail;
