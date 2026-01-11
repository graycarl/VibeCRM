import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Button, IconButton, Box 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import ObjectCreateDialog from '../../components/admin/ObjectCreateDialog';
import { useNavigate } from 'react-router-dom';
import DynamicDataGrid from '../../components/data/DynamicDataGrid';

const ObjectList = () => {
  const [objects, setObjects] = useState<MetaObject[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const navigate = useNavigate();

  const loadObjects = async () => {
    try {
      const data = await metaApi.getObjects();
      setObjects(data);
    } catch (error) {
      console.error("Failed to load objects", error);
    }
  };

  useEffect(() => {
    loadObjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This will delete the object and its data table.")) {
      await metaApi.deleteObject(id);
      loadObjects();
    }
  };

  const fields: MetaField[] = [
    { name: 'label', label: 'Label', type: 'Text' },
    { name: 'name', label: 'API Name', type: 'Text' },
    { name: 'source', label: 'Source', type: 'Text' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Custom Objects
        </Typography>
        <Button variant="contained" onClick={() => setOpenCreate(true)}>
          New Object
        </Button>
      </Box>
      
      <DynamicDataGrid 
        fields={fields} 
        rows={objects} 
        onRowClick={(row) => navigate(`/admin/objects/${row.id}`)}
        actions={(row) => (
          <>
            <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/admin/objects/${row.id}`); }}>
              <VisibilityIcon />
            </IconButton>
            {row.source === 'custom' && (
              <IconButton color="error" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
                <DeleteIcon />
              </IconButton>
            )}
          </>
        )}
      />

      <ObjectCreateDialog 
        open={openCreate} 
        onClose={() => setOpenCreate(false)} 
        onSuccess={loadObjects} 
      />
    </Container>
  );
};

export default ObjectList;
