import { Handlers } from "$fresh/server.ts";
import { stripe } from "../../utils/striped.ts";


export const handler: Handlers = {
    async POST(req) {
        const { amount, payment_intent_id } = await req.json();
        let response = '';
        if(payment_intent_id) {
            // if a payment_intent_id is passed, retrieve the paymentIntent
            const current_intent = await stripe.paymentIntents.retrieve(payment_intent_id);
            // if a paymentIntent is retrieved update its amount
            if(current_intent) {
                const update_intent = await stripe.paymentIntents.update( payment_intent_id, { amount: amount } );
                response =  JSON.stringify(update_intent);
            }
            console.log("stripe intent exists:", payment_intent_id);
        } else {
            const params = {
                amount: amount,
                currency: 'gbp',
                automatic_payment_methods: {
                    enabled: false,
                },
            }
            const payment_intent = await stripe.paymentIntents.create( params );
            response = JSON.stringify(payment_intent);
        }
        return new Response(response);
    }
}