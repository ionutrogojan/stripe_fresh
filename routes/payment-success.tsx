import { Head, asset } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { stripe } from "../utils/striped.ts";

export const handler: Handlers = {
    async GET(req, ctx) {
        let response:string; // response to be returned
        try {
            const payment_intent_id = new URL(req.url).searchParams.get('payment_intent') as string; //retrieve PPID from the return URL
            const current_intent = await stripe.paymentIntents.retrieve(payment_intent_id); // retrieve current intent from PPID
            response = current_intent.status; // declare response as current intent status
        } catch (err) { console.log(err), response = "error, please contact seller" } // debug error upon failed request
        return await ctx.render(response); // return payment status as PageProps data for display
    }
}

export default ({ data }:PageProps) => { 
    return ( <>
        <Head>
			<link rel="stylesheet" href={asset('./global.css')} />
		</Head>
        <p>Payment status : {data}</p> {/* display payment status from the PageProps */}
    </> )}