import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Box, Button, Chip 
} from '@mui/material';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import FieldCreateDialog from '../../components/admin/FieldCreateDialog';

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

  if (!object) return <Typography>Loading...</Typography>;

  const fields = (object as any).fields as MetaField[] || [];

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>API Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>Source</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>{field.label}</TableCell>
                <TableCell>{field.name}</TableCell>
                <TableCell><Chip label={field.data_type} size="small" /></TableCell>
                <TableCell>{field.is_required ? "Yes" : "No"}</TableCell>
                <TableCell>{field.source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
