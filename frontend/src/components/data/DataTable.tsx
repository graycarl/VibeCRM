import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  Typography
} from '@mui/material';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns?: Column[];
  fields?: any[]; // For MetaField support
  rows: any[];
  onRowClick?: (row: any) => void;
  actions?: (row: any) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({ columns, fields, rows, onRowClick, actions }) => {
  // Derive columns from fields if provided
  const tableColumns: Column[] = columns || (fields ? fields.map(f => ({
    id: f.name,
    label: f.label,
    format: (val: any) => typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val
  })) : []);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {tableColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions && <TableCell align="right">操作</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow 
                hover 
                role="checkbox" 
                tabIndex={-1} 
                key={row.uid || row.id || index}
                onClick={() => onRowClick?.(row)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {tableColumns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell key={column.id} align={column.align}>
                      {column.format ? column.format(value, row) : value}
                    </TableCell>
                  );
                })}
                {actions && (
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">无数据</Typography>
          </Box>
        )}
      </TableContainer>
    </Paper>
  );
};

export default DataTable;
