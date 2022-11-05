import { useEffect, useState, useCallback } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
import {  type Stripe, type StripeElements, type loadStripe as LoadStripe } from "@stripe/stripe-js";

let loadStripe: typeof LoadStripe;
if(IS_BROWSER) { loadStripe = (await import("@stripe/stripe-js")).loadStripe }

declare global { interface Window { stripeElements: StripeElements, stripe: Stripe, } }

export default ({pubKey}: { pubKey: string }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [intentId, setIntentId] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const payment = {
        visible: useSignal('hide'),
        loading: useSignal(false),
        message: useSignal<null | string>("Please provide all the neccessary details"),
    }
    useEffect(() => {
        const stripeIntent = async () => {
            const basketPrice = 9999;
            await fetch('/api/stripe_intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: basketPrice,
                    payment_intent_id: intentId
                })
            })
            .then((res) => res.json())
            .then((data) => { setClientSecret(data.client_secret), setIntentId(data.id), spawnStripe(data.client_secret) })
        }
        console.log("page load");
        stripeIntent();
    }, []);
    
    const spawnStripe = async (clientSecret: string) => {
        console.log("striped");
        if(IS_BROWSER) {
            const stripe = await loadStripe(pubKey);
            if(stripe) { window.stripe = stripe }
            const elements = stripe?.elements({
                clientSecret,
                appearance: {
                    theme: 'none',
                    variables: {
                            colorPrimary: '#D65C71',
                            colorBackground: '#E8E3E4',
                            colorText: '#1A1A1A',
                            colorTextPlaceholder: '#9E9496',
                            colorDanger: '#D65C71',
                            colorWarning: '#D65C71',
                            fontFamily: 'Roboto Condensed, sans-serif',
                            fontLineHeight: '20px',
                            spacingUnit: '2px',
                            spacingGridColumn: '20px',
                            spacingGridRow: '20px',
                            borderRadius: '0px',
                            fontSizeBase: '16px',
                        },
                        rules: {
                            '.Label': {
                                color: '#1A1A1A',
                                fontSize: '16px',
                                paddingBottom: '10px'
                            },
                            '.Input': {
                                border: '2px solid #9E9496',
                                padding: '13px 20px',
                                fontSize: '16px',
                                lineHeight: '20px'
                            },
                        }
                    }
                })
                if(elements) { window.stripeElements = elements }
                const payElement = elements?.create('payment');
                payElement?.mount('#payment_element');
        }
    }

    const retrieveStripe = async (clientSecret: string) => {
        if(IS_BROWSER && clientSecret) {
            const { paymentIntent, error } = await window.stripe.retrievePaymentIntent(clientSecret);
            setPaymentStatus((paymentIntent?.status) as string);
        }
    }
    useEffect(() => {
        retrieveStripe(clientSecret);
    }, [window.stripe]);

    useEffect(() => {
        console.log(paymentStatus);
    }, [paymentStatus]);

    const handleSubmit = async () => {
        retrieveStripe(clientSecret);
        payment.loading.value = true;
        const { error } = await window.stripe.confirmPayment({
            elements: window.stripeElements,
            confirmParams: {
                return_url: `${location.origin}/payment-success`,
                receipt_email: '',
                shipping: {
                    address: {
                        line1: '',
                        postal_code: '',
                        city: '',
                    },
                    name: 'Shipping user'
                },
                payment_method_data: {
                    billing_details: {
                        name: 'User Name'
                    },
                },
            },
        });
        if( error.type === 'card_error' || error.code === 'payment_intent_authentication_failure') { payment.message.value = error.message! }
        else { payment.message.value = "An unexpected error occured" }
        payment.loading.value = false;
    }

    return (
        <div data-payment-visible={payment.visible}>
            <div id="payment_element"></div>
            <button onClick={handleSubmit} disabled={payment.loading.value} >Buy Now</button>
            <p>{payment.message}</p>
        </div>
    )
}