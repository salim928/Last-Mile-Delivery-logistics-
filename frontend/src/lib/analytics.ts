/**
 * Analytics tracking with PostHog
 * Tracks user signups, conversions, feature usage, and churn
 */
import posthog from 'posthog-js';

// Initialize PostHog (only in browser)
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_YOUR_KEY_HERE', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
    capture_pageview: true, // Auto-capture page views
    autocapture: true, // Auto-capture clicks, form submits, etc.
  });
}

export const analytics = {
  // Track user signup
  trackSignup: (userId: string, email: string, businessName: string, plan: string = 'trial') => {
    posthog.identify(userId, {
      email,
      business_name: businessName,
      subscription_plan: plan,
      signup_date: new Date().toISOString(),
    });
    
    posthog.capture('user_signed_up', {
      email,
      business_name: businessName,
      plan,
    });
  },

  // Track user login
  trackLogin: (userId: string, email: string) => {
    posthog.identify(userId, { email });
    posthog.capture('user_logged_in', { email });
  },

  // Track trial started
  trackTrialStarted: (userId: string, trialEndsAt: string) => {
    posthog.capture('trial_started', {
      user_id: userId,
      trial_ends_at: trialEndsAt,
    });
  },

  // Track trial to paid conversion
  trackTrialToPaid: (userId: string, plan: string, amount: number) => {
    posthog.capture('trial_converted_to_paid', {
      user_id: userId,
      plan,
      amount,
      currency: 'GHS',
    });
    
    // Update user properties
    posthog.setPersonProperties({
      subscription_plan: plan,
      is_paying_customer: true,
      conversion_date: new Date().toISOString(),
    });
  },

  // Track subscription cancelled (churn)
  trackSubscriptionCancelled: (userId: string, reason?: string) => {
    posthog.capture('subscription_cancelled', {
      user_id: userId,
      cancellation_reason: reason,
      churned_at: new Date().toISOString(),
    });
    
    posthog.setPersonProperties({
      is_paying_customer: false,
      churn_date: new Date().toISOString(),
    });
  },

  // Track feature usage
  trackFeatureUsed: (feature: string, metadata?: Record<string, any>) => {
    posthog.capture(`feature_used_${feature}`, metadata);
  },

  // Track order created
  trackOrderCreated: (orderId: string, codAmount?: number) => {
    posthog.capture('order_created', {
      order_id: orderId,
      cod_amount: codAmount,
    });
  },

  // Track route optimized
  trackRouteOptimized: (routeId: string, orderCount: number, distanceKm: number) => {
    posthog.capture('route_optimized', {
      route_id: routeId,
      order_count: orderCount,
      distance_km: distanceKm,
    });
  },

  // Track rider added
  trackRiderAdded: (riderId: string, vehicleType: string) => {
    posthog.capture('rider_added', {
      rider_id: riderId,
      vehicle_type: vehicleType,
    });
  },

  // Track CSV import
  trackCSVImport: (orderCount: number) => {
    posthog.capture('csv_imported', {
      order_count: orderCount,
    });
  },

  // Track activation (user completes key actions)
  trackActivation: (userId: string) => {
    posthog.capture('user_activated', {
      user_id: userId,
      activated_at: new Date().toISOString(),
    });
    
    posthog.setPersonProperties({
      is_activated: true,
    });
  },

  // Track page view manually
  trackPageView: (pageName: string) => {
    posthog.capture('$pageview', {
      page: pageName,
    });
  },

  // Reset on logout
  reset: () => {
    posthog.reset();
  },
};

export default analytics;
