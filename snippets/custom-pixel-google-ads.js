// ------------------------------------------------------------------------------
// SHOPIFY CUSTOM PIXEL CODE (Google Ads Conversion)
// ------------------------------------------------------------------------------
// Instructions:
// 1. Go to Shopify Admin > Settings > Customer events.
// 2. Click "Add custom pixel". Name it "Google Ads Conversion".
// 3. Paste this ENTIRE code block into the code editor.
// 4. Click "Save" and then "Connect".
// ------------------------------------------------------------------------------

// 1. Initialize the Google Tag (gtag)
// This loads the Google Ads script into the secure pixel sandbox.
const script = document.createElement('script');
script.setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=AW-17741514624');
script.setAttribute('async', '');
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'AW-17741514624');

// 2. Subscribe to the "checkout_completed" event
// This event fires ONLY when a customer successfully completes a purchase.
analytics.subscribe("checkout_completed", (event) => {
    const checkout = event.data.checkout;



    // 3. Fire the Google Ads Conversion Event
    gtag('event', 'conversion', {
        'send_to': 'AW-17741514624/7ZV1CIim3cIbEICP6ItC',
        'value': checkout.totalPrice.amount,
        'currency': checkout.currencyCode,
        'transaction_id': checkout.order.id
    });


});
