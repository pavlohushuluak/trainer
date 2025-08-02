
export const createSessionConfig = (
  customerId: string,
  selectedPrice: any,
  priceType: string,
  userId: string,
  userEmail: string,
  hasUsedTrial: boolean,
  successUrl: string,
  cancelUrl: string,
  origin: string
) => {
  const shouldApplyTrial = selectedPrice.trialDays > 0 && !hasUsedTrial;
  
  // Session config debug info

  const sessionConfig: any = {
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: selectedPrice.name,
            description: selectedPrice.description || undefined,
          },
          unit_amount: selectedPrice.amount,
          recurring: {
            interval: selectedPrice.interval,
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    locale: "de",
    allow_promotion_codes: true,
    payment_method_types: ["card", "paypal"],
    success_url: successUrl || `${origin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${origin}/?canceled=true`,
    metadata: {
      user_id: userId,
      email: userEmail,
      price_type: priceType,
      trial_applied: shouldApplyTrial.toString()
    },
    custom_text: {
      submit: {
        message: "Ihre Zahlung wird sicher über Stripe verarbeitet. PayPal und Kreditkarten werden akzeptiert. Nach erfolgreicher Zahlung erhalten Sie sofortigen Zugang zu allen Premium-Funktionen."
      }
    }
  };

  // Trial-Periode nur hinzufügen wenn berechtigt
  if (shouldApplyTrial) {
    sessionConfig.subscription_data = {
      trial_period_days: selectedPrice.trialDays,
      metadata: {
        trial_applied: "true",
        user_id: userId,
        email: userEmail
      }
    };
  }

  // Final Stripe session config created

  return sessionConfig;
};

export const createFallbackSessionConfig = (
  customerId: string,
  selectedPrice: any,
  priceType: string,
  userId: string,
  userEmail: string,
  hasUsedTrial: boolean,
  successUrl: string,
  cancelUrl: string,
  origin: string
) => {
  const shouldApplyTrial = selectedPrice.trialDays > 0 && !hasUsedTrial;
  
  const sessionConfig: any = {
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: selectedPrice.name,
          },
          unit_amount: selectedPrice.amount,
          recurring: {
            interval: selectedPrice.interval,
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    payment_method_types: ["card"],
    success_url: successUrl || `${origin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${origin}/?canceled=true`,
    metadata: {
      user_id: userId,
      email: userEmail,
      price_type: priceType,
      trial_applied: shouldApplyTrial.toString(),
      fallback_config: "true"
    }
  };

  // Trial-Periode nur hinzufügen wenn berechtigt
  if (shouldApplyTrial) {
    sessionConfig.subscription_data = {
      trial_period_days: selectedPrice.trialDays,
      metadata: {
        trial_applied: "true",
        user_id: userId,
        email: userEmail
      }
    };
  }

  return sessionConfig;
};
