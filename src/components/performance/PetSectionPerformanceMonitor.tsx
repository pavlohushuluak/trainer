
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PerformanceMetric {
  component: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'loading' | 'completed' | 'error';
  type: 'query' | 'render' | 'action';
}

interface PetSectionPerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const PetSectionPerformanceMonitor = ({ 
  isVisible = false, 
  onToggle 
}: PetSectionPerformanceMonitorProps) => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const metricsRef = useRef<PerformanceMetric[]>([]);

  // Performance tracking functions
  const startTracking = (component: string, type: 'query' | 'render' | 'action') => {
    const metric: PerformanceMetric = {
      component,
      startTime: performance.now(),
      status: 'loading',
      type
    };
    
    metricsRef.current.push(metric);
    setMetrics([...metricsRef.current]);
    
    
    return metric;
  };

  const endTracking = (component: string, success: boolean = true) => {
    const metric = metricsRef.current.find(
      m => m.component === component && !m.endTime
    );
    
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.status = success ? 'completed' : 'error';
      
      setMetrics([...metricsRef.current]);
      
      const status = metric.duration > 1000 ? t('performance.status.slow') : 
                    metric.duration > 500 ? t('performance.status.medium') : t('performance.status.fast');
      
      
    }
  };

  // Expose tracking functions globally
  useEffect(() => {
    if (isMonitoring) {
      (window as any).petPerformanceTracker = {
        start: startTracking,
        end: endTracking,
        clear: () => {
          metricsRef.current = [];
          setMetrics([]);
        }
      };
    }

    return () => {
      delete (window as any).petPerformanceTracker;
    };
  }, [isMonitoring]);

  const getStatusColor = (duration?: number, status?: string) => {
    if (status === 'error') return 'destructive';
    if (status === 'loading') return 'secondary';
    if (!duration) return 'secondary';
    if (duration > 1000) return 'destructive';
    if (duration > 500) return 'outline'; // Changed from 'yellow' to 'outline'
    return 'secondary'; // Changed from 'green' to 'secondary' for fast operations
  };

  const getStatusIcon = (duration?: number, status?: string) => {
    if (status === 'error') return <AlertTriangle className="h-4 w-4" />;
    if (status === 'loading') return <Clock className="h-4 w-4 animate-spin" />;
    if (!duration) return <Clock className="h-4 w-4" />;
    if (duration > 1000) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const clearMetrics = () => {
    metricsRef.current = [];
    setMetrics([]);
  };

  const averageLoadTime = metrics
    .filter(m => m.duration)
    .reduce((acc, m) => acc + (m.duration || 0), 0) / 
    Math.max(metrics.filter(m => m.duration).length, 1);

  const slowComponents = metrics.filter(m => m.duration && m.duration > 500);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 bg-white shadow-lg"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        {t('performance.title')} ({metrics.length})
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50 bg-white shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('performance.petSection.title')}
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={clearMetrics}>
              {t('performance.actions.clear')}
            </Button>
            <Button size="sm" variant="outline" onClick={onToggle}>
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-blue-50 rounded">
            <div className="font-medium">{t('performance.summary.average')}</div>
            <div className="text-lg">{averageLoadTime.toFixed(0)}ms</div>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <div className="font-medium">{t('performance.summary.slow')}</div>
            <div className="text-lg">{slowComponents.length}</div>
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between text-xs p-2 border rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(metric.duration, metric.status)}
                <span className="font-medium">{metric.component}</span>
                <Badge variant="outline" className="text-xs px-1">
                  {metric.type}
                </Badge>
              </div>
              <Badge variant={getStatusColor(metric.duration, metric.status)}>
                {metric.duration ? `${metric.duration.toFixed(0)}ms` : t('performance.loading')}
              </Badge>
            </div>
          ))}
          
          {metrics.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              {t('performance.noMetrics.description')}<br />
              {t('performance.noMetrics.action')}
            </div>
          )}
        </div>

        {/* Performance Tips */}
        {slowComponents.length > 0 && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="font-medium text-yellow-800 mb-1">{t('performance.improvements.title')}:</div>
            <ul className="text-yellow-700 space-y-1">
              {slowComponents.map((comp, i) => (
                <li key={i}>• {comp.component}: {comp.duration?.toFixed(0)}ms {t('performance.improvements.tooSlow')}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
