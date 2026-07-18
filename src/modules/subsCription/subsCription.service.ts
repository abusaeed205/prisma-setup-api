import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripeURL } from "../../lib/stripe";

import {
  handelChengeSubscription,
  handleCheckoutCompleted,
} from "./subscription.Utils";

const createCheckOutSession = async (userId: string) => {
  const transaCtionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });
    // old subscriber
    let stripCustomerId = user.subscription?.stripeCustomerId; // stripeCustomerId এটা prisma থেকে আসতেছে

    if (!stripCustomerId) {
      // New subscriber
      const customer = await stripeURL.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });

      stripCustomerId = customer.id;
    }

    const session = await stripeURL.checkout.sessions.create({
      line_items: [
        {
          price: config.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: stripCustomerId,
      payment_method_types: ["card"],
      success_url: `${config.app_url}/premium?success=true`,
      cancel_url: `${config.app_url}/payment?success=false`,
      metadata: { userId: user.id },
    });
    return session.url;
  });

  return {
    paymentUrl: transaCtionResult,
  };
};

const handleWebhook = async (Payload: Buffer, signature: string) => {
  // (copy from stripe webhook) Interactive webhook endpoint builder
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripeURL.webhooks.constructEvent(
    Payload,
    signature,
    endpointSecret,
  );

  // stripe webhook hook enent type(google search)
  // subscription object stripe(google search)
  switch (event.type) {
    case "checkout.session.completed":
      // Occurs when a Checkout Session has been successfully completed.
      // এখান থেকে ডাটা বেইজে লেনদেন এর তথ্য পাঠাচ্ছি
      await handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.updated":
      await handelChengeSubscription(event.data.object);
      // Occurs whenever a subscription changes (e.g., switching from one plan to another, or changing the status from trial to active).
      break;
    case "customer.subscription.deleted":
      // Occurs whenever a customer’s subscription ends.
      await handelChengeSubscription(event.data.object);
      break;
    default:
      // Unexpected event type
      console.log(`No event matched.Unhandled event type ${event.type}.`);
      break;
  }
};

const getSubscriptionStatus = async (userId: string) => {
  const isSubscriptionExist = await prisma.subsCription.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const isActive =
    isSubscriptionExist.status === "ACTIVE" &&
    isSubscriptionExist.currentPeriodEnd &&
    new Date(isSubscriptionExist.currentPeriodEnd) > new Date();

  return {
    status: isSubscriptionExist.status,
    isSubscribed: isActive,
    currentPeriodEnd: isSubscriptionExist.currentPeriodEnd,
  };
};

export const subsCriptionService = {
  createCheckOutSession,
  handleWebhook,
  getSubscriptionStatus,
};
