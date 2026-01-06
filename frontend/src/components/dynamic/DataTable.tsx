import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { MetaField } from '../../services/metaApi';

interface Props {
  fields: MetaField[];
  data: any[];
  onEdit: (uid: string) => void;
  onDelete: (uid: string) => void;
}

const DataTable: React.FC<Props> = ({ fields, data, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {fields.map(field => (
              <TableCell key={field.id}>{field.label}</TableCell>
            ))}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.uid}>
              {fields.map(field => (
                <TableCell key={field.id}>
                  {typeof row[field.name] === 'boolean' 
                    ? (row[field.name] ? 'Yes' : 'No') 
                    : row[field.name]}
                </TableCell>
              ))}
              <TableCell align="right">
                <IconButton onClick={() => onEdit(row.uid)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => onDelete(row.uid)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={fields.length + 1} align="center">No records found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
