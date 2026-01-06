import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Box 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { metaApi, MetaObject } from '../../services/metaApi';
import ObjectCreateDialog from '../../components/admin/ObjectCreateDialog';
import { useNavigate } from 'react-router-dom';

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
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>API Name</TableCell>
              <TableCell>Source</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {objects.map((obj) => (
              <TableRow key={obj.id}>
                <TableCell>{obj.label}</TableCell>
                <TableCell>{obj.name}</TableCell>
                <TableCell>{obj.source}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/admin/objects/${obj.id}`)}>
                    <VisibilityIcon />
                  </IconButton>
                  {obj.source === 'custom' && (
                    <IconButton color="error" onClick={() => handleDelete(obj.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ObjectCreateDialog 
        open={openCreate} 
        onClose={() => setOpenCreate(false)} 
        onSuccess={loadObjects} 
      />
    </Container>
  );
};

export default ObjectList;
