# Selena Events – deployment checklist

1. Review company facts, trade wording and tax treatment with an Austrian lawyer/tax adviser.
2. Configure Firebase secrets for Stripe, SMTP and `GOOGLE_MAPS_API_KEY`; never commit `.env`.
3. Create the initial `user_roles/{uid}` owner document from the Firebase console or Admin SDK. The website no longer self-assigns owner rights.
4. Deploy `firestore.rules`, `storage.rules`, Functions and Hosting.
5. Configure the Stripe webhook endpoint for `checkout.session.completed` and set its signing secret.
6. In Firestore `settings/transport`, configure `origin`, `includedKm`, `pricePerKm` and `roundTrip`.
7. Test fixed, “ab” and inquiry products, stock exhaustion, products with and without transport, customer mailbox and private PDF access.
8. Migrate older orders by adding the correct Firebase Auth UID as `customerUid`; old email-only orders are intentionally not exposed to customer accounts.
9. Open Dashboard > Produkte and run “Importă produsele existente” once. The import is idempotent and makes the bundled Shop/Verleih catalog editable without duplicate records.
10. Open Dashboard > Galerii Portfolio to seed/edit the existing team, create event galleries, replace homepage slides, partner logos and any image by its relative `assets/...` path.
11. Deploy the updated rules before testing cancellation requests, public galleries, team data and media overrides.
