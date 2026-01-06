import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Login from './pages/auth/Login';

// Placeholder components
const AdminLayout = () => <div>Admin Layout</div>;
const RuntimeLayout = () => <div>Runtime Layout</div>;
const NotFound = () => <div>404 Not Found</div>;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
             {/* Admin routes will go here */}
          </Route>

          {/* Runtime Routes */}
          <Route path="/app" element={<RuntimeLayout />}>
             {/* Runtime routes will go here */}
          </Route>
          
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
