import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Typography, Box, Button 
} from '@mui/material';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import FieldCreateDialog from '../../components/admin/FieldCreateDialog';
import ObjectCreateDialog from '../../components/admin/ObjectCreateDialog';
import DynamicDataGrid from '../../components/data/DynamicDataGrid';
import { LoadingOverlay } from '../../components/common/Feedback';

const ObjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [object, setObject] = useState<MetaObject | null>(null);
  const [openFieldDialog, setOpenFieldDialog] = useState(false);
  const [openObjectDialog, setOpenObjectDialog] = useState(false);
  const [selectedField, setSelectedField] = useState<MetaField | null>(null);

  const loadObject = useCallback(async () => {
    if (!id) return;
    try {
      const data = await metaApi.getObject(id);
      setObject(data);
    } catch (error) {
      console.error("Failed to load object", error);
    }
  }, [id]);

  useEffect(() => {
    loadObject();
  }, [id, loadObject]);

  if (!object) return <LoadingOverlay />;

  const objectFields = (object as any).fields as MetaField[] || [];

  const handleAddField = () => {
    setSelectedField(null);
    setOpenFieldDialog(true);
  };

  const handleEditField = (field: MetaField) => {
    setSelectedField(field);
    setOpenFieldDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenFieldDialog(false);
    setSelectedField(null);
  };

  const gridFields: (Partial<MetaField> & { name: string, label: string })[] = [
    { name: 'label', label: 'Label', data_type: 'Text' },
    { name: 'name', label: 'API Name', data_type: 'Text' },
    { name: 'data_type', label: 'Type', data_type: 'Text' },
    { name: 'is_required', label: 'Required', data_type: 'Boolean' },
    { name: 'source', label: 'Source', data_type: 'Text' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4">{object.label} ({object.name})</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Source: {object.source} | ID: {object.id}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => setOpenObjectDialog(true)}>
            Edit Object
          </Button>
        </Box>
        <Typography variant="body1" mt={2}>{object.description}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Fields</Typography>
        <Button variant="contained" onClick={handleAddField}>
          Add Field
        </Button>
      </Box>

      <DynamicDataGrid 
        fields={gridFields} 
        rows={objectFields} 
        onRowClick={(row) => handleEditField(row as MetaField)}
      />

      <FieldCreateDialog 
        open={openFieldDialog} 
        onClose={handleCloseDialog} 
        objectId={object.id}
        onSuccess={loadObject} 
        fieldToEdit={selectedField}
      />

      <ObjectCreateDialog
        open={openObjectDialog}
        onClose={() => setOpenObjectDialog(false)}
        onSuccess={loadObject}
        objectToEdit={object}
      />
    </Container>
  );
};

export default ObjectDetail;
