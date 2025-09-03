import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';
import { Loader2, User, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
}

export const ProfileEditModal = ({ isOpen, onClose }: ProfileEditModalProps) => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: ''
  });

  // Load current profile data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadProfileData();
    }
  }, [isOpen, user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        toast({
          title: t('settings.profile.error.loadingTitle'),
          description: t('settings.profile.error.loadingDescription'),
          variant: 'destructive'
        });
        return;
      }

      setProfileData({
        first_name: data?.first_name || '',
        last_name: data?.last_name || '',
        email: data?.email || user.email || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: t('settings.profile.error.loadingTitle'),
        description: t('settings.profile.error.loadingDescription'),
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name.trim(),
          last_name: profileData.last_name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: t('settings.profile.error.updatingTitle'),
          description: t('settings.profile.error.updatingDescription'),
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('settings.profile.success.title'),
        description: t('settings.profile.success.description')
      });

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('settings.profile.error.updatingTitle'),
        description: t('settings.profile.error.updatingDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('settings.profile.editProfile')}
          </DialogTitle>
          <DialogDescription>
            {t('settings.profile.editDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">{t('settings.profile.firstName')}</Label>
            <Input
              id="first_name"
              value={profileData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder={t('settings.profile.firstNamePlaceholder')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">{t('settings.profile.lastName')}</Label>
            <Input
              id="last_name"
              value={profileData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder={t('settings.profile.lastNamePlaceholder')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('settings.profile.email')}
            </Label>
            <Input
              id="email"
              value={profileData.email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.profile.emailNote')}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (!profileData.first_name.trim() && !profileData.last_name.trim())}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
