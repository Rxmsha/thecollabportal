# TheCollabPortal - TODO List

This document tracks all integration tasks for TheCollabPortal (formerly GetRealtorConnect / Preferred Partner Tools).

---

## Kelly's Vision Summary

**What It Is:** A co-branded platform where mortgage agents invite Realtor partners to access tools, AI assistants, and marketing resources. Each mortgage agent has their own sub-portal. The goal: Help mortgage agents look like heroes to their Realtors by giving them done-for-you marketing leverage.

**Reference:** In April 2025 it was working 70% - [Loom Video](https://www.loom.com/share/d949cfc9f61940479ea6b00345a55129)

**Key URLs:**
- Sales Page: getrealtorconnect.com
- Portal: thecollabportal.com
- Sample Realtor View: https://kellys-collab-portal.lovable.app/
- Sample Agent View: https://kellys-collab-portal.lovable.app/mortgage-agent-dashboard

**Core Features:**
- [ ] Each agent has own sub-portal (`kellyhaick.thecollabportal.com` or `/kellyhaick`)
- [ ] Realtors log in through agent's portal → everything co-branded (mortgage agent + realtor)
- [x] AI assistants and content generators
- [x] Marketing resources (templates)
- [ ] Links to recommended tools with affiliate revenue opportunities

---

## Implementation Status vs Kelly's Vision

### What's Working
- [x] Admin can create agents manually
- [x] Agents can log in and set up branding (logo, color, bio, links)
- [x] Agents can invite realtors (with seat limits)
- [x] Realtors receive invite email, log in, change password, become active
- [x] Seat tracking (active + invited count toward seats_used)
- [x] Agent/Admin can deactivate, reactivate, delete realtors
- [x] Resend invite functionality
- [x] Template library with categories
- [x] Template notification emails to realtors
- [x] AI tools for agents and realtors
- [x] Calculators (Bendigi embeds)
- [x] Toast notifications

### Conflicts / Not Yet Implemented
| Feature | Kelly's Vision | Current State |
|---------|---------------|---------------|
| Agent Subdomains | `kellyhaick.thecollabportal.com` or `/kellyhaick` | Not implemented - all users share same URL |
| Multiple Logos/Headshots | Up to 3 logos + 3 headshots with default selection | Single logo only |
| Seat Packs | Base 50 + purchasable packs (50 each) | Fixed seat_limit per agent |
| Affiliate Toolkit | `/go/:slug` redirects with UTM + click tracking | Not implemented |
| Usage Logging | Full generation logging + 30-day summary | Partial - usage_logs table exists but not fully used |
| Stripe Integration | Full subscription flow with webhooks | Not implemented (admin creates agents manually) |
| Public Pages | Terms, Privacy, Help/FAQ, Cookies | Not implemented |
| AI Tool Names | Specific branding (Showcase, Spotlight, etc.) | Generic tool names |
| "Start Here" Tour | Mini onboarding tour for realtors | Not implemented |
| WeWeb | Kelly's old plan used WeWeb | Using Next.js (custom code) - KEEP THIS |
| Helcim | Old payment processor | Changed to Stripe |

---

## Current Priority: Agent Onboarding Workflow

### What's Done
- [x] Kelly (admin) can manually create agents from admin portal
- [x] Agent records created in `agents` table
- [x] User records created in `users` table with `role=agent`
- [x] Temp password generated and displayed to Kelly
- [x] Agents can log in with credentials
- [x] Agents list displays in admin portal
- [x] Demo login buttons removed from login page
- [x] Signup page disabled (redirects to login)

---

## 1. Agent Subdomains / Custom URLs

**Kelly's Vision:** Each agent has `kellyhaick.thecollabportal.com` or `thecollabportal.com/kellyhaick`

| Status | Task |
|--------|------|
| [ ] | Add `slug` field to agents table (unique URL identifier) |
| [ ] | Create public agent landing page at `/[slug]` |
| [ ] | Realtor login redirects to their agent's branded portal |
| [ ] | Agent branding (logo, color) applied to their portal |
| [ ] | Optional: Subdomain routing (kellyhaick.thecollabportal.com) |

---

## 2. Payment Flow (Stripe)

### Pricing
- **Base Plan:** $97/month (includes 50 realtor seats)
- **Seat Pack Add-on:** $50/month per additional block of 50 realtors

### Subscription Setup
| Status | Task |
|--------|------|
| [ ] | Set up Stripe account and get API keys |
| [ ] | Create base subscription product ($97/month) |
| [ ] | Create seat pack add-on product ($50/month per 50 seats) |
| [ ] | Base plan: 50 seats included |
| [ ] | Seat pack add-on: 50 seats per pack |

### Payment Page
| Status | Task |
|--------|------|
| [ ] | Create payment/signup page at `/subscribe` |
| [ ] | Form fields: first name, last name, email, company name (optional) |
| [ ] | Integrate Stripe Checkout or Payment Element |
| [ ] | Handle successful payment redirect |

### Post-Payment Automation (Webhooks)
| Status | Task |
|--------|------|
| [ ] | `checkout.session.completed` → create agent + user |
| [ ] | Generate random password |
| [ ] | Send welcome email with credentials |
| [ ] | `customer.subscription.updated` → update seat packs |
| [ ] | `customer.subscription.deleted` → set agent status to suspended |

### Seat Packs ($50/month per 50 seats)
| Status | Task |
|--------|------|
| [ ] | Add `base_seats` (default 50) and `seat_packs` fields to agents |
| [ ] | Calculate `seats_total = base_seats + (seat_packs * 50)` |
| [ ] | API endpoint: `GET /agents/me/limits` |
| [ ] | UI for purchasing additional seat packs |
| [ ] | Stripe metered billing or quantity-based add-on |

---

## 3. Email Templates (SendGrid)

### Setup
| Status | Task |
|--------|------|
| [x] | Create SendGrid account |
| [x] | Authenticate sending domain (SPF + DKIM) |
| [x] | Get API key and add to environment |
| [x] | Create email templates in SendGrid |

### Templates Needed
| Status | Template | Description |
|--------|----------|-------------|
| [ ] | Agent Signup Confirm | Welcome email after payment |
| [x] | Realtor Invite | Onboarding email with temp password (d-e49964b80f60429eb72e5937ce35d44b) |
| [x] | Password Reset | For active realtors |
| [x] | Reactivation | For inactive realtors |
| [x] | Template Drop | New resource notification |
| [ ] | Contact Form | Realtor → Agent message |
| [ ] | Subscription Paused | When payment fails |

**Branding Rule:** All emails should have agent's logo/color. If agent has none, use default palette.

---

## 4. Agent Dashboard & Settings

### Agent Dashboard Page
| Status | Task |
|--------|------|
| [x] | Welcome message with agent name |
| [x] | Stats: total realtors, seats used/limit |
| [x] | Quick actions: Invite Realtor, View Realtors |
| [ ] | Usage summary (last 30 days of AI generations) |

### Agent Branding Settings
| Status | Task |
|--------|------|
| [x] | Form fields: phone, brand color, calendly link, CMA link, bio |
| [x] | Single logo upload with preview |
| [ ] | **NEW:** Up to 3 logos with default selection |
| [ ] | **NEW:** Up to 3 headshots with default selection |
| [x] | Save changes to agent record |

### Change Password
| Status | Task |
|--------|------|
| [x] | Current password verification |
| [x] | New password + confirm password fields |
| [x] | First login password change flow |

---

## 5. Realtor Invitation Flow

### Invite Form (Agent Side)
| Status | Task |
|--------|------|
| [x] | Form fields: first name, last name, email, brokerage, phone |
| [x] | Check seats used < seat limit before allowing invite |
| [x] | Shows current seat usage (X / Y seats used) |

### Backend Processing
| Status | Task |
|--------|------|
| [x] | Generate temp password for realtor |
| [x] | Create `users` record (role = "realtor") |
| [x] | Create `realtors` record (status = "invited") |
| [x] | Increment agent's `seats_used` |
| [x] | Send co-branded invite email via SendGrid |
| [x] | Prevent duplicate invites |

### Realtor Management (Agent Side)
| Status | Task |
|--------|------|
| [x] | View list of invited/active/inactive realtors |
| [x] | Search and filter realtors |
| [x] | Resend invite email (for invited status) |
| [x] | Deactivate realtor (for active AND invited status) |
| [x] | Reactivate realtor (for inactive status) |
| [x] | Reset password (for active status) |
| [x] | Toast notifications for actions |

---

## 6. Realtor Experience

### Realtor Dashboard
| Status | Task |
|--------|------|
| [x] | Welcome message with agent branding |
| [x] | Agent banner (logo, name, contact info) |
| [x] | Templates library |
| [x] | AI Tools section |
| [x] | About Your Mortgage Partner section |
| [ ] | **NEW:** "Start Here" mini onboarding tour |

### About Your Mortgage Partner Section
| Status | Task |
|--------|------|
| [x] | Agent logo and name |
| [x] | Agent bio |
| [x] | Book a Call (Calendly link) |
| [x] | Request a CMA (CMA link) |
| [ ] | Send a Referral (popup form) |
| [ ] | Download My App (Canadian Mortgage App link) |
| [ ] | OneWell Landing Page link |

### Contact Agent Form
| Status | Task |
|--------|------|
| [ ] | Simple message form |
| [ ] | Sends email to agent via SendGrid |

---

## 7. AI Assistants

**Kelly's Vision:** Specific branding for each tool with structured outputs.

### Realtor AI Tools
| Status | Tool Name | Inputs | Outputs |
|--------|-----------|--------|---------|
| [x] | **Showcase – Listing Specialist** | Address, specs, tone, up to 3 photos | MLS desc, social caption, 30-60s video script |
| [x] | **Spotlight – Social Specialist** | Post type, key details, platform, photos | Caption, keyword suggestions, Reels script |
| [x] | **Seller Insight – Reporting Specialist** | Views, saves, inquiries, feedback | Seller update email + next steps |
| [x] | **Client Concierge – Relationship Specialist** | Occasion, notes, format | 2-3 sentence message + CTA |

### Agent AI Tools
| Status | Tool Name | Inputs | Outputs |
|--------|-----------|--------|---------|
| [x] | **FilePrep – Deal Notes Specialist** | Raw notes, goal (purchase/refi/renewal) | Underwriter notes, client recap, red-flags |
| [x] | **Content Coach – Personal Brand Specialist** | Topic, tone, key point | LinkedIn post, IG caption, email snippet |

### AI Features
| Status | Task |
|--------|------|
| [x] | Create `/api/generate` backend route |
| [x] | Connect to OpenAI API |
| [x] | Handle different tool prompts |
| [ ] | "Copy" button on all outputs |
| [ ] | "Send via Email" button (opens modal, uses SendGrid) |
| [ ] | Rate limiting (20/hour per user) |
| [ ] | **Compliance:** System prompt with Canadian mortgage tone, "review before use" |

---

## 8. Templates Library

### Admin Template Management
| Status | Task |
|--------|------|
| [x] | Create template form with all fields |
| [x] | Categories: Listing, Social, Email, Video, Document |
| [x] | Formats: Canva, PDF, Google Doc, Video |
| [x] | Audience: Mortgage Agents, Realtors, Both |
| [x] | Status: Draft / Published |
| [x] | Publish template action |

### Template Drop Automation
**Kelly's Key Feature:** When admin drops content, ALL agents' realtors get notified. Email appears from their agent.

| Status | Task |
|--------|------|
| [x] | Agent can send template notifications to their realtors |
| [ ] | **Admin global drop:** Notify all realtors across all agents |
| [ ] | Email appears to come from each realtor's linked agent |
| [ ] | Weekly/regular content drops by Kelly |

---

## 9. Affiliate Toolkit

**Kelly's Vision:** Cards by category with redirect tracking and kickback revenue.

### Setup
| Status | Task |
|--------|------|
| [ ] | Create `affiliate_links` table: id, name, slug, category, default_url, active |
| [ ] | Categories: Mortgage, Automation, Voice/Video, Content, Property |
| [ ] | API: `GET /affiliates?active=true` |

### Redirect & Tracking
| Status | Task |
|--------|------|
| [ ] | Create `/go/:slug` redirect endpoint |
| [ ] | Add UTM parameters to redirect URL |
| [ ] | Log clicks (user_id, agent_id, timestamp) |
| [ ] | Optional: Per-agent URL override |

### UI
| Status | Task |
|--------|------|
| [ ] | Toolkit page with cards by category |
| [ ] | "Open" button links to `/go/:slug` |

### Partnerships to Set Up
| Status | Partner | Benefit |
|--------|---------|---------|
| [ ] | Bendigi (Calculators) | 20% discount for agents, kickback to Kelly |
| [ ] | Canadian Mortgage App | Discount + kickback |
| [ ] | OneWell | Integration + kickback |

---

## 10. Calculators

| Status | Task |
|--------|------|
| [x] | Mortgage calculator (Bendigi embed) |
| [x] | Purchase calculator |
| [x] | Closing costs calculator |
| [ ] | Land transfer tax calculator |
| [ ] | Required income calculator |
| [ ] | "Get this through your website" CTA → Bendigi affiliate link |

---

## 11. Usage Logging & Analytics

| Status | Task |
|--------|------|
| [ ] | Log every AI generation: user_id, agent_id, realtor_id, assistant_id, timestamp |
| [ ] | API: `GET /usage/summary?agent_id=me` (last 30 days) |
| [ ] | Agent dashboard widget showing usage stats |
| [ ] | Admin view of usage across all agents |

---

## 12. Admin Dashboard (Kelly)

### Stats Dashboard
| Status | Task |
|--------|------|
| [x] | Total active agents |
| [x] | Total active realtors |
| [x] | Templates published |
| [ ] | Emails sent (past 30 days) |
| [ ] | AI generations (past 30 days) |

### Agent Management
| Status | Task |
|--------|------|
| [x] | View all agents with search/filter |
| [x] | Create new agent |
| [x] | Reset agent password |
| [x] | View agent details modal |
| [x] | Recalculate seats for all agents |
| [ ] | Seat override (manually set seats) |
| [ ] | View agent's subscription status |

### Realtor Management
| Status | Task |
|--------|------|
| [x] | View all realtors with search/filter |
| [x] | View realtor details modal |
| [x] | Reset realtor password |
| [x] | Deactivate/Reactivate realtor |
| [x] | Resend invite for invited realtors |
| [x] | Delete realtor |

### Global Template Drop
| Status | Task |
|--------|------|
| [ ] | "Drop to All" button on template |
| [ ] | Sends notification to ALL realtors across ALL agents |
| [ ] | Each email branded with realtor's linked agent |

---

## 13. Public Pages

| Status | Page | Notes |
|--------|------|-------|
| [ ] | `/terms` | Terms of Use |
| [ ] | `/privacy` | Privacy Policy |
| [ ] | `/help` | FAQ / Help page |
| [ ] | Cookies notice | Banner/popup |

---

## 14. Legal & Compliance

| Status | Task |
|--------|------|
| [ ] | FSRA disclaimer on agent-facing screens |
| [ ] | "AI content is for review. Verify facts before sending." on all AI outputs |
| [ ] | No legal/tax advice disclaimer on calculators |
| [ ] | MLS/FSRA reminders where relevant |

---

## Seats Management

| Status | Task |
|--------|------|
| [x] | `seats_used` counts both "active" + "invited" realtors |
| [x] | Invite realtor increments seats_used |
| [x] | Deactivate realtor decrements seats_used |
| [x] | Reactivate realtor increments seats_used |
| [x] | Delete realtor recalculates seats_used |
| [x] | Admin can recalculate seats for all agents |
| [x] | UI shows correct seat count |
| [ ] | **NEW:** Seat packs system (base 50 + purchasable packs) |

---

## Xano Database Tables

| Status | Table | Fields |
|--------|-------|--------|
| [x] | **users** | id, email, password, name, role, agent_id, first_login, created_at |
| [x] | **agents** | id, user_id, first_name, last_name, email, phone, company_name, status, brand_color, logo_url, calendly_link, cma_link, bio, seat_limit, seats_used |
| [x] | **realtors** | id, agent_id, user_id, first_name, last_name, email, brokerage, phone, status, invite_sent_at, activated_at |
| [x] | **templates** | id, title, category, format, audience, short_description, preview_image_url, download_link, status, published_at |
| [x] | **usage_logs** | id, event_type, agent_id, realtor_id, template_id, details, created_at |
| [x] | **error_logs** | id, source, scenario_name, message, severity, resolved |
| [ ] | **affiliate_links** | id, name, slug, category, default_url, active |
| [ ] | **generations** | id, user_id, agent_id, realtor_id, assistant_id, created_at |
| [ ] | **plans** | id, name, base_seats (50), pack_size (50), base_price ($97), pack_price ($50) |
| [ ] | **billing_events** | id, agent_id, event_type, stripe_event_id, created_at |

**NEW fields needed on agents:**
- `slug` (unique URL identifier)
- `base_seats` (default 50)
- `seat_packs` (number of additional packs purchased)
- `headshot_urls` (array of up to 3)
- `logo_urls` (array of up to 3)
- `default_logo_idx`
- `default_headshot_idx`
- `stripe_customer_id`
- `subscription_status`

---

## External Integrations

### Stripe (Payments) - Priority
| Status | Feature |
|--------|---------|
| [ ] | Create Stripe account and products |
| [ ] | Base plan: $97/month (50 seats) |
| [ ] | Seat pack add-on: $50/month per 50 additional seats |
| [ ] | Webhook endpoint for subscription events |
| [ ] | Customer portal for billing management |

### SendGrid (Emails)
| Status | Feature |
|--------|---------|
| [x] | Account setup + domain authentication |
| [x] | Realtor Invite template |
| [x] | Template Drop notification |
| [ ] | Agent Welcome email |
| [ ] | Contact Form email |
| [ ] | Subscription Paused email |

### OpenAI (AI Tools)
| Status | Feature |
|--------|---------|
| [x] | API key setup |
| [x] | Generate endpoint |
| [x] | All tool prompts |
| [ ] | Rate limiting |
| [ ] | Usage logging |

### Partnerships
| Status | Partner | Integration |
|--------|---------|-------------|
| [x] | Bendigi | Calculator embeds |
| [ ] | Bendigi | Affiliate tracking |
| [ ] | Canadian Mortgage App | Affiliate link |
| [ ] | OneWell | Affiliate link |

---

## Tech Stack Notes

**Current Stack (KEEP):**
- Frontend: Next.js (custom code)
- Backend: Xano
- Auth: Xano JWT
- Email: SendGrid
- Payments: Stripe (to implement)

**NOT Using (from old plans):**
- ~~WeWeb~~ → Using Next.js
- ~~Circle~~ → Custom portal
- ~~Helcim~~ → Stripe

---

## Testing Checklist

| Test | Status |
|------|--------|
| [x] | Admin creates agent → user + agent created |
| [x] | Agent uploads branding → settings saved |
| [x] | Agent invites realtor → email sent, seats incremented |
| [x] | Realtor logs in → password change, status active |
| [x] | Agent deactivates realtor → seats decremented |
| [x] | Agent reactivates realtor → new password sent |
| [x] | Agent resends invite → email resent |
| [x] | Admin deletes realtor → removed, seats recalculated |
| [ ] | Agent subscribes via Stripe → auto account creation |
| [ ] | Subscription cancelled → agent suspended |
| [ ] | Global template drop → all realtors notified |
| [ ] | Affiliate click → redirect with tracking |

---

## Priority Order (Suggested)

1. **Agent Subdomains/Slugs** - Core branding feature
2. **Stripe Integration** - Enable self-service signups
3. **Global Template Drop** - Kelly's key automation
4. **Affiliate Toolkit** - Revenue generation
5. **Multiple Logos/Headshots** - Enhanced branding
6. **Usage Logging** - Analytics
7. **Public Pages** - Legal compliance
8. **"Start Here" Tour** - Onboarding UX

---

## Out of Scope (Future Phases)

Kelly mentioned these features for later phases:

| Feature | Notes |
|---------|-------|
| [ ] | **Placid/Canva Templates** - Automated template generation with dynamic branding |
| [ ] | **Advanced Analytics Dashboard** - Deeper usage insights and reporting |
| [ ] | **White-label Mobile App** - Native app for realtors |
| [ ] | **CRM Integration** - Connect with popular real estate CRMs |
| [ ] | **Automated Content Scheduling** - Schedule AI-generated posts |

---

## UI Design Reference (QuickPath Inspired)

**Source:** `extracted-quickpath-ui-reference/` folder (add to .gitignore)

### Color Palette

| Variable | Hex | Usage |
|----------|-----|-------|
| `--deep-navy` | `#1a2332` | Primary text, headings, foreground |
| `--pure-white` | `#FFFFFF` | Backgrounds, card backgrounds |
| `--light-bg` | `#f8f9fa` | Secondary backgrounds, muted areas |
| `--bc-teal` | `#0077B6` | Primary brand color, buttons, links, focus rings |
| `--success-green` | `#10b981` | Success states, accents, active indicators |
| `--soft-grey` | `#e5e7eb` | Borders, input borders, dividers |
| `--text-grey` | `#6b7280` | Muted text, descriptions, placeholders |
| `--destructive` | `#ef4444` | Error states, destructive actions |

### Typography

| Element | Style |
|---------|-------|
| **Font Family** | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| **Headings (H1-H3)** | Use `.dot-matrix` class: `font-family: 'Courier New', monospace; letter-spacing: 0.1em; text-transform: uppercase;` |
| **H1 (Page Title)** | `dot-matrix text-3xl mb-2` (uppercase, monospace, large) |
| **H2 (Section Title)** | `dot-matrix text-xl mb-6` or `dot-matrix text-lg mb-4` |
| **H3 (Card Title)** | `dot-matrix text-sm mb-1` or `font-mono text-lg tracking-wider uppercase` |
| **Body Text** | Regular Inter font, `text-sm` |
| **Muted/Description** | `text-sm text-muted-foreground` or `text-xs text-muted-foreground` |
| **Stats/Numbers** | `dot-matrix text-2xl` (monospace, prominent) |

### Button Styles

| Variant | Classes |
|---------|---------|
| **Primary (Default)** | `bg-primary text-primary-foreground hover:bg-primary/90` (teal background) |
| **Destructive** | `bg-destructive text-destructive-foreground hover:bg-destructive/90` (red background) |
| **Outline** | `border border-input bg-background hover:bg-muted` (transparent with border) |
| **Secondary** | `bg-secondary text-secondary-foreground hover:bg-secondary/80` (light grey background) |
| **Ghost** | `hover:bg-muted` (no background until hover) |
| **Link** | `text-primary underline-offset-4 hover:underline` |

**Button Sizes:**
- Default: `h-10 px-4 py-2`
- Small: `h-8 px-3 text-xs`
- Large: `h-12 px-8`
- Icon: `h-9 w-9`

**Button Typography:** `text-sm font-medium tracking-wide`

### Card Design

| Element | Style |
|---------|-------|
| **Card Container** | `border border-border bg-card` (no rounded corners, sharp industrial look) |
| **Card Header** | `flex flex-col space-y-1.5 p-6` |
| **Card Title** | `font-mono text-lg tracking-wider uppercase` |
| **Card Content** | `p-6 pt-0` |
| **Hover State** | `hover:bg-muted/50 transition-colors` |

### Form Inputs

| Element | Style |
|---------|-------|
| **Input** | `h-10 w-full border border-input bg-background px-3 py-2 text-sm` |
| **Focus State** | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` |
| **Placeholder** | `placeholder:text-muted-foreground` |
| **Disabled** | `disabled:cursor-not-allowed disabled:opacity-50` |

### Layout Patterns

| Pattern | Usage |
|---------|-------|
| **Page Header** | `<div className="mb-8"><h1 className="dot-matrix text-3xl mb-2">TITLE</h1><p className="text-muted-foreground">Description</p></div>` |
| **Stats Grid** | `grid md:grid-cols-4 gap-6` with bordered cards |
| **Two Column Layout** | `grid lg:grid-cols-2 gap-8` |
| **Action Cards** | `border border-border p-6 hover:bg-muted/50` with arrow icon |
| **Progress Bar** | `<div className="w-full h-2 bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: '50%' }} /></div>` |

### Icon Styling

| Context | Style |
|---------|-------|
| **In Stat Cards** | `w-10 h-10 bg-{color}-100 rounded flex items-center justify-center` + `w-5 h-5 text-{color}-600` |
| **Inline with Text** | `w-4 h-4 text-muted-foreground` |
| **Action Indicators** | `w-5 h-5` or `w-4 h-4` at end of row |

### Color Usage for States

| State | Background | Text | Border |
|-------|------------|------|--------|
| **Active/Success** | `bg-green-100` | `text-green-600` | - |
| **Warning/Pending** | `bg-yellow-100` | `text-yellow-600` | - |
| **Info/Primary** | `bg-blue-100` | `text-blue-600` | - |
| **Error/Danger** | `bg-red-50` | `text-red-600` | `border-red-200` |

### Design Principles

1. **Industrial/Technical Aesthetic** - Sharp corners (no border-radius on cards), monospace headings, grid patterns
2. **Minimal Color** - Primarily black/white/grey with teal as accent
3. **Uppercase Headings** - All section titles in uppercase with letter-spacing
4. **Clear Hierarchy** - Large stats numbers, distinct sections with borders
5. **Subtle Background Pattern** - Dot matrix pattern overlay (`body::before` with radial gradient)
6. **Consistent Spacing** - `p-6` for card padding, `gap-6` or `gap-8` for grids, `mb-8` for sections

### CSS Variables (for globals.css)

```css
:root {
  --deep-navy: #1a2332;
  --pure-white: #FFFFFF;
  --light-bg: #f8f9fa;
  --bc-teal: #0077B6;
  --success-green: #10b981;
  --soft-grey: #e5e7eb;
  --text-grey: #6b7280;

  --background: var(--pure-white);
  --foreground: var(--deep-navy);
  --card: var(--pure-white);
  --card-foreground: var(--deep-navy);
  --primary: var(--bc-teal);
  --primary-foreground: var(--pure-white);
  --secondary: var(--light-bg);
  --secondary-foreground: var(--deep-navy);
  --muted: var(--light-bg);
  --muted-foreground: var(--text-grey);
  --accent: var(--success-green);
  --accent-foreground: var(--pure-white);
  --destructive: #ef4444;
  --destructive-foreground: var(--pure-white);
  --border: var(--soft-grey);
  --input: var(--soft-grey);
  --ring: var(--bc-teal);
  --radius: 0.25rem;
}

.dot-matrix {
  font-family: 'Courier New', 'Courier', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

---

*Last updated: February 9, 2026*
*Source: Kelly's email Jan 31, 2026 + Loom video transcript*
