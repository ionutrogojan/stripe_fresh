import { useEffect, useState, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
import {  type Stripe, type StripeElements, type loadStripe as LoadStripe } from "@stripe/stripe-js"; // stripe library interfaces

declare global { interface Window { stripeElements: StripeElements, stripe: Stripe, } } // declaring global stripe variable on the window object

let loadStripe: typeof LoadStripe;
if(IS_BROWSER) { loadStripe = (await import("@stripe/stripe-js")).loadStripe } // assigns loadStripe function from the @stripe/stripe-js library if the code is running in a browser environment

export default ({ pubKey }:{ pubKey: string }) => { // import the public stripe key
    const priceInput = useRef(null); // default price input value
    const [intentId, setIntentId] = useState(''); // default PPID
    const payment = {
        total: useSignal(1500), // default payment total
        loading: useSignal(false), // payment loading button disable check
        message: useSignal<null | string>("Please provide all the necessary details") } // default error message
    
    const stripeIntent = async(basketPrice: number, paymentId:string) => {
        await fetch('/api/stripe_intent', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: basketPrice,
                payment_intent_id: paymentId
            })
        }) // make a POST request with the total and the PPID to create or update a payment intent
        .then((res) => res.json()) // parse response
        .then((data) => { setIntentId(data.id), spawnStripe(data.client_secret) }) // update PPID and spawn the stripe payment form
    }

    useEffect(() => {
        stripeIntent(payment.total.value, intentId); // calling the intent on component mount. Can be changed to a different trigger like a "Proceed to checkout" button
    }, []);
    
    const spawnStripe = async(clientSecret: string) => {
        if(IS_BROWSER) {
            const stripe = await loadStripe(pubKey); // load the stripe library using the public key
            if(stripe) { window.stripe = stripe } // assign stripe as a global window variable if loading was successful
            const elements = stripe?.elements({
                clientSecret,
                appearance: { theme: 'stripe' }
            }) // create a new StripeElements instance using the client secret and the appearance configuration
            if(elements) { window.stripeElements = elements } // assign the instance to the window declaration of StripeElements
            const payElement = elements?.create('payment'); // calling create on the elements instance to create the stripe form
            payElement?.mount('#payment_element'); // mounting the form to the parent with the assigned id "#payment_element"
        }
    }

    const handleSubmit = async() => {
        payment.loading.value = true; // disable the payment confirmation button to avoid multiple attempts for the same payment
        const { error } = await window.stripe.confirmPayment({
            elements: window.stripeElements,
            confirmParams: {
                return_url: `${location.origin}/payment-success`,
            },
        }); // calling the confirm payment function using the global window stripeElements
        if( error.type === 'card_error' || error.code === 'payment_intent_authentication_failure') { payment.message.value = error.message! } // checking for payment details or other payment errors
        else { payment.message.value = "An unexpected error occurred" } // any other unexpected error during payment
        payment.loading.value = false; // return access to buy button
    }

    const handleChange = () => {
        // @ts-ignore: element is not null after render
        const newPrice = priceInput.current?.value; // updated price value
        // console.log(intentId);
        stripeIntent(newPrice, intentId); // update the payment intent details using the new price value
    }

    return (
        <div class="payment_form">
            <div class="payment_input">
                <input ref={priceInput} class="test-amount" type="text" placeholder="Amount" value={1500}/> {/* Input field for updating the basket total */}
                <button onClick={handleChange} disabled={payment.loading.value} class="buy-button">Update</button> {/* Button to update the payment intent details */}
            </div>
            <div id="payment_element"></div> {/* payment element on which the Stripe form mounts */}
            <button onClick={handleSubmit} disabled={payment.loading.value} class="buy-button">Buy Now</button> {/* Button to confirm the payment intent */}
            <p class="stripe-message">{payment.message}</p> {/* display Stripe payment error message. Missing details, incorrect details, etc */}
        </div>
    )
}