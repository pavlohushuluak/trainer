
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserManagement } from '@/components/admin/UserManagement';
import { ChatManagement } from '@/components/admin/ChatManagement';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { SupportManagement } from '@/components/admin/SupportManagement';
import { SystemMonitoring } from '@/components/admin/SystemMonitoring';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { NetworkDiagnostics } from '@/components/admin/NetworkDiagnostics';

const AdminDashboard = () => {
  console.log('AdminDashboard: Rendering dashboard');
  
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="analytics" replace />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="chats" element={<ChatManagement />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="support" element={<SupportManagement />} />
          <Route path="system" element={<SystemMonitoring />} />
          <Route path="network" element={<NetworkDiagnostics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminDashboard;
