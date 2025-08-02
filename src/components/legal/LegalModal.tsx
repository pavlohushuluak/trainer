
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  autoOpen?: boolean;
}

export const LegalModal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children,
  autoOpen = false 
}: LegalModalProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
    // Navigiere zurück zur vorherigen Seite oder zur Hauptseite
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Debug-Logs hinzufügen
  useEffect(() => {
  }, [autoOpen, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-left">{title}</DialogTitle>
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t('legal.close')}</span>
            </Button>
          </div>
        </DialogHeader>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1 max-h-[calc(90vh-120px)]">
          <div className="px-6 py-6">
            {children}
          </div>
        </ScrollArea>
        
        {/* Fixed Footer mit Schließen-Button */}
        <div className="px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex justify-end">
            <Button onClick={handleClose} variant="outline">
              {t('legal.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
