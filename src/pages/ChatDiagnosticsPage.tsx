
import { ChatDiagnostics } from '@/components/chat/ChatDiagnostics';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslations } from '@/hooks/useTranslations';

const ChatDiagnosticsPage = () => {
  const { t } = useTranslations();

  return (
    <MainLayout showFooter={false} showSupportButton={false}>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('chatDiagnostics.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('chatDiagnostics.description')}
          </p>
        </div>
        
        <ChatDiagnostics />
      </div>
    </div>
    </MainLayout>
  );
};

export default ChatDiagnosticsPage;
