import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ConfirmEmailChangePage = () => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  const newEmail = searchParams.get('newEmail');

  useEffect(() => {
    if (!token || !userId || !newEmail) {
      setError('Invalid confirmation link. Please try again.');
      setIsLoading(false);
      return;
    }

    confirmEmailChange();
  }, [token, userId, newEmail]);

  const confirmEmailChange = async () => {
    try {
      // Call our edge function to confirm the email change
      const { error: confirmError } = await supabase.functions.invoke('confirm-email-change', {
        body: {
          token: token,
          userId: userId,
          newEmail: newEmail
        }
      });

      if (confirmError) {
        console.error('Email change confirmation error:', confirmError);
        setError('Failed to confirm email change. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success - email has been updated in both Auth and profiles table
      setIsSuccess(true);
      setIsLoading(false);

      // Refresh the auth user data to get the updated email
      try {
        const { data: { user: updatedUser }, error: refreshError } = await supabase.auth.getUser();
        if (refreshError) {
          console.warn('Could not refresh auth user data:', refreshError);
        } else if (updatedUser) {
          console.log('Auth user data refreshed:', updatedUser.email);
        }
      } catch (refreshError) {
        console.warn('Error refreshing auth user data:', refreshError);
      }

      // Show success message
      toast({
        title: 'Email Updated Successfully',
        description: `Your email has been updated to ${newEmail}. You will now receive all communications at this address.`,
        variant: 'default'
      });

      // Redirect to settings page after a delay
      setTimeout(() => {
        navigate('/settings', { replace: true });
      }, 3000);

    } catch (error) {
      console.error('Error confirming email change:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Confirming email change...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Email Change Failed</CardTitle>
            <CardDescription className="text-gray-600">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/settings')} 
              className="w-full"
            >
              Go to Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Email Updated Successfully!</CardTitle>
            <CardDescription className="text-gray-600">
              Your email address has been updated to <strong>{newEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  You will now receive all future communications at this address.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/settings')} 
              className="w-full"
            >
              Go to Settings
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Redirecting to settings page in a few seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
