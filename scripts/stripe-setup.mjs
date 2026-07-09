// One-shot Stripe provisioning for CLARIX.
//
// Creates (idempotently, via price lookup_keys) every product + price the app
// expects, then prints the STRIPE_*_PRICE_ID env lines to paste into Railway.
// Safe to re-run: existing prices are reused, not duplicated.
//
// Run it with your secret key in the environment (never commit the key):
//   macOS/Linux:  STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
//   PowerShell:   $env:STRIPE_SECRET_KEY="sk_test_..."; node scripts/stripe-setup.mjs
//
// Amounts mirror lib/stripe.ts + lib/site-data.ts. Annual prices bill yearly at
// the discounted per-month rate x12 (e.g. Pro annual $25/mo -> $300/yr).

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set. See the header of this file for how to run it.");
  process.exit(1);
}
const stripe = new Stripe(key);

// [envVar, productName, lookupKey, unitAmountCents, interval|null(one-time)]
const PRICES = [
  ["STRIPE_STARTER_PRICE_ID", "CLARIX Starter", "clarix_starter_monthly", 1500, "month"],
  ["STRIPE_STARTER_ANNUAL_PRICE_ID", "CLARIX Starter", "clarix_starter_annual", 15600, "year"],
  ["STRIPE_PRO_PRICE_ID", "CLARIX Pro", "clarix_pro_monthly", 3000, "month"],
  ["STRIPE_PRO_ANNUAL_PRICE_ID", "CLARIX Pro", "clarix_pro_annual", 30000, "year"],
  ["STRIPE_BUSINESS_PRICE_ID", "CLARIX Business", "clarix_business_monthly", 5900, "month"],
  ["STRIPE_BUSINESS_ANNUAL_PRICE_ID", "CLARIX Business", "clarix_business_annual", 60000, "year"],
  ["STRIPE_CHAT_PACK_PRICE_ID", "CLARIX Chat Pack (100 messages)", "clarix_chat_pack", 900, null],
];

const productCache = new Map();
async function getProduct(name) {
  if (productCache.has(name)) return productCache.get(name);
  const existing = await stripe.products.search({ query: `name:'${name}'` });
  const product = existing.data[0] ?? (await stripe.products.create({ name }));
  productCache.set(name, product.id);
  return product.id;
}

async function ensurePrice(name, lookupKey, unitAmount, interval) {
  const found = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1, active: true });
  const existing = found.data[0];
  // Stripe prices are immutable, so reuse only when the amount is unchanged.
  // A changed amount means a new price — we move the lookup_key onto it.
  if (existing && existing.unit_amount === unitAmount) return existing.id;
  const product = await getProduct(name);
  const price = await stripe.prices.create({
    product,
    currency: "usd",
    unit_amount: unitAmount,
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    ...(interval ? { recurring: { interval } } : {}),
  });
  return price.id;
}

const lines = [];
for (const [envVar, name, lookupKey, amount, interval] of PRICES) {
  const id = await ensurePrice(name, lookupKey, amount, interval);
  console.log(`  ${lookupKey.padEnd(26)} -> ${id}`);
  lines.push(`${envVar}=${id}`);
}

console.log("\n=== Paste these into Railway -> Variables (and your local .env) ===\n");
console.log(lines.join("\n"));
console.log(
  "\nNext: add a webhook endpoint at Developers -> Webhooks pointing to " +
    "https://clarix.up.railway.app/api/webhooks/stripe (events: checkout.session.completed, " +
    "customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed), " +
    "then set STRIPE_WEBHOOK_SECRET to its signing secret.\n",
);
