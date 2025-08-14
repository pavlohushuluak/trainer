import { useState } from 'react';
import { useImageAnalysisHistory } from '@/hooks/useImageAnalysisHistory';
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
  History, 
  Camera, 
  Calendar, 
  User, 
  Trash2, 
  Loader2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnalysisDetailModal } from './AnalysisDetailModal';

interface ImageAnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAnalysis?: (analysis: any) => void;
}

export const ImageAnalysisHistoryModal = ({ 
  isOpen, 
  onClose, 
  onViewAnalysis 
}: ImageAnalysisHistoryModalProps) => {
  const { t } = useTranslations();
  const { i18n } = useTranslation();
  const { 
    history, 
    isLoading, 
    error, 
    deleteAnalysis, 
    isDeleting 
  } = useImageAnalysisHistory();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleDelete = async (analysisId: string) => {
    setDeletingId(analysisId);
    try {
      await deleteAnalysis(analysisId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewAnalysis = (analysis: any, petInfo: any, analysisDate: string) => {
    setSelectedAnalysis(analysis);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      i18n.language === 'de' ? 'de-DE' : 'en-US',
      { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  const getMoodBadge = (analysis: any) => {
    const mood = analysis.mood_estimation?.toLowerCase() || '';
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      'entspannt': 'default',
      'aufmerksam': 'secondary',
      'angespannt': 'outline',
      'verspielt': 'default',
      'ängstlich': 'destructive'
    };
    
    return variants[mood] || 'secondary';
  };

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t('imageAnalysis.history.title')}
            </DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('imageAnalysis.history.error.loading')}
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('imageAnalysis.history.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{t('imageAnalysis.history.loading')}</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {t('imageAnalysis.history.empty.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('imageAnalysis.history.empty.description')}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {history.map((analysis) => (
                  <Card key={analysis.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Camera className="h-4 w-4 text-primary" />
                            {analysis.pet_profiles?.name || t('imageAnalysis.history.unknownPet')}
                            {analysis.pet_profiles?.species && (
                              <span className="text-sm text-muted-foreground">
                                ({analysis.pet_profiles.species})
                              </span>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getMoodBadge(analysis.analysis_result)}>
                              {analysis.analysis_result.mood_estimation || t('imageAnalysis.history.unknownMood')}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(analysis.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAnalysis(
                              analysis.analysis_result, 
                              analysis.pet_profiles, 
                              analysis.created_at
                            )}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(analysis.id)}
                            disabled={isDeleting && deletingId === analysis.id}
                          >
                            {isDeleting && deletingId === analysis.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {analysis.analysis_result.recommendation || 
                         analysis.analysis_result.analysis || 
                         t('imageAnalysis.history.noDescription')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>

      {/* Analysis Detail Modal */}
      <AnalysisDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAnalysis(null);
        }}
        analysis={selectedAnalysis}
        petInfo={selectedAnalysis ? history.find(h => h.analysis_result === selectedAnalysis)?.pet_profiles : null}
        analysisDate={selectedAnalysis ? history.find(h => h.analysis_result === selectedAnalysis)?.created_at : undefined}
      />
    </Dialog>
  );
}; 