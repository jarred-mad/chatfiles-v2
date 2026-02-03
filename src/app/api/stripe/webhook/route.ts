import { NextRequest, NextResponse } from 'next/server';
import { generateApiKey } from '@/lib/api-auth';

// Stripe webhook handler
// In production, use the official Stripe SDK

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      customer: string;
      customer_email?: string;
      subscription?: string;
      status?: string;
      metadata?: Record<string, string>;
    };
  };
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  try {
    const body = await request.text();

    // In production, verify signature with Stripe SDK:
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // For now, parse as JSON (NOT SECURE - use Stripe SDK in production)
    const event: StripeEvent = JSON.parse(body);

    switch (event.type) {
      case 'checkout.session.completed': {
        // User completed checkout - create API key
        const session = event.data.object;
        const email = session.customer_email;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const tier = session.metadata?.tier || 'pro';

        if (email) {
          const apiKey = generateApiKey();

          // In production, save to database:
          // await db.apiKeys.create({
          //   key: apiKey,
          //   userId: session.customer,
          //   email,
          //   tier,
          //   createdAt: new Date(),
          //   expiresAt: tier === 'pro' ? addMonths(new Date(), 1) : null,
          // });

          // Send email with API key
          // await sendEmail({
          //   to: email,
          //   subject: 'Your ChatFiles.org API Key',
          //   body: `Your API key: ${apiKey}`,
          // });

          console.log(`Created API key for ${email}: ${apiKey}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const status = subscription.status;

        if (status === 'active') {
          // Subscription renewed - update expiration
          console.log(`Subscription renewed: ${subscription.id}`);
        } else if (status === 'past_due') {
          // Payment failed - send reminder
          console.log(`Subscription past due: ${subscription.id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled - revoke API key
        const subscription = event.data.object;

        // In production:
        // await db.apiKeys.update({
        //   where: { subscriptionId: subscription.id },
        //   data: { expiresAt: new Date() },
        // });

        console.log(`Subscription cancelled: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        // Payment failed - notify user
        const invoice = event.data.object;
        console.log(`Payment failed for: ${invoice.customer}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
