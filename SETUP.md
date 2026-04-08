# Smart Tab Grouper Website Setup

This folder contains a GitHub Pages compatible static account and billing website.

## Publish on GitHub Pages

1. Push the repository to GitHub.
2. In GitHub, open `Settings -> Pages`.
3. Set the source to the branch you want to publish from.
4. Set the folder to `/website` if your Pages configuration supports folder publishing from the selected branch.
5. If your Pages flow only supports root or `/docs`, either:
   - move these files to `/docs`, or
   - publish with a GitHub Actions workflow that deploys the `website/` directory as static content.
6. After Pages is enabled, the site will serve plain HTML/CSS/JS with no build step required.

## Local preview

Open any file directly in the browser, or serve the folder with a minimal static server if you prefer. All links are relative and GitHub Pages safe.

## Mock state testing

- Default mock state uses `localStorage`.
- You can switch state from the chips on `account.html` and `billing.html`.
- You can also open pages with query parameters:
  - `account.html?state=signedOut`
  - `account.html?state=signedInFree`
  - `billing.html?state=signedInPremiumYearly`
  - `billing.html?state=signedInPremiumLifetime`

## Integration points

These placeholder functions live in [`app.js`](/Users/inan/Documents/extension_web_page/website/app.js):

- `signInWithGoogle()`
  Replace with Firebase Auth Google provider login.
- `fetchAccount()`
  Replace with a Cloudflare Worker API call that returns account, entitlement and Stripe-linked billing state.
- `createCheckout(planCode)`
  Replace with a Worker endpoint that creates a Stripe Checkout Session and redirects the user.
- `openBillingPortal()`
  Replace with a Worker endpoint that creates a Stripe Billing Portal session and redirects the user.

## Suggested backend wiring

- Firebase Auth: authenticate the Google user and obtain an ID token.
- Cloudflare Worker API: verify the token, read/write account records, return normalized account state.
- D1: store user profile, plan, Stripe customer ID, entitlement state and purchase metadata.
- Stripe: create checkout sessions, portal sessions, invoice and subscription state.
