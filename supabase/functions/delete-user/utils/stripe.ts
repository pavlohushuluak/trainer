
import Stripe from 'https://esm.sh/stripe@14.21.0'

export const cancelStripeSubscriptions = async (userEmail: string) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!stripeKey || !userEmail) {
    console.log('No Stripe key or email provided, skipping Stripe cancellation')
    return { cancelled: false, refunded: false, refundAmount: 0 }
  }

  console.log('Attempting to cancel Stripe subscription for:', userEmail)
  
  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
    
    // Find customer by email
    const customers = await stripe.customers.list({ 
      email: userEmail, 
      limit: 1 
    })
    
    if (customers.data.length === 0) {
      console.log('No Stripe customer found for email:', userEmail)
      return { cancelled: false, refunded: false, refundAmount: 0 }
    }

    const customerId = customers.data[0].id
    console.log('Found Stripe customer:', customerId)
    
    let totalRefundAmount = 0
    let hasRefunds = false

    // Get recent invoices for potential refund (within 14 days)
    const fourteenDaysAgo = Math.floor((Date.now() - 14 * 24 * 60 * 60 * 1000) / 1000)
    const recentInvoices = await stripe.invoices.list({
      customer: customerId,
      status: 'paid',
      created: { gte: fourteenDaysAgo },
      limit: 10
    })

    // Issue refunds for recent paid invoices
    for (const invoice of recentInvoices.data) {
      if (invoice.paid && invoice.payment_intent && invoice.amount_paid > 0) {
        try {
          console.log(`Issuing refund for invoice ${invoice.id}, amount: ${invoice.amount_paid}`)
          const refund = await stripe.refunds.create({
            payment_intent: invoice.payment_intent as string,
            amount: invoice.amount_paid,
            reason: 'requested_by_customer',
            metadata: {
              refund_reason: 'user_deletion_money_back',
              user_email: userEmail,
              original_invoice: invoice.id,
            },
          })
          totalRefundAmount += refund.amount
          hasRefunds = true
          console.log(`Refund issued: ${refund.id} for amount: ${refund.amount}`)
        } catch (refundError) {
          console.error(`Failed to refund invoice ${invoice.id}:`, refundError)
        }
      }
    }

    // Cancel active subscriptions
    const activeSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10
    })

    for (const subscription of activeSubscriptions.data) {
      console.log('Cancelling subscription:', subscription.id)
      await stripe.subscriptions.cancel(subscription.id)
    }

    // Cancel trialing subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'trialing',
      limit: 10
    })

    for (const subscription of trialingSubscriptions.data) {
      console.log('Cancelling trial subscription:', subscription.id)
      await stripe.subscriptions.cancel(subscription.id)
    }

    console.log('All Stripe subscriptions cancelled for customer:', customerId)
    if (hasRefunds) {
      console.log(`Total refund amount: €${(totalRefundAmount / 100).toFixed(2)}`)
    }

    return { 
      cancelled: true, 
      refunded: hasRefunds, 
      refundAmount: totalRefundAmount 
    }
  } catch (stripeError) {
    console.error('Error cancelling Stripe subscription:', stripeError)
    return { cancelled: false, refunded: false, refundAmount: 0 }
  }
}
