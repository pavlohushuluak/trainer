
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube } from 'lucide-react';
import { useTestUserActions } from './test-user/TestUserActions';
import { TestUserForm } from './test-user/TestUserForm';
import { TestUserInstructions } from './test-user/TestUserInstructions';
import { useTranslation } from 'react-i18next';

export const TestUserManager = () => {
  const { t } = useTranslation();
  const [testEmail, setTestEmail] = useState('test@tiertrainer.de');
  const { createTestUser, generateMagicLink } = useTestUserActions();

  const handleCreateTestUser = () => {
    createTestUser.mutate(testEmail);
  };

  const handleGenerateMagicLink = () => {
    generateMagicLink.mutate(testEmail);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          {t('adminUsers.testUserManager.title')}
        </CardTitle>
        <CardDescription>
          {t('adminUsers.testUserManager.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TestUserForm
          testEmail={testEmail}
          setTestEmail={setTestEmail}
          onCreateTestUser={handleCreateTestUser}
          onGenerateMagicLink={handleGenerateMagicLink}
          isCreatingUser={createTestUser.isPending}
          isGeneratingLink={generateMagicLink.isPending}
        />
        
        <TestUserInstructions />
      </CardContent>
    </Card>
  );
};
