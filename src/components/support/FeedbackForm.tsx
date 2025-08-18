
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback?: string) => void;
}

export const FeedbackForm = ({ isOpen, onClose, onSubmit }: FeedbackFormProps) => {
  const { t } = useTranslations();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, feedback.trim() || undefined);
    setRating(0);
    setFeedback('');
  };

  const handleClose = () => {
    setRating(0);
    setFeedback('');
    onClose();
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 0: return t('support.feedback.selectRating');
      case 1: return t('support.feedback.veryUnsatisfied');
      case 2: return t('support.feedback.unsatisfied');
      case 3: return t('support.feedback.ok');
      case 4: return t('support.feedback.satisfied');
      case 5: return t('support.feedback.verySatisfied');
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {t('support.feedback.title')} 🐾
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t('support.feedback.description')}
            </p>
            
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredStar || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {getRatingText(rating)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('support.feedback.additionalComments')}
            </label>
            <Textarea
              placeholder={t('support.feedback.placeholder')}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              {t('support.feedback.cancel')}
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={rating === 0}
              className="flex-1"
            >
              {t('support.feedback.sendFeedback')} ❤️
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
