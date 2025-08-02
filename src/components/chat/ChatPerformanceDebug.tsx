import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ChatPerformanceDebugProps {
  debugMode: {
    enabled: boolean;
    skipHistory: boolean;
    skipSubscription: boolean;
    useOfflineResponses: boolean;
    forceTempSession: boolean;
  };
  enableDebugMode: (options: any) => void;
  generatePerformanceReport: () => any;
  metrics: {
    sessionCreation: number | null;
    historyLoading: number | null;
    subscriptionCheck: number | null;
    openaiResponse: number | null;
    totalInitialization: number | null;
  };
}

export const ChatPerformanceDebug = ({ 
  debugMode, 
  enableDebugMode, 
  generatePerformanceReport,
  metrics 
}: ChatPerformanceDebugProps) => {
  const [showDebug, setShowDebug] = useState(false);
  const [performanceReport, setPerformanceReport] = useState<any>(null);

  const getPerformanceStatus = (duration: number | null) => {
    if (!duration) return { status: 'unknown', color: 'gray' };
    
    if (duration > 3000) return { status: 'critical', color: 'red' };
    if (duration > 1000) return { status: 'slow', color: 'orange' };
    if (duration > 500) return { status: 'medium', color: 'yellow' };
    return { status: 'fast', color: 'green' };
  };

  const handleGenerateReport = () => {
    const report = generatePerformanceReport();
    setPerformanceReport(report);
  };

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDebug(true)}
          className="bg-background/80 backdrop-blur"
        >
          🔧 Debug Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-background/95 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              🔧 Chat Performance Debug
              {debugMode.enabled && (
                <Badge variant="secondary" className="text-xs">
                  Debug ON
                </Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDebug(false)}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Performance Metrics */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Performance Metrics</Label>
            <div className="space-y-1">
              {Object.entries(metrics).map(([key, value]) => {
                const { status, color } = getPerformanceStatus(value);
                return (
                  <div key={key} className="flex justify-between items-center text-xs">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-1">
                      <span>{value ? `${value.toFixed(0)}ms` : 'N/A'}</span>
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ backgroundColor: color === 'red' ? '#ef4444' : 
                                                 color === 'orange' ? '#f97316' :
                                                 color === 'yellow' ? '#eab308' :
                                                 color === 'green' ? '#22c55e' : '#6b7280' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Debug Controls */}
          <div className="space-y-3">
            <Label className="text-xs font-medium">Debug Controls</Label>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="skip-history" className="text-xs">Skip History Loading</Label>
                <Switch
                  id="skip-history"
                  checked={debugMode.skipHistory}
                  onCheckedChange={(checked) => 
                    enableDebugMode({ skipHistory: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="skip-subscription" className="text-xs">Skip Subscription Check</Label>
                <Switch
                  id="skip-subscription"
                  checked={debugMode.skipSubscription}
                  onCheckedChange={(checked) => 
                    enableDebugMode({ skipSubscription: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="offline-responses" className="text-xs">Use Offline Responses</Label>
                <Switch
                  id="offline-responses"
                  checked={debugMode.useOfflineResponses}
                  onCheckedChange={(checked) => 
                    enableDebugMode({ useOfflineResponses: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="force-temp" className="text-xs">Force Temp Session</Label>
                <Switch
                  id="force-temp"
                  checked={debugMode.forceTempSession}
                  onCheckedChange={(checked) => 
                    enableDebugMode({ forceTempSession: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleGenerateReport}
              className="w-full text-xs"
            >
              📊 Generate Performance Report
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => enableDebugMode({ 
                skipHistory: true, 
                skipSubscription: true, 
                forceTempSession: true 
              })}
              className="w-full text-xs"
            >
              ⚡ Ultra Fast Mode
            </Button>
          </div>

          {/* Performance Report */}
          {performanceReport && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-xs space-y-1">
                <div className="font-medium">Performance Report:</div>
                <div>Total Time: {performanceReport.totalTime?.toFixed(0)}ms</div>
                {performanceReport.recommendations.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium">Recommendations:</div>
                    {performanceReport.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="text-xs text-muted-foreground">• {rec}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};