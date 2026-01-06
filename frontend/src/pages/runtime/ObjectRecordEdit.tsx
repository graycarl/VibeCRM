import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import axios from 'axios';
import DynamicForm from '../../components/dynamic/DynamicForm';

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
              
              // Get Layouts
              try {
                  const layoutRes = await axios.get(`http://localhost:8000/api/v1/meta/objects/${obj.id}/layouts`);
                  const layouts = layoutRes.data;
                  if (layouts.length > 0) {
                      const fieldNames = layouts[0].layout_config.sections[0].fields;
                      // Order and filter fields based on layout
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
          alert("Save failed");
      }
  };

  if (!object) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4">{uid ? `Edit ${object.label}` : `New ${object.label}`}</Typography>
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
