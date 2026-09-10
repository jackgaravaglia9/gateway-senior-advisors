# Gateway Senior Advisors — Demand Test Landing Page

A one-page demand-generation test: a landing page, a 4-step intake form, and GA4
funnel tracking, built to test whether adult children searching for senior living
help in St. Louis will submit an intake form. Paid-traffic only — no SEO, no
accounts, no database, no CRM.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS. Deploys to Vercel. Submissions are
forwarded server-side to a Google Sheet via a Google Apps Script Web App — there is no
database and no admin UI; the Sheet is the admin view.

## Env vars

Copy `.env.example` to `.env.local` and fill in:

| Var | What it is | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID (`G-XXXXXXX`) | GA4 Admin → Data Streams → your web stream |
| `SHEET_WEBHOOK_URL` | Google Apps Script Web App URL that appends a row to the Sheet | Apps Script project → Deploy → Web app (deploy with access "Anyone") |

There is no third env var beyond these two — `SHEET_WEBHOOK_URL` is server-only
(never sent to the browser); `NEXT_PUBLIC_GA_MEASUREMENT_ID` is intentionally public,
same as any GA4 measurement ID.

If `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset, the app simply skips loading `gtag.js` —
nothing breaks. If `SHEET_WEBHOOK_URL` is unset, `/api/submit` returns a 500 and the
form shows its inline error state (this is expected and useful for testing that
error path).

## Apps Script webhook — expected payload

`/api/submit` POSTs this JSON body to `SHEET_WEBHOOK_URL`:

```json
{
  "relationship": "My parent",
  "age": "82",
  "careType": "Assisted living",
  "location": "Kirkwood, MO",
  "livingSituation": "Living at home alone",
  "budget": "$3,000-$4,500",
  "timeline": "1-3 months",
  "fullName": "Jane Doe",
  "phone": "314-555-0100",
  "email": "jane@example.com",
  "contactConsent": true,
  "shareConsent": false,
  "submittedAt": "2026-09-10T18:00:00.000Z",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "stl-assisted-living",
  "utm_term": "",
  "utm_content": "",
  "gclid": ""
}
```

Your Apps Script `doPost(e)` should `JSON.parse(e.postData.contents)` and append a
row with these fields.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

**To test the funnel + GA4 events:** set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to a real
GA4 stream ID, open GA4's Realtime report, then click through the form on
`localhost`. You should see `page_view`, then `funnel_step_view` (step 1) on load,
`funnel_step_complete` (step 1) + `funnel_step_view` (step 2) on each "Continue," and
so on through step 4.

**To test UTM/click-ID capture:** load the page with query params, e.g.
`http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=test&gclid=abc123`,
then submit the form and confirm those values arrive in the Sheet row.

**To test the submission path end-to-end:** set `SHEET_WEBHOOK_URL` to your deployed
Apps Script Web App URL, submit the form, and confirm a row appears in the Sheet and
you land on `/thank-you` (and that `generate_lead` fires in GA4 Realtime just before
the redirect).

**To test the failure path:** leave `SHEET_WEBHOOK_URL` unset (or point it at a bad
URL), submit the form, and confirm you get the inline error message on the form
itself — with your entered data still in place — instead of losing your input or
being redirected.

Once you're on `/thank-you`, that's where a Google Ads conversion tag gets pasted
into the `<head>` later — the page loads cleanly on a direct visit too, not only via
the form redirect, so the tag fires on bookmarks/shares as well.

## Deploying

```bash
vercel deploy
```

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `SHEET_WEBHOOK_URL` as Environment Variables
in the Vercel project settings before going live.

## Building the GA4 funnel report

The events are shaped so you can build an Explore → Funnel Exploration in GA4 using:

1. `funnel_step_view` where `step = 1`
2. `funnel_step_view` where `step = 2`
3. `funnel_step_view` where `step = 3`
4. `funnel_step_view` where `step = 4`
5. `generate_lead`

That gives you drop-off at each step of the 4-step form plus final conversion. You'll
need to register `step` as a custom dimension (GA4 Admin → Custom definitions →
Custom dimensions, event-scoped, parameter name `step`) before it's usable as a
funnel breakdown/filter.
