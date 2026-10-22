# Twilio A2P 10DLC rejection 30913 — CM9083

Prepared: October 21, 2026. **Deployment, QA, campaign resubmission and Twilio approval are separate steps.**

## Changed site paths

- `/terms.html`: describes separate marketing vs. informational/song-status consent.
- `/privacy-policy.html`: mirrors the two independent SMS purposes and mobile-data treatment.
- `/rewards.html`: keeps loyalty enrollment working without SMS; optional mobile number with two separate, default-unchecked SMS boxes. A phone number is required if an SMS category is selected. Netlify form fields: `phone`, `sms_marketing_consent`, `sms_informational_consent`, `sms_consent_version`, `sms_consent_source`, `sms_consent_timestamp`.
- `/sms-signup.html`: publicly accessible standalone SMS preferences collection for users not joining rewards. Netlify form name: `sms-preferences`. Both opt-in checkboxes start unchecked; an affirmative choice applies only to that specific category.
- `/sms-thank-you.html`: confirmation that does not represent that SMS sending is approved or active.
- `/radio.html`: link to the separate consent form.

The website uses its existing official Nod Factor logo from `nod-factor-logo.png`; no replacement artwork.

## Before merging

1. Confirm the desired mailing categories and actual SMS terms with Pernard, including the advertised **up to four texts per month**. The marketing checkbox must only authorize marketing, and the informational box must not be used for ads.
2. Confirm the current song submission workflow. The terms historically mention `Submit up to 3 Songs`, but no song-submission form was found among the deployed Netlify Forms (`rewards-signup`, `contact`, `booking`). If music is submitted via a hosted third-party form, that form must be updated separately. **This change does not claim to implement an undiscovered third-party form**.
3. Check Twilio keywords: the preexisting `Text JOIN` website CTA has been replaced with a pending-approval notice. This does not disable any keyword configured in Twilio. If the keyword remains an actual opt-in path, its wording and chosen message category MUST be documented and it must not auto-enroll in both types.
4. Confirm who has permission to access the phone-number records in Netlify Forms. Apply data minimization, appropriate retention/access rules and secure processing to any export or integration.
5. For a previously combined opt-in list, do not treat bundled consent as separate marketing permission. Request fresh category-specific consent where needed.

## After merge and Netlify deploy

Verify all pages publicly load, logos show, Terms and Privacy links work, and no broken layout on mobile. Check both checkboxes default to unchecked, are independent, and rewards enrollment works without SMS. Verify that an affirmative option requires a number, test Netlify's separate category fields in a form submission, and never send a test marketing SMS before registration approval. Netlify Forms captures submissions; **this PR does not integrate or authorize Twilio sending**. Confirm backend checks suppression/STOP and the most recent consent state prior to any messaging.

## Suggested Twilio message_flow (only after public deploy and verification)

> Consumers visit https://nodfactorproductions.com/sms-signup.html and enter their name and mobile number. Two separate, unchecked, optional checkboxes allow independent written consent for (a) promotional/marketing texts about Nod Factor Radio shows, events, station promotions and offers; and (b) non-promotional information about song-submission status and related service updates. Selecting one does not authorize the other. Similar independent choices appear on the optional mobile portion of https://nodfactorproductions.com/rewards.html, and users can join Rewards without receiving SMS. The public Terms & Conditions are at https://nodfactorproductions.com/terms.html and Privacy Policy at https://nodfactorproductions.com/privacy-policy.html. Disclosures provide up to 4 texts/month, message/data rates, STOP to unsubscribe and HELP for assistance. Each affirmative choice is collected and recorded separately. Any text-in keyword or other enrollment method must be individually described if it remains active.

Make sure the actual Twilio configuration, sample messages and campaign use case match this text. Attach publicly accessible screenshots of the **live** opt-in form if Twilio asks. **Pernard or an authorized Twilio account admin must correct and resubmit campaign CM9083** and wait for approval before enabling outbound texts.

Twilio guidance: https://www.twilio.com/docs/api/errors/30913

## Rollback

This PR changes no live Twilio credentials or send functions. Revert only the PR's changed HTML files if the web update causes regression; preserve records for any actual consent already collected.
