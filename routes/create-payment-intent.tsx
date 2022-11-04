import { Handlers } from "$fresh/server.ts";

import { stripe } from "../utils/striped.ts";

export const handler: Handlers = {
    async POST(req) {
        const { id, price } = await req.json();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price,
            currency: 'gbp',
            automatic_payment_methods: {
                enabled: false,
            },
        })
        return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }))
    }
}