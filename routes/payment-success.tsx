import { stripe } from "../utils/striped.ts";

import { Handlers, PageProps } from "$fresh/server.ts";

export const handler: Handlers = {
    async GET(req, ctx) {
        let response:string;
        try {
            const payment_intent_id = (new URL(req.url).searchParams.get('payment_intent')) as string;
            const current_intent = await stripe.paymentIntents.retrieve(payment_intent_id);
            response = current_intent.status;
        } catch (err) { console.log(err), response = "error, please contact seller" }
        return await ctx.render(response);
    }
}

export default ({ data }:PageProps) => { return ( <p>Payment status : {data}</p> )}