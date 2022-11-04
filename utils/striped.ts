import { config } from "dotenv";
import Stripe from "stripe";

const IS_PRODUCTION = Deno.env.get('DENO_ENV') === 'production';

const stripeSEC = (!IS_PRODUCTION ? config().STRIPE_SEC : (Deno.env.get('STRIPE_SEC') as string));
export const stripePUB = (!IS_PRODUCTION ? config().STRIPE_PUB : (Deno.env.get('STRIPE_PUB') as string));

export const stripe = new Stripe(stripeSEC, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2022-08-01'
})