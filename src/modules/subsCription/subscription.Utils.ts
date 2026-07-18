import { Stripe } from "Stripe";
import { prisma } from "../../lib/prisma";
import { stripeURL } from "../../lib/stripe";
import { SubsCriptionStatus } from "../../../generated/prisma/enums";

// subscription Date & Time function
export const getPeriodEnd = (Payload: Stripe.Subscription) => {
  const currentPeriodEndMiliseconds =
    Payload.items.data[0]?.current_period_end!;

  const currentPeriodEnd = new Date(currentPeriodEndMiliseconds * 1000);
  return currentPeriodEnd;
};

// এই ফাংশনটা handleWebhook ভিতর checkout.session.completed ফাংশনে কল করা আছে
export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const userId = session.metadata?.userId;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!userId || !stripeSubscriptionId || !stripeCustomerId) {
    // throw new Error("webhook Failed");
    console.log("webhook:Missing values For creating checkout session");
    return;
  }

  // subscription Date & Time কে কল করা হচ্ছে
  const stripeSubcription =
    await stripeURL.subscriptions.retrieve(stripeSubscriptionId);

  const currentPeriodEnd = getPeriodEnd(stripeSubcription);
  // এখান থেকে ডাটা বেইজে লেনদেন এর তথ্য পাঠাচ্ছি
  await prisma.subsCription.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      status: "ACTIVE",
      currentPeriodEnd,
    },

    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      status: "ACTIVE",
      currentPeriodEnd,
    },
  });
};

// subscription Update & Delete function
export const handelChengeSubscription = async (
  Payload: Stripe.Subscription,
) => {
  const stripeSubscriptionId = Payload.id;
  const status =
    Payload.status === "active" || Payload.status === "trialing"
      ? SubsCriptionStatus.ACTIVE
      : Payload.status === "canceled"
        ? SubsCriptionStatus.CANCELED
        : SubsCriptionStatus.EXPIRED;

  // subsCription End Time & Date কে কল করা হচ্ছে
  const currentPeriodEnd = getPeriodEnd(Payload);

  const isSubscriptionExist = await prisma.subsCription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!isSubscriptionExist) {
    console.log(
      `webhook:No Subscription found for subscription id:${stripeSubscriptionId}`,
    );

    return;
  }
  // এখান থেকে ডাটা বেইজে লেনদেন তথ্য আপডেট করতেছি
  await prisma.subsCription.update({
    where: {
      stripeSubscriptionId,
    },
    data: {
      status,
      currentPeriodEnd,
    },
  });
};
