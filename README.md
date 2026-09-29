# PinkBook Technologies — New Website Concept

A from-scratch, responsive multi-page company website inspired by the motion-led editorial feel of Hexa Digital, MotionSites AI and Recent Design without copying their assets or layouts.

## Preview

```powershell
npm run dev
```

Then open `http://127.0.0.1:4173`.

## Content status

- The PinkBook logo, email, phone number, postal address and social destinations come from the existing public website.
- Service descriptions, studio messaging and project examples are meaningful placeholder content.
- Example projects are labelled `Sample concept` and should be replaced with approved real work before launch.
- Career listings are clearly labelled planning placeholders and should be updated before launch.
- The homepage and contact-page forms validate in the browser and submit to the Vercel serverless mail endpoint at `/api/send-message`.
- The homepage now includes a point-of-view compass, a filterable HMS / School ERP / IoT product showcase, an animated 29-technology universe spanning .NET, Azure, web, AI, data, Android, Kotlin, iOS and IoT, a live delivery loop and an open-channel contact section with WhatsApp, email and phone shortcuts.
- All scrolling marquee/ticker bands have been removed.
- Light surfaces use a warm paper tone rather than stark white to keep the long page comfortable and editorial.
- A floating WhatsApp quick-reach button is available across the site using the supplied phone number.

## Production deployment

The connected Vercel project deploys the repository's `main` branch and serves the static pages with clean URLs. The contact endpoint requires these Vercel environment variables in the Production environment:

- `GMAIL_USER` — the Gmail account used to send enquiries
- `GMAIL_APP_PASSWORD` — a newly generated Gmail app password
- `CONTACT_TO_EMAIL` — the administrative inbox that receives enquiries

Never commit passwords or mail credentials. After changing environment variables, redeploy the latest production deployment so the serverless function receives them.

## Main files

- `index.html` — homepage and capabilities showcase
- `about.html` — story, mission, vision and team capabilities
- `portfolio.html` — filterable healthcare, education and IoT product showcase
- `careers.html` — culture, benefits and planned opportunities
- `contact.html` — verified contact details and enquiry form
- `styles.css` — responsive visual system and motion styling
- `script.js` — progressive enhancement, interactions and accessibility behavior
- `assets/hero-intelligence.webp` — optimized generated hero artwork
