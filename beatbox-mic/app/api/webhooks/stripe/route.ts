/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 *
 * Handles:
 * - checkout.session.completed - New subscription
 * - customer.subscription.updated - Subscription changes
 * - customer.subscription.deleted - Subscription cancelled
 * - invoice.payment_succeeded - Successful payment
 * - invoice.payment_failed - Failed payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('✅ Webhook received:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Determine tier based on price
  const priceId = subscription.items.data[0].price.id;
  let tier: 'PREMIUM' | 'PRO' = 'PREMIUM';

  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    tier = 'PRO';
  }

  // Update user subscription
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      subscriptionTier: tier,
      subscriptionStatus: 'ACTIVE',
    },
  });

  console.log(`✅ Subscription created for user ${userId}: ${tier}`);
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) {
    console.error('User not found for subscription:', subscription.id);
    return;
  }

  // Determine new tier
  const priceId = subscription.items.data[0].price.id;
  let tier: 'FREE' | 'PREMIUM' | 'PRO' = 'PREMIUM';

  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    tier = 'PRO';
  }

  // Determine status
  let status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' = 'ACTIVE';
  if (subscription.status === 'canceled') {
    status = 'CANCELED';
  } else if (subscription.status === 'past_due') {
    status = 'PAST_DUE';
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: status,
    },
  });

  console.log(`✅ Subscription updated for user ${user.id}: ${tier} - ${status}`);
}

/**
 * Handle subscription deletion (cancellation)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) {
    console.error('User not found for subscription:', subscription.id);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStatus: 'CANCELED',
    },
  });

  console.log(`✅ Subscription canceled for user ${user.id}`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Log successful payment
  console.log(`✅ Payment succeeded for invoice ${invoice.id}`);

  // TODO: Record in SubscriptionHistory table
  // await prisma.subscriptionHistory.create({
  //   data: {
  //     userId: ...,
  //     amount: invoice.amount_paid,
  //     status: 'SUCCESS',
  //   },
  // });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.error(`❌ Payment failed for invoice ${invoice.id}`);

  // TODO: Send notification to user
  // TODO: Record in SubscriptionHistory table
}
