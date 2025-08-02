
import { Button } from "@/components/ui/button";

interface SubscriptionManagerHeaderProps {
  onRefresh: () => void;
}

export const SubscriptionManagerHeader = ({ onRefresh }: SubscriptionManagerHeaderProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold">Subscription Management</h2>
    </div>
  );
};
