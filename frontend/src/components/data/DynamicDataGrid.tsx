import React, { useMemo } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { MetaField } from '../../services/metaApi';
import { getOptionLabel } from '../../utils/metadata';

export interface DynamicDataGridProps {
  /**
   * List of metadata fields to generate columns from.
   */
  fields: (Partial<MetaField> & { name: string, label: string })[];

  /**
   * Data rows to display.
   */
  rows: any[];

  /**
   * Total number of rows on the server.
   */
  rowCount?: number;

  /**
   * Current pagination model.
   */
  paginationModel?: GridPaginationModel;

  /**
   * Callback when pagination model changes.
   */
  onPaginationModelChange?: (model: GridPaginationModel) => void;

  /**
   * Current sort model.
   */
  sortModel?: GridSortModel;

  /**
   * Callback when sort model changes.
   */
  onSortModelChange?: (model: GridSortModel) => void;

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
  rowCount,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
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
        sortable: false, // Default to not sortable
      };

      const type = field.data_type || (field as any).type;

      switch (type) {
        case 'Number':
          colDef.type = 'number';
          colDef.align = 'right';
          colDef.headerAlign = 'right';
          colDef.sortable = true;
          break;
        case 'Date':
        case 'Datetime':
          colDef.type = 'string';
          colDef.sortable = true;
          colDef.valueFormatter = (value: any) => {
            if (value == null || value === '') return '';
            try {
              const date = new Date(value);
              if (isNaN(date.getTime())) return String(value);
              
              if (type === 'Date') {
                return date.toLocaleDateString();
              }
              return date.toLocaleString();
            } catch (e) {
              return String(value);
            }
          };
          break;
        case 'Boolean':
          colDef.type = 'boolean';
          break;
        case 'Picklist':
          colDef.type = 'string';
          colDef.valueFormatter = (value: any) => getOptionLabel(field, value);
          break;
        case 'Lookup':
        case 'Metadata':
            colDef.type = 'string';
            // Use the enriched label field if available
            colDef.valueGetter = (value, row) => {
                if (value == null) return '';
                const labelKey = `${field.name}__label`;
                return row[labelKey] || value;
            };
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
        paginationMode={paginationModel ? "server" : "client"}
        rowCount={paginationModel ? (rowCount ?? -1) : undefined}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortingMode={sortModel ? "server" : "client"}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        pageSizeOptions={[10, 25, 50]}
        initialState={paginationModel ? undefined : {
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
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