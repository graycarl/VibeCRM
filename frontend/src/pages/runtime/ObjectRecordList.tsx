import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import DataTable from '../../components/data/DataTable';
import { LoadingOverlay } from '../../components/common/Feedback';
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
          
          try {
              const viewsRes = await axios.get(`${API_URL}/meta/objects/${obj.id}/list-views`);
              const views = viewsRes.data;
              if (views.length > 0) {
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
      if (window.confirm("确定删除该记录吗？")) {
          await dataApi.deleteRecord(objectName!, uid);
          loadData();
      }
  };

  if (!object) return <LoadingOverlay />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">{object.label}</Typography>
            <Button variant="contained" onClick={() => navigate(`/app/${objectName}/new`)}>
                新建 {object.label}
            </Button>
        </Box>
        
        <DataTable 
            fields={fields} 
            rows={records} 
            onRowClick={(row) => navigate(`/app/${objectName}/${row.uid}`)}
            actions={(row) => (
              <>
                <IconButton onClick={() => navigate(`/app/${objectName}/${row.uid}/edit`)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(row.uid)}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}
        />
    </Container>
  );
};

export default ObjectRecordList;
