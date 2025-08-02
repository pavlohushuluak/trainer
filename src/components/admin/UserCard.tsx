
import { Card, CardContent } from '@/components/ui/card';
import { UserWithDetails } from './types';
import { UserCardHeader } from './UserCardHeader';
import { UserSubscriptionInfo } from './UserSubscriptionInfo';
import { UserCardActions } from './UserCardActions';

interface UserCardProps {
  user: UserWithDetails;
  onActivate: (userId: string) => void;
  onDeactivate: (userId: string) => void;
  onSetTrial: (userId: string, trialDays: string) => void;
  onToggleTestUser: (userId: string, isTestUser: boolean) => void;
  onDelete: (userId: string) => void;
  onCancelSubscription: (userId: string, immediateRefund: boolean) => void;
  onShowDetails: (user: UserWithDetails) => void;
  isActivating: boolean;
  isDeactivating: boolean;
  isSettingTrial: boolean;
  isTogglingTestUser: boolean;
  isDeleting: boolean;
  isCancelling: boolean;
}

export const UserCard = ({
  user,
  onActivate,
  onDeactivate,
  onSetTrial,
  onToggleTestUser,
  onDelete,
  onCancelSubscription,
  onShowDetails,
  isActivating,
  isDeactivating,
  isSettingTrial,
  isTogglingTestUser,
  isDeleting,
  isCancelling
}: UserCardProps) => {
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      user.subscription?.is_test_user ? 'border-purple-200 bg-purple-50' : ''
    }`}>
      <UserCardHeader user={user} />
      
      <CardContent className="pt-4">
        <UserSubscriptionInfo user={user} />
        
        <UserCardActions
          user={user}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onSetTrial={onSetTrial}
          onToggleTestUser={onToggleTestUser}
          onDelete={onDelete}
          onCancelSubscription={onCancelSubscription}
          onShowDetails={onShowDetails}
          isActivating={isActivating}
          isDeactivating={isDeactivating}
          isSettingTrial={isSettingTrial}
          isTogglingTestUser={isTogglingTestUser}
          isDeleting={isDeleting}
          isCancelling={isCancelling}
        />
      </CardContent>
    </Card>
  );
};
