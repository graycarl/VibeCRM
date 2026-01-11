import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Typography, Box, Button 
} from '@mui/material';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import FieldCreateDialog from '../../components/admin/FieldCreateDialog';
import DynamicDataGrid from '../../components/data/DynamicDataGrid';
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

  const objectFields = (object as any).fields as MetaField[] || [];

  const gridFields: MetaField[] = [
    { name: 'label', label: 'Label', type: 'Text' },
    { name: 'name', label: 'API Name', type: 'Text' },
    { name: 'data_type', label: 'Type', type: 'Text' },
    { name: 'is_required', label: 'Required', type: 'Boolean' },
    { name: 'source', label: 'Source', type: 'Text' },
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

      <DynamicDataGrid 
        fields={gridFields} 
        rows={objectFields} 
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
