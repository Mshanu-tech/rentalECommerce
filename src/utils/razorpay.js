const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let loadPromise = null;

/**
 * Loads Razorpay's Checkout.js on demand — only when a shopper actually chooses to pay
 * online — rather than on every page load. Safe to call more than once; the script is
 * injected at most once and every caller shares the same promise.
 */
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Could not load the payment gateway. Please check your connection and try again.'));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}
