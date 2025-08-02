
import { useUserActivation } from './useUserActivation';
import { useTrialManagement } from './useTrialManagement';
import { useUserDeletion } from './useUserDeletion';
import { useTestUserManagement } from './useTestUserManagement';
import { useSubscriptionCancellation } from './useSubscriptionCancellation';

export const useUserActions = () => {
  const { activateUser, deactivateUser } = useUserActivation();
  const { setTrialPeriod } = useTrialManagement();
  const { deleteUser } = useUserDeletion();
  const { toggleTestUser } = useTestUserManagement();
  const { cancelUserSubscription } = useSubscriptionCancellation();

  return {
    activateUser,
    deactivateUser,
    setTrialPeriod,
    deleteUser,
    toggleTestUser,
    cancelUserSubscription
  };
};
