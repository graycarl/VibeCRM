import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, Chip 
} from '@mui/material';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import FieldCreateDialog from '../../components/admin/FieldCreateDialog';
import DataTable from '../../components/data/DataTable';
import { LoadingOverlay } from '../../components/common/Feedback';

const ObjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [object, setObject] = useState<MetaObject | null>(null);
  const [openFieldDialog, setOpenFieldDialog] = useState(false);

  const loadObject = async () => {
    if (!id) return;
    try {
      const data = await metaApi.getObject(id);
      setObject(data);
    } catch (error) {
      console.error("Failed to load object", error);
    }
  };

  useEffect(() => {
    loadObject();
  }, [id]);

  if (!object) return <LoadingOverlay />;

  const fields = (object as any).fields as MetaField[] || [];

  const columns = [
    { id: 'label', label: 'Label' },
    { id: 'name', label: 'API Name' },
    { 
      id: 'data_type', 
      label: 'Type',
      format: (value: string) => <Chip label={value} size="small" variant="outlined" />
    },
    { 
      id: 'is_required', 
      label: 'Required',
      format: (value: boolean) => value ? "Yes" : "No"
    },
    { id: 'source', label: 'Source' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box mb={4}>
        <Typography variant="h4">{object.label} ({object.name})</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Source: {object.source} | ID: {object.id}
        </Typography>
        <Typography variant="body1" mt={2}>{object.description}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Fields</Typography>
        <Button variant="contained" onClick={() => setOpenFieldDialog(true)}>
          Add Field
        </Button>
      </Box>

      <DataTable 
        columns={columns as any} 
        rows={fields} 
      />

      <FieldCreateDialog 
        open={openFieldDialog} 
        onClose={() => setOpenFieldDialog(false)} 
        objectId={object.id}
        onSuccess={loadObject} 
      />
    </Container>
  );
};

export default ObjectDetail;
