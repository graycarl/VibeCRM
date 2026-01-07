import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';

import Login from './pages/auth/Login';
import ObjectList from './pages/admin/ObjectList';
import ObjectDetail from './pages/admin/ObjectDetail';
import ListViewEditor from './pages/admin/ListViewEditor';
import PageLayoutEditor from './pages/admin/PageLayoutEditor';

import ObjectRecordList from './pages/runtime/ObjectRecordList';
import ObjectRecordEdit from './pages/runtime/ObjectRecordEdit';
import ObjectRecordDetail from './pages/runtime/ObjectRecordDetail';

import { metaApi, MetaObject } from './services/metaApi';

const drawerWidth = 240;

const Layout = () => {
  const [objects, setObjects] = useState<MetaObject[]>([]);

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        const data = await metaApi.getObjects();
        setObjects(data);
      } catch (error) {
        console.error('Failed to fetch objects', error);
      }
    };
    fetchObjects();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            VibeCRM
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button component={Link} to="/admin/objects">
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Setup (Admin)" />
            </ListItem>
            
            {objects.map((obj) => (
              <ListItem button key={obj.id} component={Link} to={`/app/${obj.name}`}>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary={obj.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/admin/objects" replace />} />
        
        {/* Admin Routes */}
        <Route path="admin/objects" element={<ObjectList />} />
        <Route path="admin/objects/:id" element={<ObjectDetail />} />
        <Route path="admin/objects/:id/list-views/new" element={<ListViewEditor />} />
        <Route path="admin/objects/:id/layouts/new" element={<PageLayoutEditor />} />

        {/* Runtime Routes */}
        <Route path="app/:objectName" element={<ObjectRecordList />} />
        <Route path="app/:objectName/new" element={<ObjectRecordEdit />} />
        <Route path="app/:objectName/:uid" element={<ObjectRecordDetail />} />
        <Route path="app/:objectName/:uid/edit" element={<ObjectRecordEdit />} />
      </Route>
      
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;