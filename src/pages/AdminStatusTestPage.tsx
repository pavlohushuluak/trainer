import { AdminStatusTest } from '@/components/debug/AdminStatusTest';
import { LanguagePersistenceTest } from '@/components/debug/LanguagePersistenceTest';
import { ChatFunctionTest } from '@/components/debug/ChatFunctionTest';
import { SimpleChatTest } from '@/components/debug/SimpleChatTest';
import { MainLayout } from '@/components/layout/MainLayout';

const AdminStatusTestPage = () => {
  return (
    <MainLayout showFooter={false} showSupportButton={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔐 Admin Status Test
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This page helps debug and verify admin detection is working correctly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AdminStatusTest />
            <LanguagePersistenceTest />
            <ChatFunctionTest />
            <SimpleChatTest />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminStatusTestPage; 