import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import DynamicDataGrid from '../../components/data/DynamicDataGrid';
import { LoadingOverlay } from '../../components/common/Feedback';

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
          const allFields: MetaField[] = fullObj.fields || [];
          
          // Use all fields for now. 
          // Future: Filter by ListView configuration once metaApi supports it.
          setFields(allFields);
          
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
        
        <DynamicDataGrid 
            fields={fields} 
            rows={records} 
            onRowClick={(row) => navigate(`/app/${objectName}/${row.uid}`)}
            actions={(row) => (
              <>
                <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/app/${objectName}/${row.uid}/edit`); }}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={(e) => { e.stopPropagation(); handleDelete(row.uid); }}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}
        />
    </Container>
  );
};

export default ObjectRecordList;
