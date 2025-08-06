
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailTestToggle } from './EmailTestToggle';
import { EmailLogs } from './EmailLogs';
import { useTranslation } from 'react-i18next';

export const EmailManagement = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section - Mobile Responsive */}
      <div className="space-y-2 sm:space-y-3">
        <h1 className="text-xl sm:text-2xl font-bold">{t('adminEmailManagement.title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t('adminEmailManagement.description')}
        </p>
      </div>

      {/* Tabs Section - Mobile Responsive */}
      <Tabs defaultValue="configuration" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto sm:h-10">
          <TabsTrigger value="configuration" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminEmailManagement.tabs.configuration')}
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminEmailManagement.tabs.logs')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <EmailTestToggle />
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <EmailLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};
