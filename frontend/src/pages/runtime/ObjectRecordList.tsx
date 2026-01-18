import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { metaApi, MetaObject, MetaField } from '../../services/metaApi';
import { dataApi } from '../../services/dataApi';
import DynamicDataGrid from '../../components/data/DynamicDataGrid';
import { LoadingOverlay, ErrorAlert } from '../../components/common/Feedback';

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
  const navigate = useNavigate();
  
  // To detect page size changes
  const prevPageSize = useRef(50);

  const loadMetadata = async () => {
      setError(null);
      try {
          const objects = await metaApi.getObjects();
          const obj = objects.find(o => o.name === objectName);
          if (obj) {
              setObject(obj);
              const fullObj = await metaApi.getObject(obj.id);
              const allFields: MetaField[] = fullObj.fields || [];
              setFields(allFields);
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
          // Reset pagination and sort when object changes
          setPaginationModel({ page: 0, pageSize: 50 });
          setSortModel([]);
          prevPageSize.current = 50;
      }
  }, [objectName]);

  useEffect(() => {
      loadRecords();
  }, [loadRecords]);

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    // If page size changed, reset to page 0 per specification
    if (newModel.pageSize !== prevPageSize.current) {
        prevPageSize.current = newModel.pageSize;
        setPaginationModel({ ...newModel, page: 0 });
    } else {
        setPaginationModel(newModel);
    }
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

  if (!object && !error) return <LoadingOverlay />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">{object?.label || objectName}</Typography>
            <Button variant="contained" onClick={() => navigate(`/app/${objectName}/new`)} disabled={!object}>
                新建 {object?.label || ''}
            </Button>
        </Box>
        
        {error && <ErrorAlert message={error} />}

        <DynamicDataGrid 
            fields={fields} 
            rows={records} 
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
        />
    </Container>
  );
};

export default ObjectRecordList;
