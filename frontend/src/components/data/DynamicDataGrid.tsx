import React, { useMemo } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { MetaField } from '../../services/metaApi';

export interface DynamicDataGridProps {
  /**
   * List of metadata fields to generate columns from.
   */
  fields: MetaField[];

  /**
   * Data rows to display.
   */
  rows: any[];

  /**
   * Loading state.
   */
  loading?: boolean;

  /**
   * Callback when a row is clicked.
   */
  onRowClick?: (row: any) => void;

  /**
   * Custom renderer for the actions column.
   */
  actions?: (row: any) => React.ReactNode;
}

const DynamicDataGrid: React.FC<DynamicDataGridProps> = ({
  fields,
  rows,
  loading = false,
  onRowClick,
  actions,
}) => {
  const columns: GridColDef[] = useMemo(() => {
    const generatedColumns: GridColDef[] = fields.map((field) => {
      let colDef: GridColDef = {
        field: field.name,
        headerName: field.label,
        flex: 1,
        minWidth: 100,
      };

      const type = field.data_type || (field as any).type;

      switch (type) {
        case 'Number':
          colDef.type = 'number';
          colDef.align = 'right';
          colDef.headerAlign = 'right';
          break;
        case 'Date':
        case 'Datetime':
          colDef.type = 'string';
          colDef.valueFormatter = (params) => {
            if (!params.value) return '';
            try {
              const date = new Date(params.value);
              if (isNaN(date.getTime())) return params.value;
              
              if (type === 'Date') {
                return date.toLocaleDateString();
              }
              return date.toLocaleString();
            } catch (e) {
              return params.value;
            }
          };
          break;
        case 'Boolean':
          colDef.type = 'boolean';
          break;
        default:
          colDef.type = 'string';
      }

      return colDef;
    });

    if (actions) {
      generatedColumns.push({
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => actions(params.row),
        align: 'center',
        headerAlign: 'center',
      });
    }

    return generatedColumns;
  }, [fields, actions]);

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.uid || row.id}
        onRowClick={(params) => onRowClick && onRowClick(params.row)}
        pagination
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        disableColumnSorting
        disableColumnFilter
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: (theme) => theme.palette.grey[100],
            color: (theme) => theme.palette.text.secondary,
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          },
          // Custom styling for empty state can be added here via slots or overlay
        }}
      />
    </Box>
  );
};

export default DynamicDataGrid;
