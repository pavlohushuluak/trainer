import { useTranslations } from '@/hooks/useTranslations';
import { useTranslation } from 'react-i18next';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Camera, 
  Heart, 
  Lightbulb, 
  Target, 
  X,
  Calendar,
  User
} from 'lucide-react';

interface AnalysisDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: any;
  petInfo?: {
    name: string;
    species: string;
  } | null;
  analysisDate?: string;
}

export const AnalysisDetailModal = ({ 
  isOpen, 
  onClose, 
  analysis, 
  petInfo,
  analysisDate 
}: AnalysisDetailModalProps) => {
  const { t } = useTranslations();
  const { i18n } = useTranslation();

  if (!analysis) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      i18n.language === 'de' ? 'de-DE' : 'en-US',
      { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  const getMoodBadge = (mood: string) => {
    const moodLower = mood?.toLowerCase() || '';
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      'entspannt': 'default',
      'aufmerksam': 'secondary',
      'angespannt': 'outline',
      'verspielt': 'default',
      'ängstlich': 'destructive'
    };
    
    return variants[moodLower] || 'secondary';
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t('imageAnalysis.detail.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Pet Information */}
              {petInfo && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {t('imageAnalysis.detail.petInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🐾</div>
                      <div>
                        <p className="font-semibold text-lg">{petInfo.name}</p>
                        <p className="text-muted-foreground">{petInfo.species}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Date */}
              {analysisDate && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{t('imageAnalysis.detail.analyzedOn')}: {formatDate(analysisDate)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mood Assessment */}
              {analysis.mood_estimation && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      {t('imageAnalysis.detail.moodAssessment')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <div>
                        <Badge variant={getMoodBadge(analysis.mood_estimation)} className="text-sm">
                          {analysis.mood_estimation}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Summary */}
              {analysis.analysis && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      {t('imageAnalysis.detail.analysisSummary')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {analysis.analysis}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary Text */}
              {analysis.summary_text && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-500" />
                      {t('imageAnalysis.detail.summaryText')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {analysis.summary_text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Confidence */}
              {analysis.confidence && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      {t('imageAnalysis.detail.confidence')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${analysis.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {analysis.confidence}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendation */}
              {analysis.recommendation && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      {t('imageAnalysis.detail.recommendation')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {analysis.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}


            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            {t('imageAnalysis.detail.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 