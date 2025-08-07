
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface EmailStats {
  sent: number;
  failed: number;
  lastSent: string | null;
}

export const EmailStatistics = () => {
  const { t } = useTranslation();
  const [emailStats, setEmailStats] = useState<EmailStats>({
    sent: 0,
    failed: 0,
    lastSent: null
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await supabase
          .from('system_notifications')
          .select('*')
          .in('type', ['welcome_email', 'checkout_confirmation', 'cancellation_email', 'support_notification', 'payment_notification'])
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (data) {
          setEmailStats({
            sent: data.filter(n => n.status === 'sent').length,
            failed: data.filter(n => n.status === 'failed').length,
            lastSent: data[0]?.created_at || null
          });
        }
      } catch (error) {
        console.warn('Could not load email stats:', error);
      }
    };
    
    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
      <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{emailStats.sent}</div>
        <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">{t('adminEmail.statistics.sent')}</div>
      </div>
      <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">{emailStats.failed}</div>
        <div className="text-xs sm:text-sm text-red-700 dark:text-red-300">{t('adminEmail.statistics.failed')}</div>
      </div>
      <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">{t('adminEmail.statistics.lastEmail')}</div>
        <div className="text-xs text-blue-600 dark:text-blue-400">
          {emailStats.lastSent ? new Date(emailStats.lastSent).toLocaleDateString() : t('adminEmail.statistics.none')}
        </div>
      </div>
    </div>
  );
};
