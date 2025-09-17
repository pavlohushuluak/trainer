
import { useEffect } from 'react';
import type { GTMEvent, GTMPageViewEvent, GTMEcommerceEvent, GTMAuthEvent } from '@/types/gtm';
import { getStoredConsent } from '@/utils/cookieConsent';

export const useGTM = () => {
  useEffect(() => {
    // Ensure dataLayer exists (GTM is already initialized in HTML)
    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    // In development, create a mock dataLayer if GTM is disabled
    if (import.meta.env.DEV && !import.meta.env.VITE_ENABLE_GTM) {
      console.log('GTM disabled in development mode');
      return;
    }
  }, []);

  // Helper function to check if analytics consent is given
  const hasAnalyticsConsent = (): boolean => {
    const consent = getStoredConsent();
    return consent?.analytics === true;
  };

  const trackEvent = (event: GTMEvent) => {
    try {
      // Check if analytics consent is given before tracking
      if (!hasAnalyticsConsent()) {
        console.log('GTM tracking skipped - no analytics consent');
        return;
      }

      if (window.dataLayer) {
        window.dataLayer.push(event);
        console.log('GTM Event tracked:', event);
      }
    } catch (error) {
      console.warn('GTM trackEvent failed:', error);
    }
  };

  // Specific tracking functions with proper types

  const trackPaymentSuccess = (
    amount: number, 
    transactionId: string, 
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      quantity: number;
      price: number;
    }>,
    planType?: string
  ) => {
    trackEvent({
      event: 'purchase',
      transaction_id: transactionId,
      value: amount,
      currency: 'EUR',
      items: items,
      event_category: 'ecommerce',
      custom_parameter: {
        plan_type: planType || 'subscription',
        payment_method: 'stripe',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackSignUp = (method?: string) => {
    trackEvent({
      event: 'sign_up',
      method: method || 'email',
      event_category: 'auth'
    });
  };

  const trackAddToCart = (
    amount: number, 
    planType: string,
    planId: string,
    planName: string
  ) => {
    trackEvent({
      event: 'add_to_cart',
      value: amount,
      currency: 'EUR',
      items: [{
        item_id: planId,
        item_name: planName,
        category: 'subscription_plan',
        quantity: 1,
        price: amount
      }],
      event_category: 'ecommerce',
      event_label: planType,
      custom_parameter: {
        plan_type: planType,
        plan_id: planId,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackBeginCheckout = (
    amount: number,
    planType: string,
    planId: string,
    planName: string
  ) => {
    trackEvent({
      event: 'begin_checkout',
      value: amount,
      currency: 'EUR',
      items: [{
        item_id: planId,
        item_name: planName,
        category: 'subscription_plan',
        quantity: 1,
        price: amount
      }],
      event_category: 'ecommerce',
      custom_parameter: {
        plan_type: planType,
        plan_id: planId,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackViewItem = (
    planId: string,
    planName: string,
    planType: string,
    price: number
  ) => {
    trackEvent({
      event: 'view_item',
      value: price,
      currency: 'EUR',
      items: [{
        item_id: planId,
        item_name: planName,
        category: 'subscription_plan',
        quantity: 1,
        price: price
      }],
      event_category: 'ecommerce',
      custom_parameter: {
        plan_type: planType,
        plan_id: planId,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    trackEvent({
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href
    });
  };

  const trackLogin = (method?: string) => {
    trackEvent({
      event: 'login',
      method: method || 'email',
      event_category: 'auth',
      custom_parameter: {
        login_method: method || 'email',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackChatStart = (chatType?: string, petType?: string) => {
    trackEvent({
      event: 'start_chat',
      event_category: 'engagement',
      event_label: chatType || 'new_chat',
      custom_parameter: {
        chat_type: chatType || 'new_chat',
        pet_type: petType || 'none',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackChatContinue = (sessionId?: string, petType?: string) => {
    trackEvent({
      event: 'continue_chat',
      event_category: 'engagement',
      event_label: 'continue_existing',
      custom_parameter: {
        chat_type: 'continue_existing',
        session_id: sessionId || 'unknown',
        pet_type: petType || 'none',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackNewPost = (postType?: string, category?: string, petType?: string) => {
    trackEvent({
      event: 'new_post',
      event_category: 'community',
      event_label: postType || 'question',
      custom_parameter: {
        post_type: postType || 'question',
        category: category || 'unknown',
        pet_type: petType || 'none',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackDeletePost = (postId?: string, postType?: string, category?: string) => {
    trackEvent({
      event: 'delete_post',
      event_category: 'community',
      event_label: postType || 'unknown',
      custom_parameter: {
        post_id: postId || 'unknown',
        post_type: postType || 'unknown',
        category: category || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  // Support tracking functions
  const trackSupportChatStart = () => {
    trackEvent({
      event: 'support_chat_start',
      event_category: 'support',
      event_label: 'chat_initiated',
      custom_parameter: {
        support_type: 'chat',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackSupportTicketCreate = (category?: string, priority?: string) => {
    trackEvent({
      event: 'support_ticket_create',
      event_category: 'support',
      event_label: category || 'general',
      custom_parameter: {
        ticket_category: category || 'general',
        ticket_priority: priority || 'medium',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackSupportMessage = (messageType: 'user' | 'ai' | 'admin', ticketId?: string) => {
    trackEvent({
      event: 'support_message',
      event_category: 'support',
      event_label: messageType,
      custom_parameter: {
        message_type: messageType,
        ticket_id: ticketId || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackSupportFeedback = (rating: number, ticketId?: string, feedbackText?: string) => {
    trackEvent({
      event: 'support_feedback',
      event_category: 'support',
      event_label: `rating_${rating}`,
      custom_parameter: {
        satisfaction_rating: rating,
        ticket_id: ticketId || 'unknown',
        has_feedback_text: !!feedbackText,
        feedback_length: feedbackText?.length || 0,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackSupportTicketResolve = (ticketId?: string, resolvedBy?: string, rating?: number) => {
    trackEvent({
      event: 'support_ticket_resolve',
      event_category: 'support',
      event_label: resolvedBy || 'unknown',
      custom_parameter: {
        ticket_id: ticketId || 'unknown',
        resolved_by: resolvedBy || 'unknown',
        satisfaction_rating: rating || 0,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackSupportFAQClick = () => {
    trackEvent({
      event: 'support_faq_click',
      event_category: 'support',
      event_label: 'faq_navigation',
      custom_parameter: {
        support_type: 'faq',
        timestamp: new Date().toISOString()
      }
    });
  };

  // Training plan creation tracking functions
  const trackPlanCreatedByChat = (planTitle?: string, petType?: string, planReason?: string) => {
    trackEvent({
      event: 'plan_created_by_chat',
      event_category: 'training',
      event_label: 'chat_generated',
      custom_parameter: {
        plan_title: planTitle || 'unknown',
        pet_type: petType || 'none',
        plan_reason: planReason?.substring(0, 100) || 'unknown', // Limit length
        creation_method: 'chat',
        is_ai_generated: true,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackPlanCreatedByImage = (planTitle?: string, petType?: string, imageAnalysisType?: string) => {
    trackEvent({
      event: 'plan_created_by_image',
      event_category: 'training',
      event_label: 'image_generated',
      custom_parameter: {
        plan_title: planTitle || 'unknown',
        pet_type: petType || 'none',
        image_analysis_type: imageAnalysisType || 'unknown',
        creation_method: 'image_analysis',
        is_ai_generated: true,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackPlanCreatedByManual = (planTitle?: string, petType?: string, planDescription?: string) => {
    trackEvent({
      event: 'plan_created_by_manual',
      event_category: 'training',
      event_label: 'manual_created',
      custom_parameter: {
        plan_title: planTitle || 'unknown',
        pet_type: petType || 'none',
        plan_description: planDescription?.substring(0, 100) || 'unknown', // Limit length
        creation_method: 'manual',
        is_ai_generated: false,
        timestamp: new Date().toISOString()
      }
    });
  };

  // Pet profile tracking functions
  const trackAddPetProfile = (petType?: string, petName?: string) => {
    trackEvent({
      event: 'add_pet_profile',
      event_category: 'pet_management',
      event_label: petType || 'unknown',
      custom_parameter: {
        pet_type: petType || 'unknown',
        pet_name: petName || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackEditPetProfile = (petType?: string, petName?: string, editedFields?: string[]) => {
    trackEvent({
      event: 'edit_pet_profile',
      event_category: 'pet_management',
      event_label: petType || 'unknown',
      custom_parameter: {
        pet_type: petType || 'unknown',
        pet_name: petName || 'unknown',
        edited_fields: editedFields?.join(',') || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackDeletePetProfile = (petType?: string, petName?: string) => {
    trackEvent({
      event: 'delete_pet_profile',
      event_category: 'pet_management',
      event_label: petType || 'unknown',
      custom_parameter: {
        pet_type: petType || 'unknown',
        pet_name: petName || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  // Image analysis tracking functions
  const trackImageAnalysisStart = (petType?: string, analysisType?: string) => {
    trackEvent({
      event: 'image_analysis_start',
      event_category: 'image_analysis',
      event_label: analysisType || 'general',
      custom_parameter: {
        pet_type: petType || 'unknown',
        analysis_type: analysisType || 'general',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackImageAnalysisComplete = (petType?: string, analysisType?: string, confidence?: string) => {
    trackEvent({
      event: 'image_analysis_complete',
      event_category: 'image_analysis',
      event_label: analysisType || 'general',
      custom_parameter: {
        pet_type: petType || 'unknown',
        analysis_type: analysisType || 'general',
        confidence_level: confidence || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackImageAnalysisError = (petType?: string, errorType?: string) => {
    trackEvent({
      event: 'image_analysis_error',
      event_category: 'image_analysis',
      event_label: errorType || 'unknown',
      custom_parameter: {
        pet_type: petType || 'unknown',
        error_type: errorType || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  // Training plan completion tracking
  const trackPlanCompleted = (planId?: string, planTitle?: string, petType?: string, completionTime?: number) => {
    trackEvent({
      event: 'plan_completed',
      event_category: 'training',
      event_label: 'plan_finished',
      custom_parameter: {
        plan_id: planId || 'unknown',
        plan_title: planTitle || 'unknown',
        pet_type: petType || 'unknown',
        completion_time_days: completionTime || 0,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackPlanStarted = (planId?: string, planTitle?: string, petType?: string) => {
    trackEvent({
      event: 'plan_started',
      event_category: 'training',
      event_label: 'plan_activated',
      custom_parameter: {
        plan_id: planId || 'unknown',
        plan_title: planTitle || 'unknown',
        pet_type: petType || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackPlanDeleted = (planId?: string, planTitle?: string, petType?: string) => {
    trackEvent({
      event: 'plan_deleted',
      event_category: 'training',
      event_label: 'plan_removed',
      custom_parameter: {
        plan_id: planId || 'unknown',
        plan_title: planTitle || 'unknown',
        pet_type: petType || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  // Settings tracking functions
  const trackEditProfile = (fieldsChanged?: string[]) => {
    trackEvent({
      event: 'edit_profile',
      event_category: 'settings',
      event_label: 'profile_updated',
      custom_parameter: {
        fields_changed: fieldsChanged?.join(',') || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackChangeLanguage = (fromLanguage?: string, toLanguage?: string) => {
    trackEvent({
      event: 'change_language',
      event_category: 'settings',
      event_label: toLanguage || 'unknown',
      custom_parameter: {
        from_language: fromLanguage || 'unknown',
        to_language: toLanguage || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackChangePassword = (method?: 'current_password' | 'email_verification') => {
    trackEvent({
      event: 'change_password',
      event_category: 'settings',
      event_label: method || 'unknown',
      custom_parameter: {
        change_method: method || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackChangeDark = (fromTheme?: string, toTheme?: string) => {
    trackEvent({
      event: 'change_dark',
      event_category: 'settings',
      event_label: toTheme || 'unknown',
      custom_parameter: {
        from_theme: fromTheme || 'unknown',
        to_theme: toTheme || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackChatMessage = (messageType: 'user' | 'assistant', messageLength?: number) => {
    trackEvent({
      event: 'chat_message',
      event_category: 'engagement',
      event_label: messageType,
      custom_parameter: {
        message_type: messageType,
        message_length: messageLength || 0,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackSubscriptionUpgrade = (
    fromPlan: string, 
    toPlan: string, 
    amount: number, 
    billingCycle?: 'monthly' | 'halfyearly'
  ) => {
    // Auto-detect billing cycle if not provided
    let detectedBillingCycle: 'monthly' | 'halfyearly';
    
    if (billingCycle) {
      detectedBillingCycle = billingCycle;
    } else {
      // Auto-detect based on plan name or amount
      const planName = toPlan.toLowerCase();
      if (planName.includes('monthly') || planName.includes('month')) {
        detectedBillingCycle = 'monthly';
      } else if (planName.includes('halfyearly') || planName.includes('half') || planName.includes('year')) {
        detectedBillingCycle = 'halfyearly';
      } else {
        // Fallback: determine by amount (assuming monthly < 5000 cents, halfyearly >= 5000 cents)
        detectedBillingCycle = amount < 5000 ? 'monthly' : 'halfyearly';
      }
    }
    
    // Determine the specific upgrade event based on billing cycle
    const upgradeEvent = detectedBillingCycle === 'monthly' ? 'subscription_upgrade_monthly' : 'subscription_upgrade_halfyearly';
    
    trackEvent({
      event: upgradeEvent,
      event_category: 'ecommerce',
      value: amount,
      currency: 'EUR',
      custom_parameter: {
        from_plan: fromPlan,
        to_plan: toPlan,
        upgrade_amount: amount,
        billing_cycle: detectedBillingCycle,
        timestamp: new Date().toISOString()
      }
    });
    
    // Also track the general upgrade event for backward compatibility
    trackEvent({
      event: 'subscription_upgrade',
      event_category: 'ecommerce',
      value: amount,
      currency: 'EUR',
      custom_parameter: {
        from_plan: fromPlan,
        to_plan: toPlan,
        upgrade_amount: amount,
        billing_cycle: detectedBillingCycle,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackFeatureUsage = (featureName: string, featureCategory: string) => {
    trackEvent({
      event: 'feature_usage',
      event_category: 'engagement',
      event_label: featureName,
      custom_parameter: {
        feature_name: featureName,
        feature_category: featureCategory,
        timestamp: new Date().toISOString()
      }
    });
  };

  return {
    trackEvent,
    trackChatStart,
    trackChatContinue,
    trackChatMessage,
    trackNewPost,
    trackDeletePost,
    trackSupportChatStart,
    trackSupportTicketCreate,
    trackSupportMessage,
    trackSupportFeedback,
    trackSupportTicketResolve,
    trackSupportFAQClick,
    trackPlanCreatedByChat,
    trackPlanCreatedByImage,
    trackPlanCreatedByManual,
    trackAddPetProfile,
    trackEditPetProfile,
    trackDeletePetProfile,
    trackImageAnalysisStart,
    trackImageAnalysisComplete,
    trackImageAnalysisError,
    trackPlanCompleted,
    trackPlanStarted,
    trackPlanDeleted,
    trackEditProfile,
    trackChangeLanguage,
    trackChangePassword,
    trackChangeDark,
    trackPaymentSuccess,
    trackPurchaseCancel,
    trackSignUp,
    trackAddToCart,
    trackBeginCheckout,
    trackViewItem,
    trackPageView,
    trackLogin,
    trackSubscriptionUpgrade,
    trackFeatureUsage,
  };
};
