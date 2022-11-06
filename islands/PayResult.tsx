import { useEffect, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import {  type Stripe, type loadStripe as LoadStripe } from "@stripe/stripe-js";

let loadStripe: typeof LoadStripe;
if(IS_BROWSER) { loadStripe = (await import("@stripe/stripe-js")).loadStripe }

declare global { interface Window { stripe: Stripe, } }

export default ({ pubKey }: {pubKey: string}) => {
    const[paymentStatus, setPaymentStatus] = useState('');
    useEffect(() => {
        // const clientSecret = "pi_3M1APfF0EaZZTEvP0JAXam7n_secret_tCehVtPf0OoC8FEIuCM9yjbPX";
        const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
        console.log(clientSecret);
        const retrieveStripe = async () => {
            const stripe = await loadStripe(pubKey);
            if(stripe) { window.stripe = stripe }
            if(IS_BROWSER && clientSecret) {
                const { paymentIntent, error } = await window.stripe.retrievePaymentIntent(clientSecret);
                setPaymentStatus((paymentIntent?.status) as string)
            }
        }
        retrieveStripe();
    }, []);

    return <h1>Payment status: {paymentStatus}</h1>
}