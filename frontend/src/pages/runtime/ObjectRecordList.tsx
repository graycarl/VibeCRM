import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import DataTable from '../../components/dynamic/DataTable';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const ObjectRecordList = () => {
  const { objectName } = useParams<{ objectName: string }>();
  const [object, setObject] = useState<MetaObject | null>(null);
  const [fields, setFields] = useState<MetaField[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const navigate = useNavigate();

  const loadData = async () => {
      const objects = await metaApi.getObjects();
      const obj = objects.find(o => o.name === objectName);
      if (obj) {
          setObject(obj);
          const fullObj = await metaApi.getObject(obj.id);
          const allFields: MetaField[] = (fullObj as any).fields || [];
          
          // Get List Views
          try {
              const viewsRes = await axios.get(`${API_URL}/meta/objects/${obj.id}/list-views`);
              const views = viewsRes.data;
              if (views.length > 0) {
                  // Use the first view's columns
                  const columns = views[0].columns;
                  setFields(allFields.filter(f => columns.includes(f.name)));
              } else {
                  setFields(allFields);
              }
          } catch (e) {
              setFields(allFields);
          }
          
          const data = await dataApi.listRecords(objectName!);
          setRecords(data);
      }
  };

  useEffect(() => {
      if (objectName) loadData();
  }, [objectName]);

  const handleDelete = async (uid: string) => {
      if (window.confirm("Delete record?")) {
          await dataApi.deleteRecord(objectName!, uid);
          loadData();
      }
  };

  if (!object) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">{object.label}</Typography>
            <Button variant="contained" onClick={() => navigate(`/app/${objectName}/new`)}>
                New {object.label}
            </Button>
        </Box>
        
        <DataTable 
            fields={fields} 
            data={records} 
            onEdit={(uid) => navigate(`/app/${objectName}/${uid}/edit`)} 
            onDelete={handleDelete}
        />
    </Container>
  );
};

export default ObjectRecordList;
