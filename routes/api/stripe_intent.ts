import { Handlers } from "$fresh/server.ts";
import { stripe } from "../../utils/striped.ts";


export const handler: Handlers = {
    async POST(req) {
        const { amount, payment_intent_id } = await req.json(); // receive the amount to be charged and the PIID
        let response = ''; // response to be returned
        if(payment_intent_id) { // checking if we received a PIID to avoid starting a new intent
            const current_intent = await stripe.paymentIntents.retrieve(payment_intent_id); // retrieving current intent using the provided PIID
            if(current_intent) { // on successful retrieve
                const update_intent = await stripe.paymentIntents.update( payment_intent_id, { amount: amount } ); // update intent with the PPID and amount
                response =  JSON.stringify(update_intent); // declare response
            }
            console.log("stripe intent exists:", payment_intent_id); // debug confirmation of PPID
        } else { // if no PPID is received
            const params = {
                amount: amount,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: false,
                },
            } // setup payment intent params
            const payment_intent = await stripe.paymentIntents.create( params ); // create new payment intent
            response = JSON.stringify(payment_intent); // declare response
        }
        return new Response(response);
    }
}