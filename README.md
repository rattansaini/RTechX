# RTechX

Course-selling site for RTechX — an IT-recruitment training brand. Built as a
multi-course academy from day one, even though one course is currently live.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase ·
Razorpay · Resend · n8n · deployed on Netlify.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill it in — see below
npm run dev                  # http://localhost:3000
```

Node 20 or newer.

---

## Environment variables

Everything lives in `.env.local`, which is gitignored. `.env.example` is the
template and **is** committed.

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | No trailing slash. Used for canonical URLs, sitemap, OG. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | for payments | `rzp_test_…` or `rzp_live_…`. Publishable. |
| `RAZORPAY_KEY_SECRET` | for payments | **Server only.** Never prefix `NEXT_PUBLIC_`. |
| `RAZORPAY_WEBHOOK_SECRET` | optional | You invent this; paste the same value into the Razorpay dashboard. |
| `SUPABASE_SCHEMA` | yes | `rtechx`. See "Database" below. |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Safe in the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **Server only.** Bypasses RLS. |
| `RESEND_API_KEY` | for email | Scope it to *Sending access*. |
| `RESEND_FROM_EMAIL` | for email | e.g. `RTechX <hello@rtechx.com>`. Domain must be verified in Resend. |
| `N8N_WEBHOOK_URL` | optional | Leave blank to disable. Failures never block checkout. |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | optional | `G-XXXXXXXXXX`. |
| `NEXT_PUBLIC_META_PIXEL_ID` | optional | Numeric pixel id. |
| `NEXT_PUBLIC_WHATSAPP_GROUP_URL` | optional | Shown on `/thank-you` and in the confirmation email. |

Anything optional degrades gracefully — the site renders and sells without it.

> **Never paste a secret into a chat window, a screenshot, or a commit.**
> If one leaks, rotate it at the provider; deleting it from the file does not
> un-leak it.

---

## Testing payments

Razorpay must be in **Test Mode** (`rzp_test_…`) or real cards will be charged.

| Card | Result |
|---|---|
| `4111 1111 1111 1111` | success |
| `5104 0600 0000 0008` | success (Mastercard) |
| any future expiry, any CVV, OTP `1234` | |

UPI in test mode: use `success@razorpay`.

**Going live:** generate live keys, replace both Razorpay values, redeploy.
Nothing else changes.

---

## Database

RTechX lives in its own `rtechx` **schema** inside a Supabase project that also
hosts an unrelated app in `public` — including its own `orders` table that
would otherwise collide.

Tables: `leads`, `orders`, `enrollments`, `coupons`, plus a `batch_seats` view.

RLS is enabled on every table with **zero policies**, deliberately. The
publishable key can read nothing; only the server-side service role reaches
them. If you ever add a policy, you are opening those tables to the browser —
be sure that's what you want.

Amounts are stored in **paise** as integers, matching Razorpay. Never store
rupees as a float.

To extract RTechX later: `pg_dump -n rtechx`.

---

## Editing course content

Everything a non-developer needs is in `content/courses/`. No component
touches a price, a date or a piece of copy directly.

`content/courses/it-recruitment-masterclass.ts` — safe to edit:

- `tiers[].priceINR` — prices
- `batches[]` — `startDate`, `timeIST`, `seats`
- `batches[].seatsLeft` — `null` hides the seat counter; a number shows it
- `faqs[]`, `outcomes[]`, `days[]`, `inclusions[]` — copy
- `guarantee` — **this is a binding refund promise.** It renders on the course
  page, the checkout, the confirmation email and `/legal/refund-policy`.

**Do not rename** `slug` or a tier `id` after launch — both appear in live
checkout URLs and in recorded orders.

### Rules the code enforces

- `compareAtINR` (strikethrough) only renders if set. Don't invent a "was"
  price — that's a false discount claim under the Consumer Protection Act.
- The countdown only targets a real batch start date. It runs down once, then
  the whole bar disappears. There is no way to express a repeating deadline.
- The seat counter renders nothing when `seatsLeft` is `null`. It never guesses.
- `content/testimonials.ts` ships empty. The reviews section renders **nothing**
  until real, attributable reviews exist — no placeholders.
- A `priceRise` notice expires on its own once `effectiveFrom` passes.

---

## How to add course #2

1. Copy `content/courses/it-recruitment-masterclass.ts` to
   `content/courses/<new-slug>.ts`.
2. Rename the export and set `slug` to match the filename.
3. Fill in `title`, `hookLine`, `outcomes`, `days`, `tiers`, `faqs`, `seo`.
4. In `content/courses/index.ts`, import it and add it to `liveCourses`.
5. Delete its entry from `content/courses/coming-soon.ts` if it was listed.
6. Done. `/courses`, `/courses/<slug>`, `/checkout/<slug>`, `/lp/<slug>`, the
   sitemap, the OG image and the JSON-LD all pick it up automatically.

No component needs changing.

---

## Architecture notes

**Checkout security.** `/api/checkout/verify` is the trust boundary. Razorpay's
browser callback is attacker-controllable, so nothing is written and no email
sent until the HMAC signature verifies against the server-held key secret
(`timingSafeEqual`). Price is never accepted from the client — the browser
sends a slug, a tier and maybe a coupon, and the server derives the amount.
Request schemas are `.strict()`, so an injected `amountPaise` is rejected.

**Idempotency.** `enrollments` is unique on `order_id`, so a replayed callback
cannot enrol twice or resend the confirmation.

**Failure isolation.** Email and n8n failures are caught and logged, never
thrown. The customer has already paid; a failed email is a support task, not a
failed purchase.

**Motion.** Scroll reveals are a CSS scroll-driven timeline behind an
`@supports` guard, so content is **visible by default**. A large share of
traffic arrives through the Instagram in-app webview, where anything sitting at
`opacity: 0` waiting for an IntersectionObserver is a blank section.

**Route groups.** `src/app/(site)/` carries the header and footer.
`src/app/lp/` deliberately sits outside it so ad landing pages render with no
nav and no exits.

**Analytics.** No GA4 or Meta script is added to the document until the visitor
accepts. Declining means the third-party code is never fetched, not merely told
to behave.

---

## Deployment

**Netlify** — its free tier permits commercial use, and it runs a real Node
runtime, so the Razorpay HMAC verification and the Resend calls work unchanged.
Redeploys on every push to `main`.

1. [app.netlify.com](https://app.netlify.com) → sign in with GitHub
2. **Add new site → Import an existing project** → GitHub → `RTechX`
3. Leave the build settings alone — `netlify.toml` sets them
4. Add the environment variables from the table above **before** the first deploy
5. Deploy

`output: "standalone"` is disabled automatically on Netlify (their runtime does
its own bundling and standalone output confuses it) and enabled everywhere
else. The same repo deploys correctly to both without a flag.

### Self-hosting instead (Docker / VPS / Coolify)

The committed `Dockerfile` runs anywhere Docker does. It uses the standalone
output, so the image is ~73MB and needs no production `npm install`.

### The build-time gotcha

`NEXT_PUBLIC_*` values are **inlined into the browser bundle at build time**,
not read at startup. On Netlify that is automatic. On Coolify or plain Docker
they must be passed as **build arguments** — the Dockerfile declares them as
ARGs. Miss this and the deploy succeeds, the site loads, and checkout fails
with an empty Razorpay key and no obvious cause.

Shared hosting will not work at all — Next.js needs a live Node process.

Whatever you use, set `NEXT_PUBLIC_SITE_URL` to the production domain or the
sitemap, canonical URLs and OG images will point at the wrong host.

---

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve the build
npm run lint    # eslint
npx tsc --noEmit
```

---

## Still outstanding

- **Registered address** for `{site.legal.entity}` — required on the terms and
  refund pages before Razorpay review. Set `legal.address` in `src/lib/site.ts`.
- **GSTIN**, if it should appear on invoices — same file.
- **Social URLs** — `site.socials`; the footer skips any that are `null`.
- **Real testimonials** — `content/testimonials.ts`.
- **Course trailer** — set `trailerUrl` and the hero video slot appears.
- **Handbook PDF and Boolean cheat-sheet** — the lead magnet currently captures
  the email but there is no file attached to the delivery yet.
