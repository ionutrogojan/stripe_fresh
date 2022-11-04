import { useState, useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

import {
    type Stripe,
    type StripeElements,
    type loadStripe as LoadStripe
} from "@stripe/stripe-js";

let loadStripe: typeof LoadStripe;

if(IS_BROWSER) {
    loadStripe = (await import("@stripe/stripe-js")).loadStripe
}

declare global {
    interface Window {
        stripeElements: StripeElements,
        stripe: Stripe,
    }
}

export default ({pubKey}: { pubKey: string }) => {
    const PUB_KEY = pubKey;
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<null | string>(null);

    const spawnStripe = async () => {
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'alpha-02', price: 1500 }),
        })

        const { clientSecret } = await response.json();

        if(IS_BROWSER) {
            const stripe = await loadStripe(PUB_KEY);
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

    useEffect(() => {
        spawnStripe()
    }, [])


    const handleSubmit = async () => {
        setIsLoading(true);
        await window.stripe.confirmPayment({
            elements: window.stripeElements,
            confirmParams: {
                return_url: `${location.origin}/payment-success`,
                receipt_email: 'i.rogojan15@gmail.com',
            },
        })
        .then((result) => {
            if( result.error.type === 'card_error' || result.error.type === 'validation_error' || result.error.code === 'payment_intent_authentication_failure') { setMessage(result.error.message!) }
            else { setMessage("An unexpected error occured.") }
            setIsLoading(false);
        })
    }

    return (
        <div>
            <div id="payment_element"></div>
            <button onClick={handleSubmit} id="submit" disabled={isLoading ? true : false} >
                <div class="spinner hidden" id="spinner"></div>
                <span id="button-text">Pay now</span>
            </button>
            <p>{message && message}</p>
        </div>
    )
}