
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailTestToggle } from './EmailTestToggle';
import { EmailLogs } from './EmailLogs';
import { useTranslation } from 'react-i18next';

export const EmailManagement = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('adminEmailManagement.title')}</h1>
        <p className="text-muted-foreground">
          {t('adminEmailManagement.description')}
        </p>
      </div>

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration">{t('adminEmailManagement.tabs.configuration')}</TabsTrigger>
          <TabsTrigger value="logs">{t('adminEmailManagement.tabs.logs')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration" className="space-y-4">
          <EmailTestToggle />
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <EmailLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};
