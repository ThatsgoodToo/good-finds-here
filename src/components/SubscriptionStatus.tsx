import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Subscription {
  type: string;
  status: string;
  endDate: string;
  daysRemaining: number;
  promoCode?: string;
}

export const SubscriptionStatus = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      if (data.hasSubscription) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!subscription) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Expired subscription
  if (subscription.status === 'expired') {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Subscription Expired</AlertTitle>
        <AlertDescription className="mt-2">
          <p>Your subscription expired on {formatDate(subscription.endDate)}.</p>
          <Button size="sm" className="mt-3" onClick={() => navigate('/auth')}>
            Reactivate Subscription
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Expiring soon warning
  if (subscription.status === 'expiring_soon') {
    return (
      <Alert variant="default" className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">
          Subscription Expiring Soon
        </AlertTitle>
        <AlertDescription className="mt-2 text-amber-800 dark:text-amber-200">
          <p>
            Your {subscription.type === 'trial' ? 'trial' : 'subscription'} expires in{' '}
            <strong>{subscription.daysRemaining} day{subscription.daysRemaining !== 1 ? 's' : ''}</strong>{' '}
            on {formatDate(subscription.endDate)}.
          </p>
          <Button 
            size="sm" 
            className="mt-3 bg-amber-600 hover:bg-amber-700" 
            onClick={() => navigate('/auth')}
          >
            Add Payment Method
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Active subscription status badge
  if (subscription.type === 'trial') {
    return (
      <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Free Trial Active</h3>
              <Badge variant="secondary">{subscription.daysRemaining} days remaining</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Expires {formatDate(subscription.endDate)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (subscription.type === 'founding_member') {
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-accent-foreground" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Founding Member</h3>
              <Badge variant="outline" className="bg-accent/20">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Access until {formatDate(subscription.endDate)} ({subscription.daysRemaining} days remaining)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SubscriptionStatus;