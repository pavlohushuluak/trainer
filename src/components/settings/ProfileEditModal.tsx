import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';
import { Loader2, User, Mail, Eye, EyeOff } from 'lucide-react';
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

interface EmailChangeData {
  currentPassword: string;
  newEmail: string;
}

export const ProfileEditModal = ({ isOpen, onClose }: ProfileEditModalProps) => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailChangeLoading, setIsEmailChangeLoading] = useState(false);
  const [isEmailChangeOpen, setIsEmailChangeOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [hasPendingEmailChange, setHasPendingEmailChange] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [emailChangeData, setEmailChangeData] = useState<EmailChangeData>({
    currentPassword: '',
    newEmail: ''
  });

  // Load current profile data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadProfileData();
      checkPendingEmailChange();
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

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate that new email is different from current email
    if (emailChangeData.newEmail.toLowerCase() === user.email?.toLowerCase()) {
      toast({
        title: t('settings.profile.error.sameEmailTitle'),
        description: t('settings.profile.error.sameEmailDescription'),
        variant: 'destructive'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailChangeData.newEmail)) {
      toast({
        title: t('settings.profile.error.invalidEmailTitle'),
        description: t('settings.profile.error.invalidEmailDescription'),
        variant: 'destructive'
      });
      return;
    }

    setIsEmailChangeLoading(true);

    try {
      // First, verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: emailChangeData.currentPassword
      });

      if (signInError) {
        toast({
          title: t('settings.profile.error.currentPasswordTitle'),
          description: t('settings.profile.error.currentPasswordDescription'),
          variant: 'destructive'
        });
        return;
      }

      // Note: Supabase will automatically check if the email is already registered
      // and return an appropriate error if it is

      // Generate a unique confirmation token
      const confirmationToken = crypto.randomUUID();
      
      // Store the token in the profiles table
      const { error: tokenError } = await supabase
        .from('profiles')
        .update({
          email_change_token: confirmationToken,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (tokenError) {
        console.error('Token storage error:', tokenError);
        toast({
          title: t('settings.profile.error.profileUpdateTitle'),
          description: t('settings.profile.error.profileUpdateDescription'),
          variant: 'destructive'
        });
        return;
      }

      // Send confirmation email to the new email address using our custom function
      console.log('Requesting email change to:', emailChangeData.newEmail);
      const { error: emailError } = await supabase.functions.invoke('send-email-change-confirmation', {
        body: {
          userId: user.id,
          currentEmail: user.email,
          newEmail: emailChangeData.newEmail,
          userName: profileData.first_name || profileData.last_name || 'Pet Friend',
          language: 'de', // TODO: Get from user preferences
          confirmationToken: confirmationToken
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        toast({
          title: t('settings.profile.error.emailSendTitle'),
          description: t('settings.profile.error.emailSendDescription'),
          variant: 'destructive'
        });
        return;
      }

      // Success - email update request sent
      toast({
        title: t('settings.profile.success.emailUpdateRequestTitle'),
        description: t('settings.profile.success.emailUpdateRequestDescription'),
        variant: 'default'
      });

      // Close the email change modal
      handleEmailModalClose();
      
      // Refresh the pending email change status
      await checkPendingEmailChange();
      
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: t('settings.profile.error.emailUpdateTitle'),
        description: t('settings.profile.error.emailUpdateDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsEmailChangeLoading(false);
    }
  };

  const handleEmailInputChange = (field: keyof EmailChangeData, value: string) => {
    setEmailChangeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailModalClose = () => {
    setIsEmailChangeOpen(false);
    setEmailChangeData({
      currentPassword: '',
      newEmail: ''
    });
    setShowCurrentPassword(false);
  };

  // Check if user has a pending email change
  const checkPendingEmailChange = async () => {
    if (!user) return;

    try {
      // Check if the user has a pending email change by looking at the auth user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // If email_confirmed_at is null and the email is different from the original,
      // it means there's a pending email change
      if (currentUser?.email_confirmed_at === null && currentUser?.email !== user.email) {
        setHasPendingEmailChange(true);
      } else {
        setHasPendingEmailChange(false);
      }
    } catch (error) {
      console.error('Error checking pending email change:', error);
    }
  };

  // Cancel pending email change
  const cancelPendingEmailChange = async () => {
    if (!user) return;

    try {
      // Revert to the original email
      const { error } = await supabase.auth.updateUser({
        email: user.email
      });

      if (error) {
        toast({
          title: t('settings.profile.error.cancelEmailChangeTitle'),
          description: t('settings.profile.error.cancelEmailChangeDescription'),
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('settings.profile.success.emailChangeCancelledTitle'),
        description: t('settings.profile.success.emailChangeCancelledDescription')
      });

      // Refresh the status
      await checkPendingEmailChange();
      await loadProfileData();
    } catch (error) {
      console.error('Error canceling email change:', error);
      toast({
        title: t('settings.profile.error.cancelEmailChangeTitle'),
        description: t('settings.profile.error.cancelEmailChangeDescription'),
        variant: 'destructive'
      });
    }
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
                    <div className="flex items-center gap-2">
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="bg-muted cursor-not-allowed flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEmailChangeOpen(true)}
                        disabled={isLoading || hasPendingEmailChange}
                        className="whitespace-nowrap"
                      >
                        {hasPendingEmailChange ? t('settings.profile.pendingEmailChange') : t('settings.profile.changeEmail')}
                      </Button>
                    </div>
                    {hasPendingEmailChange ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <p className="text-xs text-yellow-800">
                          <strong>{t('settings.profile.pendingEmailChangeTitle')}</strong><br/>
                          {t('settings.profile.pendingEmailChangeDescription')}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={checkPendingEmailChange}
                          className="mt-2 text-xs h-6 px-2"
                        >
                          {t('settings.profile.refreshStatus')}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={cancelPendingEmailChange}
                          className="mt-2 text-xs h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {t('settings.profile.cancelEmailChange')}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {t('settings.profile.emailNote')}
                      </p>
                    )}
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

      {/* Email Change Modal */}
      <Dialog open={isEmailChangeOpen} onOpenChange={handleEmailModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('settings.profile.changeEmail')}
            </DialogTitle>
            <DialogDescription>
              {t('settings.profile.changeEmailDescription')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentEmail">{t('settings.profile.currentEmail')}</Label>
              <Input
                id="currentEmail"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t('settings.profile.currentPassword')}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={emailChangeData.currentPassword}
                  onChange={(e) => handleEmailInputChange('currentPassword', e.target.value)}
                  placeholder={t('settings.profile.currentPasswordPlaceholder')}
                  disabled={isEmailChangeLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isEmailChangeLoading}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail">{t('settings.profile.newEmail')}</Label>
              <Input
                id="newEmail"
                type="email"
                value={emailChangeData.newEmail}
                onChange={(e) => handleEmailInputChange('newEmail', e.target.value)}
                placeholder={t('settings.profile.newEmailPlaceholder')}
                disabled={isEmailChangeLoading}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>{t('settings.profile.emailChangeNote')}</strong><br/>
                {t('settings.profile.emailChangeDescription')}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleEmailModalClose}
                disabled={isEmailChangeLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isEmailChangeLoading || !emailChangeData.currentPassword || !emailChangeData.newEmail}
                className="min-w-[100px]"
              >
                {isEmailChangeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('settings.profile.sending')}
                  </>
                ) : (
                  t('settings.profile.sendEmailChange')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
