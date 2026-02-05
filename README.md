# PathSathi

Scroll-driven 3D journey experiences for travel routes.

## Local setup
1. Install deps: `npm install`
2. Run dev server: `npm run dev`

## Notes
- Copy `.env.example` to `.env.local` and add Firebase client keys.
- Admin SDK uses server envs (do not expose them on the client).
- Firestore rules are in `firestore.rules`.
- Scroll-driven WebP sequence uses `src/lib/useScrollytelling.ts`.
- Email OTP uses Brevo SMTP (preferred) or API fallback.
- For SMTP set `BREVO_SMTP_KEY` + sender fields (host defaults to Brevo).
- Admin access requires a Firebase custom claim: `admin=true`.
  - Set once with: `node scripts/set-admin-claim.js` (uses `ADMIN_EMAIL`).
