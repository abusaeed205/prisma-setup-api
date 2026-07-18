import Stripe from "Stripe";
import config from "../config";

// config ফাইলে ডেভেলপার Api রাখা আছে

export const stripeURL = new Stripe(config.stripe_secret_key);
