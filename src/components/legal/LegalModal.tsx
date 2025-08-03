
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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
    // Navigate back to previous page or to home page
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Handle escape key and auto-open functionality
  useEffect(() => {
    if (autoOpen && isOpen) {
      // Focus management for accessibility
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [autoOpen, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden"
        aria-labelledby="legal-modal-title"
        aria-describedby={subtitle ? "legal-modal-subtitle" : undefined}
      >
        {/* Fixed Header */}
        <DialogHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle 
                id="legal-modal-title"
                className="text-2xl font-bold text-left"
              >
                {title}
              </DialogTitle>
              {subtitle && (
                <p 
                  id="legal-modal-subtitle"
                  className="text-muted-foreground mt-1"
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1 max-h-[calc(90vh-120px)]">
          <div className="px-6 py-6">
            {children}
          </div>
        </ScrollArea>
        
        {/* Fixed Footer with Close Button */}
        <div className="px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex justify-end">
            <Button 
              onClick={handleClose} 
              variant="outline"
              aria-label={t('legal.close')}
            >
              {t('legal.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
