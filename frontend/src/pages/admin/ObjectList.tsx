import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Button, IconButton, Box 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { metaApi, MetaObject } from '../../services/metaApi';
import ObjectCreateDialog from '../../components/admin/ObjectCreateDialog';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/data/DataTable';

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

  const columns = [
    { id: 'label', label: 'Label' },
    { id: 'name', label: 'API Name' },
    { id: 'source', label: 'Source' },
    { 
      id: 'actions', 
      label: 'Actions', 
      align: 'right' as const,
      format: (_: any, row: MetaObject) => (
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
      )
    },
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
      
      <DataTable 
        columns={columns as any} 
        rows={objects} 
        onRowClick={(row) => navigate(`/admin/objects/${row.id}`)}
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
