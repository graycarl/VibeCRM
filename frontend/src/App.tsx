import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/auth/Login';
import ObjectList from './pages/admin/ObjectList';
import ObjectDetail from './pages/admin/ObjectDetail';
import ListViewEditor from './pages/admin/ListViewEditor';
import PageLayoutEditor from './pages/admin/PageLayoutEditor';
import RoleList from './pages/admin/RoleList';

import ObjectRecordList from './pages/runtime/ObjectRecordList';
import ObjectRecordEdit from './pages/runtime/ObjectRecordEdit';
import ObjectRecordDetail from './pages/runtime/ObjectRecordDetail';

import MuiShowcase from './components/MuiShowcase';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/admin/objects" replace />} />
        
        {/* Admin Routes */}
        <Route path="admin/objects" element={<ObjectList />} />
        <Route path="admin/objects/:id" element={<ObjectDetail />} />
        <Route path="admin/objects/:id/list-views/new" element={<ListViewEditor />} />
        <Route path="admin/objects/:id/layouts/new" element={<PageLayoutEditor />} />
        <Route path="admin/roles" element={<RoleList />} />

        {/* Runtime Routes */}
        <Route path="app/:objectName" element={<ObjectRecordList />} />
        <Route path="app/:objectName/new" element={<ObjectRecordEdit />} />
        <Route path="app/:objectName/:uid" element={<ObjectRecordDetail />} />
        <Route path="app/:objectName/:uid/edit" element={<ObjectRecordEdit />} />
        
        <Route path="showcase" element={<MuiShowcase />} />
      </Route>
      
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;