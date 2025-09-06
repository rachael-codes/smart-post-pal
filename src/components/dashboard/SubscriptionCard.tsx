import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { Check, Crown, Zap } from 'lucide-react';

const plans = {
  free: {
    name: 'Free',
    price: '$0',
    features: ['5 AI generations', '10 posts per month', 'Basic analytics'],
    icon: Zap,
    color: 'default' as const,
  },
  pro: {
    name: 'Pro',
    price: '$19',
    features: ['50 AI generations', '200 posts per month', 'Advanced analytics', 'Priority support'],
    icon: Crown,
    color: 'secondary' as const,
  },
  enterprise: {
    name: 'Enterprise',
    price: '$49', 
    features: ['Unlimited AI generations', 'Unlimited posts', 'Advanced analytics', 'Priority support', 'Custom integrations'],
    icon: Crown,
    color: 'default' as const,
  },
};

export const SubscriptionCard = () => {
  const { subscription, loading, createCheckout, openCustomerPortal } = useSubscription();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([key]) => (
          <Card key={key} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Current plan: <Badge variant={plans[subscription.subscription_tier].color}>
            {plans[subscription.subscription_tier].name}
          </Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([key, plan]) => {
          const isCurrentPlan = subscription.subscription_tier === key;
          const Icon = plan.icon;
          
          return (
            <Card key={key} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
              {isCurrentPlan && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2" variant="default">
                  Current Plan
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-2xl font-bold">
                  {plan.price}<span className="text-sm font-normal">/month</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {key === 'free' ? (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Free'}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    onClick={() => {
                      if (isCurrentPlan && subscription.subscribed) {
                        openCustomerPortal();
                      } else {
                        createCheckout(key as 'pro' | 'enterprise');
                      }
                    }}
                  >
                    {isCurrentPlan && subscription.subscribed
                      ? 'Manage Subscription'
                      : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {subscription.subscribed && subscription.subscription_end && (
        <div className="text-center text-sm text-muted-foreground">
          Subscription renews on {new Date(subscription.subscription_end).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};