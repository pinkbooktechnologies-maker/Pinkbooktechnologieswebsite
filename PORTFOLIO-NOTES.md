# Portfolio redesign

Portfolio is independently styled by `portfolio-studio.css` and uses dependency-free interactions in `portfolio-studio.js`. Other pages remain unchanged. The page background reuses the rose, pale neutral and blue direction of the About hero.

The eight previews are illustrative frontend demonstrations, not live customer software. All patient, student, order, fare and energy data is sample data. No bookings, payments or attendance records are transmitted or saved to a server.

## Generated asset

`assets/portfolio-smart-home.webp` is an AI-generated product concept illustration, not a photograph of an existing PinkBook device.

Prompt direction: Photorealistic editorial product photograph for Smart Home IoT, landscape 3:2, unbranded off-white hub and wall switch on a charcoal shelf, neutral cool grays with a small muted rose indicator. No text, logos, neon or holograms. Illustrative concept image, not an existing product photo.

## Checks

- JavaScript syntax checked with `node --check portfolio-studio.js`.
- Browser-tested all eight previews: queue progression, attendance saving, invoice calculation, delivery progression, booking preview, smart-home switches, solar period selection and examination submission.
- Checked product filtering and 390px responsive layout.
- Motion respects `prefers-reduced-motion`; project selection uses history replacement without forced scrolling.
- Lighthouse/Core Web Vitals field measurements were not run. No performance score is claimed.
