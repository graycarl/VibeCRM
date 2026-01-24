import React, { useEffect, useState, useCallback } from 'react';
import { 
  Container, Typography, Button, IconButton, Box 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { metaApi, MetaRole, MetaField } from '../../services/metaApi';
import RoleCreateDialog from '../../components/admin/RoleCreateDialog';
import DynamicDataGrid from '../../components/data/DynamicDataGrid';

const RoleList = () => {
  const [roles, setRoles] = useState<MetaRole[]>([]);
  const [openCreate, setOpenCreate] = useState(false);

  const loadRoles = useCallback(async () => {
    try {
      const data = await metaApi.getRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to load roles", error);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await metaApi.deleteRole(id);
        loadRoles();
      } catch {
        alert("Failed to delete role. System roles cannot be deleted.");
      }
    }
  };

  // Fake MetaField definitions for DataGrid columns
  const fields: MetaField[] = [
    { id: '1', object_id: 'role', name: 'label', label: 'Label', data_type: 'Text', is_required: true, source: 'system' },
    { id: '2', object_id: 'role', name: 'name', label: 'API Name', data_type: 'Text', is_required: true, source: 'system' },
    { id: '3', object_id: 'role', name: 'source', label: 'Source', data_type: 'Text', is_required: true, source: 'system' },
    { id: '4', object_id: 'role', name: 'description', label: 'Description', data_type: 'Text', is_required: false, source: 'system' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Roles
        </Typography>
        <Button variant="contained" onClick={() => setOpenCreate(true)}>
          New Role
        </Button>
      </Box>
      
      <DynamicDataGrid 
        fields={fields} 
        rows={roles} 
        actions={(row) => (
          <>
            {row.source === 'custom' && (
              <IconButton color="error" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
                <DeleteIcon />
              </IconButton>
            )}
          </>
        )}
      />

      <RoleCreateDialog 
        open={openCreate} 
        onClose={() => setOpenCreate(false)} 
        onSuccess={loadRoles} 
      />
    </Container>
  );
};

export default RoleList;
