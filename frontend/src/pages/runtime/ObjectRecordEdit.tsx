import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import { LoadingOverlay } from '../../components/common/Feedback';
import axios from 'axios';
import DynamicForm from '../../components/dynamic/DynamicForm';

const API_URL = 'http://localhost:8000/api/v1';

const ObjectRecordEdit = () => {
  const { objectName, uid } = useParams<{ objectName: string; uid?: string }>();
  const [object, setObject] = useState<MetaObject | null>(null);
  const [fields, setFields] = useState<MetaField[]>([]);
  const [initialValues, setInitialValues] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
      const load = async () => {
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
              
              if (uid) {
                  const record = await dataApi.getRecord(objectName!, uid);
                  setInitialValues(record);
              }
          }
      };
      if (objectName) load();
  }, [objectName, uid]);

  const handleSubmit = async (data: any) => {
      try {
          if (uid) {
              await dataApi.updateRecord(objectName!, uid, data);
          } else {
              await dataApi.createRecord(objectName!, data);
          }
          navigate(`/app/${objectName}`);
      } catch (error) {
          console.error("Save failed", error);
          alert("保存失败");
      }
  };

  if (!object) return <LoadingOverlay />;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate(-1)}
            >
                返回
            </Button>
            <Typography variant="h4">
                {uid ? `编辑 ${object.label}` : `新建 ${object.label}`}
            </Typography>
        </Box>
        <DynamicForm 
            object={object} 
            fields={fields} 
            onSubmit={handleSubmit} 
            initialValues={initialValues} 
        />
    </Container>
  );
};

export default ObjectRecordEdit;
