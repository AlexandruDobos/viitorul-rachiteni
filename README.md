# ACS Viitorul Răchiteni — Website & Mini-Platform | www.viitorulrachiteni.ro

Modern web app for a local football club: news, results, fixtures, squad, player profiles, per-match stats, donations, and contact. Front-end in **React + Tailwind**, back-end in **Java/Spring Boot**, fronted by an **NGINX gateway**. Built with a focus on **performance, accessibility, and SEO**.

---

## What the app delivers

- **Home**  
  Compact hero; latest **News** in a carousel with **arrows** (no autoplay), **Next Match**, and a **Players** carousel (1/2/4 per frame by breakpoint).
- **News**  
  Paginated list with search; article detail with clean slug, Open Graph/Twitter previews, and JSON-LD.
- **Squad**  
  Filter by **position** and **name/number**; responsive cards with shirt number & position; player name always visible.
- **Player Profile**  
  Portrait, position/number, **per-match statistics** (desktop table / mobile cards). SEO: JSON-LD `Person`.
- **Matches, Results, Standings**  
  Dedicated pages with clear, consistent layout.
- **Donations**  
  Flow with **success/cancel** pages; payment processor integration handled server-side.
- **Contact**  
  Validated form; message persistence + email relay via the email service.  
  ✅ **Google Maps loads only on Contact** (not in footer) to protect LCP.
- **Admin**  
  Secure content management area (RequireAdmin + Google OAuth).
- **Legal & UX**  
  Terms, Privacy, Cookies; cookie banner; left/right ad rails loaded lazily.

---

## Architecture

The system is based on microservices, all fronted by an NGINX gateway:

- **Gateway (NGINX)**  
  Reverse proxy for APIs and static assets. Handles brotli/gzip compression, HTTP/2, caching, and security headers (HSTS, no-sniff, XSS protection).  
  `index.html` includes resource hints (`dns-prefetch`, `preconnect`) for CDN and API.

- **app-service (Spring Boot)**  
  Provides REST endpoints with DTOs (`PlayerDTO`, `AnnouncementDTO`, …). Includes pagination & search for news, per-player stats, and soft-delete for players (activate/deactivate).

- **donations-service**  
  Manages secure redirect to the payment processor and validates callbacks. Provides front-end success/cancel pages.

- **auth-service**  
  Handles admin authentication and authorization. Integrates with Google OAuth for the front-end.

- **email-service**  
  Stores contact messages and relays them via SMTP/SendGrid. Ensures no secrets are exposed in the front-end.

---

## Front-end highlights

- **Stack**: React 18, Vite, React Router, Tailwind CSS, Framer Motion (light use), Google OAuth.
- **Core components**:  
  `HeroTitle`, `AnnouncementsSection`, `NextMatchSection`, `PlayersCarousel` (arrows, swipe, no autoplay),  
  `PlayerDetails` (per-match stats), `AnnouncementDetail`, `RouteMetaManager`, `JsonLd`, `CookieBanner`.
- **Layouts**: `PublicLayout` and `AdminLayout` with a three-column shell and lazy sticky ad rails.
- **Images**: Prefer AVIF/WebP, fixed width/height to eliminate CLS. First visible image on home uses eager loading + high fetch priority.

---

## Performance

- Parallel fetches for critical home content (announcements + next match).
- Reserved dimensions and prioritized hero media for LCP.
- Deferral of non-critical widgets (ads, social) with `requestIdleCallback`.
- Minimal main-thread blocking; passive listeners for scroll/touch.
- Global overflow guard to prevent accidental horizontal scroll.
- No runtime errors or console noise.

---

## Accessibility (A11y)

- Correct heading hierarchy (`<h2>` for home cards, `<h3>` for list items).
- Visible focus states, ARIA labels, semantic buttons/links.
- Minimum 44px hit targets for all interactive elements.
- Carousels: arrows on desktop, swipe on mobile, no autoplay.

---

## SEO & Share

- Dynamic meta per route (title, description, canonical, OG/Twitter).
- JSON-LD structured data:  
  - Global: `Organization`, `WebSite`  
  - News: `Article`  
  - Player: `Person`  
  - Contact: `ContactPage`
- Clean slugs and reliable social previews.

---

## Data & Domain Model

- **Players**  
  Fields: id, name, position, shirtNumber, portrait, active flag.  
  Endpoints:  
  - `GET /api/app/players?activeOnly=true`  
  - `GET /api/app/players/{id}`  
  - `PATCH /api/app/players/{id}/activate|deactivate`

- **Announcements (news)**  
  Fields: cover image, title, text.  
  Endpoints:  
  - `GET /api/app/announcements/page`  
  - `GET /api/app/announcements/{id}`

- **Matches & Stats**  
  Metrics aggregated per match, responsive rendering.  
  Endpoint: `GET /api/app/matches/player/{playerId}/stats`

- **Contact messages**  
  Client-side validation, persisted and emailed by email-service.  
  Endpoint: `POST /api/app/contact/messages`

---

## Security & Compliance

- Admin gated by RequireAdmin + Google OAuth.
- Payments & email processed server-side only.
- Security headers and tunable CSP at the gateway.
- Cookie banner, Terms, Privacy, and Cookies pages included.

---

## Implementation details that matter

- Carousels use arrows/swipe only, no autoplay.
- Home news card’s first image prioritized for LCP.
- Google Map removed from footer, loaded only on Contact page.
- Index HTML includes sensible defaults and resource hints.
- Strict zero-CLS policy with reserved layout space.

---

## Roadmap (extensions)

- Advanced analytics: xG/xA, rolling averages, shot maps, heatmaps.
- Live match center: real-time feed for events/goals/cards.
- Head-to-head stats, trends, and injury/suspension flags.
- Media hub: photo/video galleries with deep links.
- Global search with typeahead across content.
- Internationalization (RO/EN) and scheduled publishing.
- PWA support: install prompt and offline shell.

---

## Tech at a glance

- **Front-end**: React 18, Vite, React Router, Tailwind CSS, Framer Motion, Google OAuth  
- **Back-end**: Java + Spring Boot microservices: app-service, donations-service, auth-service, email-service  
- **Gateway/Infra**: NGINX reverse proxy, brotli/gzip, HTTP/2, security headers, CDN for images

---

## Contact

**Phone:** +40 733 305 547  
**Email:** dobosalexandru2502@gmail.com
