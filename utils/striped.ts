import { load } from "https://deno.land/std@0.178.0/dotenv/mod.ts";
import Stripe from "stripe";

const env = await load();

const IS_PRODUCTION = Deno.env.get('DENO_ENV') === 'production';

const stripeSEC = (!IS_PRODUCTION ? env['STRIPE_SEC'] : (Deno.env.get('STRIPE_SEC') as string));
export const stripePUB = (!IS_PRODUCTION ? env['STRIPE_PUB'] : (Deno.env.get('STRIPE_PUB') as string));

export const stripe = new Stripe(stripeSEC, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2022-08-01'
}) // create a new stripe connection using the secret and public keys
