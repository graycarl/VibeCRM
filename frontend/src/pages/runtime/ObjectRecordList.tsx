import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { metaApi, MetaObject, MetaField, MetaObjectRecordType } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import DynamicDataGrid from '../../components/data/DynamicDataGrid';
import { LoadingOverlay, ErrorAlert } from '../../components/common/Feedback';
import { RecordTypeSelectorDialog } from '../../components/common/RecordTypeSelectorDialog';

const ObjectRecordList = () => {
  const { objectName } = useParams<{ objectName: string }>();
  const [object, setObject] = useState<MetaObject | null>(null);
  const [fields, setFields] = useState<MetaField[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  
  // Record Type State
  const [recordTypes, setRecordTypes] = useState<MetaObjectRecordType[]>([]);
  const [rtDialogOpen, setRtDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const prevPageSize = useRef(50);

  const loadMetadata = async () => {
      setError(null);
      try {
          const objects = await metaApi.getObjects();
          const obj = objects.find(o => o.name === objectName);
          if (obj) {
              const fullObj = await metaApi.getObject(obj.id);
              setObject(fullObj); // Use full object with detailed props
              const allFields: MetaField[] = fullObj.fields || [];
              setFields(allFields);
              
              if (fullObj.has_record_type && fullObj.record_types) {
                  setRecordTypes(fullObj.record_types);
              } else {
                  setRecordTypes([]);
              }
          }
      } catch (err: any) {
          console.error("Failed to load metadata", err);
          setError("无法加载对象元数据，请检查网络或配置。");
      }
  };

  const loadRecords = useCallback(async () => {
      if (!objectName) return;
      setLoading(true);
      setError(null);
      try {
          const skip = paginationModel.page * paginationModel.pageSize;
          const limit = paginationModel.pageSize;
          
          let sortField = undefined;
          let sortOrder = undefined;
          if (sortModel.length > 0) {
              sortField = sortModel[0].field;
              sortOrder = sortModel[0].sort?.toUpperCase(); // asc or desc
          }

          const response = await dataApi.listRecords(objectName, skip, limit, sortField, sortOrder);
          setRecords(response.items);
          setTotalCount(response.total);
      } catch (err: any) {
          console.error("Failed to load records", err);
          setError("加载记录失败，请稍后重试。");
      } finally {
          setLoading(false);
      }
  }, [objectName, paginationModel.page, paginationModel.pageSize, sortModel]);

  useEffect(() => {
      if (objectName) {
          loadMetadata();
          setPaginationModel({ page: 0, pageSize: 50 });
          setSortModel([]);
          prevPageSize.current = 50;
      }
  }, [objectName]);

  useEffect(() => {
      loadRecords();
  }, [loadRecords]);

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    if (newModel.pageSize !== prevPageSize.current) {
        prevPageSize.current = newModel.pageSize;
        setPaginationModel({ ...newModel, page: 0 });
    } else {
        setPaginationModel(newModel);
    }
  };

  const handleCreateClick = () => {
      if (!object) return;
      
      if (object.has_record_type && recordTypes.length > 0) {
          // If only one option, auto select
          if (recordTypes.length === 1) {
              navigate(`/app/${objectName}/new?record_type=${recordTypes[0].name}`);
          } else {
              setRtDialogOpen(true);
          }
      } else {
          navigate(`/app/${objectName}/new`);
      }
  };
  
  const handleRecordTypeSelect = (rt: MetaObjectRecordType) => {
      setRtDialogOpen(false);
      navigate(`/app/${objectName}/new?record_type=${rt.name}`);
  };

  const handleDelete = async (uid: string) => {
      if (window.confirm("确定删除该记录吗？")) {
          try {
              await dataApi.deleteRecord(objectName!, uid);
              loadRecords();
          } catch (err: any) {
              console.error("Delete failed", err);
              alert("删除失败");
          }
      }
  };
  
  // Transform records to include record type label if needed
  const displayRecords = records.map(r => {
      if (object?.has_record_type && r.record_type && recordTypes.length > 0) {
          const rt = recordTypes.find(t => t.name === r.record_type);
          return { ...r, record_type: rt ? rt.label : r.record_type };
      }
      return r;
  });
  
  // Inject record_type pseudo-field if needed for display
  const displayFields = [...fields];
  if (object?.has_record_type) {
      // Use label as field key if we mapped it, or just record_type
      // But DynamicDataGrid uses field.name to lookup.
      // Let's rely on DynamicDataGrid's logic or just inject a field definition.
      if (!displayFields.find(f => f.name === 'record_type')) {
        displayFields.unshift({
            id: 'rt_pseudo',
            object_id: object.id,
            name: 'record_type', // Maps to raw value if we don't transform, or we can use valueGetter in DataGrid
            label: 'Record Type',
            data_type: 'Text', // It's text effectively
            is_required: true,
            source: 'system'
        });
      }
  }

  if (!object && !error) return <LoadingOverlay />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">{object?.label || objectName}</Typography>
            <Button variant="contained" onClick={handleCreateClick} disabled={!object}>
                新建 {object?.label || ''}
            </Button>
        </Box>
        
        {error && <ErrorAlert message={error} />}

        <DynamicDataGrid 
            fields={displayFields} 
            rows={displayRecords} 
            rowCount={totalCount}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            loading={loading}
            onRowClick={(row) => navigate(`/app/${objectName}/${row.uid}`)}
            actions={(row) => (
              <>
                <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/app/${objectName}/${row.uid}/edit`); }}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={(e) => { e.stopPropagation(); handleDelete(row.uid); }}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}
            // Custom renderer or value getter logic could be passed here if DynamicDataGrid supported it more flexibly
            // For now, we rely on `displayRecords` having `record_type` or `record_type_label`
            // If field is 'record_type', DataGrid looks for row['record_type'].
            // We want it to show label. 
            // Quick fix: Replace 'record_type' value in displayRecords with label directly?
            // Yes, done in displayRecords mapping above: actually we added `record_type_label` but kept `record_type`.
            // If we simply overwrite `record_type` in `displayRecords`, it works for display.
            // Let's refine the map above.
        />
        
        <RecordTypeSelectorDialog
            open={rtDialogOpen}
            recordTypes={recordTypes}
            onSelect={handleRecordTypeSelect}
            onClose={() => setRtDialogOpen(false)}
        />
    </Container>
  );
};

export default ObjectRecordList;
