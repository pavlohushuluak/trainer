
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NetworkDiagnostics } from '@/utils/networkDiagnostics';
import { Wifi, WifiOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const NetworkDiagnosticPanel = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const report = await NetworkDiagnostics.performFullDiagnostic();
      setResults(report);
    } catch (error) {
      console.error('Diagnostic failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? t('networkDiagnostic.ok') : t('networkDiagnostic.failed')}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          {t('networkDiagnostic.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? t('networkDiagnostic.running') : t('networkDiagnostic.runDiagnostic')}
        </Button>

        {results && (
          <div className="space-y-6">
            {/* Network Details */}
            <div>
              <h3 className="font-semibold mb-3">{t('networkDiagnostic.networkInformation')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('networkDiagnostic.onlineStatus')}:</span>
                  <div className="flex items-center gap-2">
                    {results.networkDetails.onLine ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    <span>{results.networkDetails.onLine ? t('networkDiagnostic.online') : t('networkDiagnostic.offline')}</span>
                  </div>
                </div>
                {results.networkDetails.connection !== 'Not available' && (
                  <>
                    <div className="flex justify-between">
                      <span>{t('networkDiagnostic.connectionType')}:</span>
                      <span>{results.networkDetails.connection.effectiveType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('networkDiagnostic.downlink')}:</span>
                      <span>{results.networkDetails.connection.downlink} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('networkDiagnostic.rtt')}:</span>
                      <span>{results.networkDetails.connection.rtt} ms</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Supabase Tests */}
            <div>
              <h3 className="font-semibold mb-3">{t('networkDiagnostic.supabaseConnectivity')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.supabaseTests.basicConnection)}
                    <span>{t('networkDiagnostic.basicConnection')}</span>
                  </div>
                  {getStatusBadge(results.supabaseTests.basicConnection)}
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.supabaseTests.authConnection)}
                    <span>{t('networkDiagnostic.authentication')}</span>
                  </div>
                  {getStatusBadge(results.supabaseTests.authConnection)}
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.supabaseTests.databaseRead)}
                    <span>{t('networkDiagnostic.databaseRead')}</span>
                  </div>
                  {getStatusBadge(results.supabaseTests.databaseRead)}
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.supabaseTests.databaseWrite)}
                    <span>{t('networkDiagnostic.databaseWrite')}</span>
                  </div>
                  {getStatusBadge(results.supabaseTests.databaseWrite)}
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.supabaseTests.edgeFunction)}
                    <span>{t('networkDiagnostic.edgeFunctions')}</span>
                  </div>
                  {getStatusBadge(results.supabaseTests.edgeFunction)}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {t('networkDiagnostic.recommendations')}
                </h3>
                <ul className="space-y-2">
                  {results.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
