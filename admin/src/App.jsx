import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminProvider } from './context/AdminContext';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContent from './pages/admin/AdminContent';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminAdmins from './pages/admin/AdminAdmins';
import AdminCategories from './pages/admin/AdminCategories';

import AdminLayout from './components/layout/AdminLayout';
import ProtectedAdminRoute from './components/layout/ProtectedAdminRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1B3A18',
              color: '#fff',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#52B788', secondary: '#fff' } },
            error: { style: { background: '#7f1d1d', color: '#fff' } },
          }}
        />

        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="admins" element={<AdminAdmins />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </AdminProvider>
    </BrowserRouter>
  );
}
