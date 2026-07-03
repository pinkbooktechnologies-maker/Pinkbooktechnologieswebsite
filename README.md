# PinkBook Technologies — Website

Production-ready source for the PinkBook Technologies marketing site.
Plain HTML/CSS/JS — no build step, no framework, no npm install required
to run or deploy.

## Folder structure

```
pinkbook-production/
├── index.html              ← the entire site (single page)
├── robots.txt               Search engine crawl rules
├── sitemap.xml               Search engine sitemap
├── site.webmanifest          PWA / "Add to Home Screen" config
│
├── css/
│   ├── style.css              Core theme, layout, all sections
│   └── services.css           Service-detail blocks (mockups, badges)
│
├── js/
│   ├── main.js                 Header, nav, hero canvas, about 3D carousel,
│   │                           process timeline, reveals, forms, cursor
│   ├── services.js             Sticky service nav, 3D tilt, mockup animations
│   ├── lenis-bridge.js         Wires Lenis smooth-scroll into GSAP
│   │                           ScrollTrigger + adds anime.js flourishes
│   └── vendor/                 Third-party libraries (unmodified, bundled
│       ├── lenis.min.js         locally so the site works fully offline
│       ├── anime.min.js         and never depends on a CDN being up)
│       ├── gsap.min.js
│       └── ScrollTrigger.min.js
│
└── images/
    ├── favicon/                All favicon formats (see below)
    └── icons/                  Empty — drop any future image assets here
```

## How to run locally

Any static file server works. From inside this folder:

```bash
# Python (most common)
python3 -m http.server 8080

# Node
npx serve .

# PHP
php -S localhost:8080
```

Then open `http://localhost:8080`.

You can also just double-click `index.html` to open it directly in a
browser — it works via `file://` too, since every asset is a relative
local path. A local server is only slightly more reliable for things like
the custom cursor and canvas background on some browsers.

## How to deploy to a real server

This is a 100% static site — copy the whole folder to any static host and
it works immediately. No build, no environment variables, no database.

**Shared hosting / cPanel:** upload the entire contents of this folder
into `public_html/` (or your domain's web root) via FTP or the file
manager. Done.

**Netlify / Vercel / Cloudflare Pages:** drag-and-drop this folder, or
connect a git repo containing it. Build command: none. Publish directory:
the project root (where `index.html` lives).

**Nginx / Apache (your own VPS):** point the server's document root at
this folder. No special config needed beyond standard static-file serving.
Example Nginx server block:

```nginx
server {
  listen 80;
  server_name pinkbooktechnologies.com www.pinkbooktechnologies.com;
  root /var/www/pinkbook-production;
  index index.html;
}
```

Before going live, update these placeholders:

| What | Where | Search for |
|---|---|---|
| Domain in meta/OG tags | `index.html` `<head>` | `pinkbooktechnologies.com` |
| Sitemap domain | `sitemap.xml` | `pinkbooktechnologies.com` |
| Robots sitemap line | `robots.txt` | `pinkbooktechnologies.com` |
| Contact email | `index.html` Contact section | `hello@pinkbooktechnologies.com` |
| Phone number | `index.html` Contact section | `+1 (555) 123-4567` |
| Office address | `index.html` Contact section | `120 Innovation Drive` |
| Social links | `index.html` Contact + Footer | `href="#"` next to `in` / `X` / `gh` |

## Editing content

Everything is in `index.html` — sections are clearly commented
(`<!-- ================= SECTION NAME ================= -->`). Find the
section, edit the text directly. No templating, no build step to re-run.

### Sections, in order
1. Header / navigation
2. Hero
3. Services (overview cards)
4. Services detail (sticky-nav + 6 full breakdowns with interactive mockups)
5. About (3D rotating hexagon carousel + accordion)
6. Work (6 portfolio case-study cards)
7. Process (scroll-driven vertical timeline)
8. Testimonials
9. CTA band ("What happens next" + booking CTAs)
10. Contact (form + details)
11. Footer

## Customization quick-reference

- **Brand colors / fonts**: CSS variables at the top of `css/style.css`
  under `:root` — change `--color-accent` (teal) and `--color-accent-2`
  (pink) to re-theme the entire site in one place.
- **Logo**: inline SVG in the header/footer of `index.html` (search for
  `logo-mark`). Also update `images/favicon/favicon.svg` and regenerate
  the PNG/ICO variants if you change it (any online favicon generator
  works, or ask Claude to regenerate them from a new SVG/logo).
- **Scroll feel**: `js/lenis-bridge.js` — `duration`, `easing`,
  `wheelMultiplier` in the Lenis constructor.
- **Animations**: `js/main.js` and `js/services.js` contain clearly
  named `init...()` functions per feature (hero canvas, 3D carousel,
  process timeline, accordion, sticky nav, etc).

## Favicon files

Generated from `images/favicon/favicon.svg` (the source of truth — edit
this one and regenerate the rest if the logo changes):

| File | Size | Used for |
|---|---|---|
| `favicon.svg` | vector | Modern browsers (primary) |
| `favicon-16.png` / `favicon-32.png` | 16/32px | Browser tab fallback |
| `favicon-48.png` | 48px | Windows taskbar |
| `favicon-180.png` | 180px | Apple touch icon (iOS homescreen) |
| `favicon-192.png` / `favicon-512.png` | 192/512px | Android / PWA manifest |
| `favicon.ico` | multi-size | Legacy browser fallback |

## Browser support / notes

- Respects `prefers-reduced-motion` — animations are skipped/instant for
  users who request reduced motion; content is never hidden.
- Custom cursor, magnetic buttons, and 3D card tilt auto-disable on
  touch devices.
- If any animation library fails to load for any reason (offline, blocked
  script), all content still displays — no permanently-hidden sections.
- No build tools, no npm packages required at runtime. The only "vendor"
  dependencies are the four files in `js/vendor/`, already included.
