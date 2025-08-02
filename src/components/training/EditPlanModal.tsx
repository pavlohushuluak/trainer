
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TrainingPlan } from './types';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlan: TrainingPlan | null;
  setEditingPlan: (plan: TrainingPlan | null) => void;
  onUpdatePlan: () => void;
  isUpdating: boolean;
}

export const EditPlanModal = ({
  isOpen,
  onClose,
  editingPlan,
  setEditingPlan,
  onUpdatePlan,
  isUpdating
}: EditPlanModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plan bearbeiten</DialogTitle>
        </DialogHeader>
        {editingPlan && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titel</label>
              <Input
                value={editingPlan.title}
                onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea
                value={editingPlan.description}
                onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={onUpdatePlan} disabled={isUpdating}>
                Speichern
              </Button>
              <Button variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
