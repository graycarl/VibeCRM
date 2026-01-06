import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Grid, Button } from '@mui/material';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import axios from 'axios';

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

              // Get Layouts
              try {
                  const layoutRes = await axios.get(`http://localhost:8000/api/v1/meta/objects/${obj.id}/layouts`);
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

  if (!object || !record) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">{object.label} Detail</Typography>
            <Button variant="outlined" onClick={() => navigate(`/app/${objectName}/${uid}/edit`)}>Edit</Button>
        </Box>
        
        <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
                {fields.map(field => (
                    <Grid item xs={12} sm={6} key={field.id}>
                        <Typography variant="subtitle2" color="textSecondary">{field.label}</Typography>
                        <Typography variant="body1">
                            {typeof record[field.name] === 'boolean' 
                                ? (record[field.name] ? 'Yes' : 'No') 
                                : record[field.name]}
                        </Typography>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    </Container>
  );
};

export default ObjectRecordDetail;
