/**
 * @fileoverview Subscription Debug Panel - Shows current subscription state
 * Use this to diagnose subscription and trial issues
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const SubscriptionDebugPanel = () => {
  const {
    subscription,
    subscriptionMode,
    subscriptionTierName,
    tierLimit,
    isTrialing,
    trialEndDate
  } = useSubscriptionStatus();

  const copyToClipboard = () => {
    const debugInfo = {
      subscriptionMode,
      subscription: {
        subscribed: subscription.subscribed,
        subscription_status: subscription.subscription_status,
        subscription_tier: subscription.subscription_tier,
        tier_limit: subscription.tier_limit,
        trial_start: subscription.trial_start,
        trial_used: subscription.trial_used,
        current_period_end: subscription.current_period_end,
      },
      calculated: {
        subscriptionTierName,
        tierLimit,
        isTrialing,
        trialEndDate: trialEndDate ? new Date(trialEndDate).toISOString() : null,
      },
      timestamp: new Date().toISOString()
    };

    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    toast.success('Debug info copied to clipboard');
  };

  const hasActiveSubscription = subscription.subscribed && 
    subscription.subscription_status !== 'inactive' &&
    subscription.subscription_status !== 'expired' &&
    subscription.subscription_status !== 'trialing';

  return (
    <Card className="border-2 border-purple-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">🔍 Subscription Debug Panel</CardTitle>
            <CardDescription>Current subscription state (only visible in dev)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subscription Mode */}
        <div className="space-y-2">
          <h4 className="font-semibold">Subscription Mode:</h4>
          <Badge variant={subscriptionMode === 'premium' ? 'default' : subscriptionMode === 'trial' ? 'secondary' : 'outline'}>
            {subscriptionMode}
          </Badge>
        </div>

        {/* Database Values */}
        <div className="space-y-2">
          <h4 className="font-semibold">Database Values:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>subscribed:</div>
            <div className="font-mono">{String(subscription.subscribed)}</div>
            
            <div>subscription_status:</div>
            <div className="font-mono">{subscription.subscription_status || 'null'}</div>
            
            <div>subscription_tier:</div>
            <div className="font-mono">{subscription.subscription_tier || 'null'}</div>
            
            <div>tier_limit:</div>
            <div className="font-mono">{subscription.tier_limit || 'null'}</div>
            
            <div>trial_start:</div>
            <div className="font-mono text-xs">{subscription.trial_start || 'null'}</div>
            
            <div>trial_used:</div>
            <div className="font-mono">{String(subscription.trial_used)}</div>
          </div>
        </div>

        {/* Calculated Values */}
        <div className="space-y-2">
          <h4 className="font-semibold">Calculated Values:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>subscriptionTierName:</div>
            <div className="font-mono">{subscriptionTierName}</div>
            
            <div>tierLimit:</div>
            <div className="font-mono">{tierLimit}</div>
            
            <div>isTrialing:</div>
            <div className="font-mono">{String(isTrialing)}</div>
            
            <div>trialEndDate:</div>
            <div className="font-mono text-xs">
              {trialEndDate ? new Date(trialEndDate).toLocaleString() : 'null'}
            </div>
          </div>
        </div>

        {/* Plan Filtering Logic */}
        <div className="space-y-2">
          <h4 className="font-semibold">Plan Filtering:</h4>
          <div className="text-sm">
            <div className="mb-2">
              <span className="font-semibold">hasActiveSubscription:</span>
              <Badge variant={hasActiveSubscription ? 'default' : 'outline'} className="ml-2">
                {String(hasActiveSubscription)}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• subscribed && status !== inactive && status !== expired && status !== trialing</div>
              <div>• If TRUE → Show only upgrade plans</div>
              <div>• If FALSE → Show ALL plans (including Plan 1)</div>
            </div>
          </div>
        </div>

        {/* Trial Calculation */}
        {subscription.trial_start && (
          <div className="space-y-2">
            <h4 className="font-semibold">Trial Calculation:</h4>
            <div className="text-sm space-y-1">
              <div>trial_start: <span className="font-mono text-xs">{subscription.trial_start}</span></div>
              <div>trial_start + 7 days: <span className="font-mono text-xs">
                {new Date(new Date(subscription.trial_start).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()}
              </span></div>
              <div>Current time: <span className="font-mono text-xs">{new Date().toISOString()}</span></div>
              <div>
                Trial Status: 
                <Badge variant={isTrialing ? 'secondary' : 'outline'} className="ml-2">
                  {isTrialing ? 'ACTIVE' : 'EXPIRED'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Note */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          💡 Tip: Refresh page to see latest changes from database
        </div>
      </CardContent>
    </Card>
  );
};

