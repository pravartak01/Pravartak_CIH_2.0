
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionPlansProps {
  currentUserRole: string;
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Essential security monitoring for small teams',
    price: 'Free',
    features: [
      '5 system monitoring',
      'Daily vulnerability checks',
      'Basic email alerts',
      'Standard dashboard',
      '24-hour data refresh'
    ],
    limitations: [
      'No real-time alerts',
      'Limited OEM sources',
      'No AI risk analysis',
      'No SMS alerts'
    ],
    badge: null,
    action: 'Current Plan',
    userRole: 'user'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced monitoring for security teams',
    price: '$29.99/month',
    features: [
      'Unlimited system monitoring',
      'Hourly vulnerability checks',
      'Priority email alerts',
      'Enhanced dashboard',
      'AI-powered risk analysis',
      'SMS notifications',
      '20 OEM sources'
    ],
    limitations: [
      'Limited API access',
      'Standard support'
    ],
    badge: 'Popular',
    action: 'Upgrade',
    userRole: 'professional'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for organizations',
    price: '$99.99/month',
    features: [
      'Everything in Professional',
      'Real-time vulnerability monitoring',
      'Unlimited OEM sources',
      'Full API access',
      'Custom integrations',
      'Advanced AI risk analysis',
      'Dedicated customer success manager',
      'Priority 24/7 support',
      'On-premise deployment option'
    ],
    limitations: [],
    badge: 'Complete',
    action: 'Contact Sales',
    userRole: 'admin'
  }
];

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ currentUserRole }) => {
  const handleSubscription = (plan: string) => {
    // In a real app, this would redirect to a payment gateway
    // or contact sales form depending on the plan
    toast.success(`You'll be redirected to subscribe to the ${plan} plan`);
  };
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">Subscription Plans</h3>
      <p className="text-gray-500 mb-6">
        Choose the plan that fits your security monitoring needs
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`border rounded-lg overflow-hidden ${
              plan.userRole === currentUserRole ? 'ring-2 ring-primary' : ''
            }`}
          >
            {plan.badge && (
              <div className="bg-primary text-white text-xs font-semibold px-3 py-1 text-center">
                {plan.badge}
              </div>
            )}
            
            <div className="p-6">
              <h4 className="text-xl font-semibold mb-1">{plan.name}</h4>
              <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
              
              <div className="flex items-end mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.price !== 'Free' && (
                  <span className="text-gray-500 ml-1 mb-1">/month</span>
                )}
              </div>
              
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.limitations.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">Limitations:</p>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button 
                className="w-full"
                variant={plan.userRole === currentUserRole ? "secondary" : "default"}
                disabled={plan.userRole === currentUserRole}
                onClick={() => handleSubscription(plan.name)}
              >
                {plan.userRole === currentUserRole ? (
                  'Current Plan'
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {plan.action}
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SubscriptionPlans;
