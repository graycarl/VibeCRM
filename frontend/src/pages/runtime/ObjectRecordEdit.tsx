import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { metaApi, MetaObject, MetaField, MetaObjectRecordType } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import { LoadingOverlay } from '../../components/common/Feedback';
import axios from 'axios';
import DynamicForm from '../../components/dynamic/DynamicForm';

const API_URL = 'http://localhost:8000/api/v1';

const ObjectRecordEdit = () => {
  const { objectName, uid } = useParams<{ objectName: string; uid?: string }>();
  const [searchParams] = useSearchParams();
  const initialRecordType = searchParams.get('record_type');

  const [object, setObject] = useState<MetaObject | null>(null);
  const [fields, setFields] = useState<MetaField[]>([]);
  const [initialValues, setInitialValues] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
      const load = async () => {
          setLoading(true);
          try {
              const objects = await metaApi.getObjects();
              const obj = objects.find(o => o.name === objectName);
              if (obj) {
                  const fullObj = await metaApi.getObject(obj.id);
                  setObject(fullObj);
                  const allFields: MetaField[] = fullObj.fields || [];
                  
                  // Inject record_type field if needed
                  if (fullObj.has_record_type) {
                      // Check if record_type provided for new records
                      if (!uid && !initialRecordType && fullObj.record_types && fullObj.record_types.length > 0) {
                          // Redirect if missing record type selection (unless only 1 exists, but List handles that)
                          // Or fallback to default?
                          // For robustness: if not provided, pick first.
                          // But ideally we redirect back to list to pick.
                          // Let's pick first for safety if accessed directly.
                          // const defaultRT = fullObj.record_types[0].name;
                          // But wait, user might want to pick.
                          // Let's assume passed correctly, or handle in render.
                      }
                      
                      // Add pseudo-field to layout fields if not present
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
                          // Ensure record_type is in layout or prepended if missing but enabled
                          const layoutFields = fieldNames.map((name: string) => allFields.find(f => f.name === name)).filter(Boolean);
                          
                          if (fullObj.has_record_type && !layoutFields.find((f: any) => f.name === 'record_type')) {
                                const rtField = allFields.find(f => f.name === 'record_type');
                                if (rtField) layoutFields.unshift(rtField);
                          }
                          orderedFields = layoutFields;
                      }
                  } catch (e) {
                      // Fallback to default order
                  }
                  setFields(orderedFields);
                  
                  if (uid) {
                      const record = await dataApi.getRecord(objectName!, uid);
                      setInitialValues(record);
                  } else if (fullObj.has_record_type && initialRecordType) {
                      setInitialValues({ record_type: initialRecordType });
                  }
              }
          } catch (e) {
              console.error("Failed to load", e);
          } finally {
              setLoading(false);
          }
      };
      if (objectName) load();
  }, [objectName, uid, initialRecordType]);

  const handleSubmit = async (data: any) => {
      try {
          if (uid) {
              await dataApi.updateRecord(objectName!, uid, data);
          } else {
              // Ensure record_type is included if enabled
              if (object?.has_record_type && !data.record_type && initialValues.record_type) {
                  data.record_type = initialValues.record_type;
              }
              await dataApi.createRecord(objectName!, data);
          }
          navigate(`/app/${objectName}`);
      } catch (error) {
          console.error("Save failed", error);
          alert("保存失败");
      }
  };
  
  // Helper to get display label for record type
  const getRecordTypeLabel = (val: string) => {
      if (!object?.record_types) return val;
      const rt = object.record_types.find(r => r.name === val);
      return rt ? rt.label : val;
  };

  if (loading || !object) return <LoadingOverlay />;

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
            // Pass custom render or context if needed? 
            // DynamicForm handles rendering. We need to handle record_type readonly.
            // We can wrap DynamicForm or update it.
            // Let's assume DynamicForm has been updated to handle 'record_type' specific logic or we pass a prop.
            // Actually, we haven't updated DynamicForm yet. We should do that.
            // But we can pass `readOnlyFields` prop if we add it.
            readOnlyFields={object.has_record_type ? ['record_type'] : []}
            // Also need to pass record type labels map for display
            recordTypeLabels={object.record_types?.reduce((acc, cur) => ({...acc, [cur.name]: cur.label}), {})}
        />
    </Container>
  );
};

export default ObjectRecordEdit;
