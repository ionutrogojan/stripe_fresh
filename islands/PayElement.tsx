import { useEffect, useState, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
import {  type Stripe, type StripeElements, type loadStripe as LoadStripe } from "@stripe/stripe-js";

declare global { interface Window { stripeElements: StripeElements, stripe: Stripe, } }

let loadStripe: typeof LoadStripe;
if(IS_BROWSER) { loadStripe = (await import("@stripe/stripe-js")).loadStripe }

export default ({ pubKey }:{ pubKey: string }) => {
    const priceInput = useRef(null);
    const [intentId, setIntentId] = useState('');
    const payment = { total: useSignal(1500),loading: useSignal(false), message: useSignal<null | string>("Please provide all the neccessary details") }
    
    const stripeIntent = async(basketPrice: number, paymentId:string) => {
        await fetch('/api/stripe_intent', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: basketPrice,
                payment_intent_id: paymentId
            })
        })
        .then((res) => res.json())
        .then((data) => { setIntentId(data.id), spawnStripe(data.client_secret) })
    }

    useEffect(() => {
        stripeIntent(payment.total.value, intentId);
    }, []);
    
    const spawnStripe = async(clientSecret: string) => {
        if(IS_BROWSER) {
            const stripe = await loadStripe(pubKey);
            if(stripe) { window.stripe = stripe }
            const elements = stripe?.elements({
                clientSecret,
                appearance: {
                    theme: 'stripe',
                    }
                })
                if(elements) { window.stripeElements = elements }
                const payElement = elements?.create('payment');
                payElement?.mount('#payment_element');
        }
    }

    const handleSubmit = async() => {
        payment.loading.value = true;
        const { error } = await window.stripe.confirmPayment({
            elements: window.stripeElements,
            confirmParams: {
                return_url: `${location.origin}/payment-success`,
            },
        });
        if( error.type === 'card_error' || error.code === 'payment_intent_authentication_failure') { payment.message.value = error.message! }
        else { payment.message.value = "An unexpected error occured" }
        payment.loading.value = false;
    }

    const handleChange = () => {
        // @ts-ignore: element is not null after render
        // console.log(priceInput.current?.value);
        // @ts-ignore: element is not null after render
        const newPrice = priceInput.current?.value;
        // console.log(intentId);
        stripeIntent(newPrice, intentId);
    }

    return (
        <div class="payment_form">
            <div class="payment_input">
                <input ref={priceInput} class="test-amount" type="text" placeholder="Amount" value={1500}/>
                <button onClick={handleChange} disabled={payment.loading.value} class="buy-button">Update</button>
            </div>
            <div id="payment_element"></div>
            <button onClick={handleSubmit} disabled={payment.loading.value} class="buy-button">Buy Now</button>
            <p class="stripe-message">{payment.message}</p>
        </div>
    )
}