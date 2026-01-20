# TheCollabPortal - TODO List

This document tracks all integration tasks for TheCollabPortal (formerly GetRealtorConnect).

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

## 1. Payment Flow (Stripe)

### Subscription Setup
| Status | Task |
|--------|------|
| [ ] | Set up Stripe account and get API keys |
| [ ] | Create subscription product/price in Stripe |
| [ ] | Define seat limits per plan (e.g., 50 Realtors) |

### Payment Page
| Status | Task |
|--------|------|
| [ ] | Create payment/signup page at `/subscribe` or similar |
| [ ] | Form fields: first name, last name, email, company name (optional) |
| [ ] | Integrate Stripe Checkout or Payment Element |
| [ ] | Handle successful payment redirect |

### Post-Payment Automation
| Status | Task |
|--------|------|
| [ ] | Create webhook endpoint for `checkout.session.completed` |
| [ ] | On success: generate random password |
| [ ] | On success: create `users` record (email, hashed password, name = first + last, role = "agent") |
| [ ] | On success: create `agents` record (first_name, last_name, email, company_name, status = "active", seat_limit from plan) |
| [ ] | Link `agent_id` back to `users` record |
| [ ] | Trigger welcome email with credentials |
| [ ] | Log event to `usage_logs` (event: "agent_created") |

### Billing Management
| Status | Task |
|--------|------|
| [ ] | Webhook for `customer.subscription.updated` (plan changes) |
| [ ] | Webhook for `customer.subscription.deleted` (cancellation) |
| [ ] | Update agent status on subscription change (active → suspended → cancelled) |
| [ ] | Seat upgrade flow (increase seat_limit) |

---

## 2. Email Templates (SendGrid)

### Setup
| Status | Task |
|--------|------|
| [ ] | Create SendGrid account |
| [ ] | Authenticate sending domain (SPF + DKIM) |
| [ ] | Get API key and add to environment |
| [ ] | Create email templates in SendGrid |

### Agent Welcome Email
| Status | Task |
|--------|------|
| [ ] | Subject: "Welcome to TheCollabPortal" |
| [ ] | Body includes: login link, email, temporary password |
| [ ] | Placeholders: `{{AgentFirstName}}`, `{{Email}}`, `{{TempPassword}}`, `{{LoginURL}}` |

**Email Copy:**
```
Hi {{AgentFirstName}},

Your TheCollabPortal account is ready.

Here's what to do next:
1. Log in to your portal → {{LoginURL}}
2. Upload your logo and brand colour
3. Invite your Realtors using the embedded form

We'll handle all updates and notifications automatically.

— The TheCollabPortal Team
```

### Realtor Invite Email
| Status | Task |
|--------|------|
| [ ] | Subject: "{{MortgageAgentName}} has created your private Realtor portal" |
| [ ] | Body includes: invite link, agent info |
| [ ] | Placeholders: `{{RealtorFirstName}}`, `{{MortgageAgentName}}`, `{{InviteURL}}` |

**Email Copy:**
```
Hi {{RealtorFirstName}},

{{MortgageAgentName}} just invited you to a private partner space inside TheCollabPortal.

Inside, you'll find ready-to-use marketing templates, listing copy tools, and resources tailored for your business.

Click below to access your private portal:
[Access Portal] → {{InviteURL}}

— {{MortgageAgentName}}
```

### New Template Drop Email
| Status | Task |
|--------|------|
| [ ] | Subject: "New resource: {{TemplateTitle}}" |
| [ ] | Body includes: template title, description, link to portal |
| [ ] | Placeholders: `{{RealtorFirstName}}`, `{{MortgageAgentName}}`, `{{TemplateTitle}}`, `{{TemplateDescription}}`, `{{PortalURL}}` |

**Email Copy:**
```
Hi {{RealtorFirstName}},

I just added a new resource — {{TemplateTitle}} — to your private toolkit.

What's inside:
{{TemplateDescription}}

Open it here:
[View in Your Portal] → {{PortalURL}}

— {{MortgageAgentName}}
{{MortgageAgentCompany}}
```

### Contact Form Email (Realtor → Agent)
| Status | Task |
|--------|------|
| [ ] | Subject: "Message from {{RealtorName}}" |
| [ ] | Body includes: realtor name, message content |

### Subscription Paused/Cancelled Email
| Status | Task |
|--------|------|
| [ ] | Subject: "Your TheCollabPortal access is paused" |
| [ ] | Body includes: reason, link to update billing |

---

## 3. Agent Dashboard & Settings

### Agent Dashboard Page
| Status | Task |
|--------|------|
| [ ] | Welcome message with agent name |
| [ ] | Stats: total realtors, seats used/limit, templates accessed |
| [ ] | Quick actions: Invite Realtor, View Realtors, Access Templates |
| [ ] | Recent activity log |

### Agent Branding Settings
| Status | Task |
|--------|------|
| [ ] | Create settings page for logged-in agents |
| [ ] | Form fields: phone, brand color (color picker), logo upload, calendly link, CMA link, bio |
| [ ] | Logo upload with preview |
| [ ] | Save changes to agent record |
| [ ] | API endpoint: `PATCH /agents/me` |

### Change Password
| Status | Task |
|--------|------|
| [ ] | Current password verification |
| [ ] | New password + confirm password fields |
| [ ] | API endpoint: `POST /auth/change_password` |

---

## 4. Realtor Invitation Flow

### Invite Form (Agent Side)
| Status | Task |
|--------|------|
| [ ] | Form fields: first name, last name, email, brokerage (optional), phone (optional) |
| [ ] | Check seats used < seat limit before allowing invite |
| [ ] | API endpoint: `POST /invite_realtor` |

### Backend Processing
| Status | Task |
|--------|------|
| [ ] | Generate unique invite token |
| [ ] | Create `realtors` record (status = "invited", invite_sent_at = now) |
| [ ] | Increment agent's `seats_used` |
| [ ] | Send co-branded invite email via SendGrid |
| [ ] | Log event to `usage_logs` (event: "realtor_invited") |

### Invite Acceptance (Realtor Side)
| Status | Task |
|--------|------|
| [ ] | Create invite acceptance page at `/invite/{token}` |
| [ ] | Validate invite token |
| [ ] | Show agent branding on page |
| [ ] | Form: set password (password + confirm) |
| [ ] | On submit: create `users` record (role = "realtor") |
| [ ] | Update `realtors` record (status = "active", activated_at = now, user_id linked) |
| [ ] | Auto-login and redirect to realtor dashboard |
| [ ] | Log event to `usage_logs` (event: "realtor_activated") |

### Realtor Management (Agent Side)
| Status | Task |
|--------|------|
| [ ] | View list of invited/active realtors |
| [ ] | Resend invite email option |
| [ ] | Deactivate realtor option |

---

## 5. Realtor Experience

### Realtor Dashboard
| Status | Task |
|--------|------|
| [ ] | Welcome message: "Hi {{RealtorFirst}}, This is your private collaboration space with {{AgentName}}" |
| [ ] | Agent branding displayed (logo, color) |
| [ ] | Templates library (filtered by audience = "realtor") |
| [ ] | AI Tools section |
| [ ] | About Your Mortgage Partner section (agent info, booking links) |

### About Your Mortgage Partner Section
| Status | Task |
|--------|------|
| [ ] | Agent logo and name |
| [ ] | Agent bio |
| [ ] | Quick links: Book a Call (Calendly), Request a CMA, Email Agent |

### Contact Agent Form
| Status | Task |
|--------|------|
| [ ] | Simple message form |
| [ ] | Sends email to agent via SendGrid |

---

## 6. Templates Library

### Admin Template Management
| Status | Task |
|--------|------|
| [ ] | Create template form: title, category, format, audience, description, preview image, download link |
| [ ] | Template categories: Listing, Social, Email, Video, Document |
| [ ] | Template formats: Canva, PDF, Google Doc, Video |
| [ ] | Audience options: Mortgage Agents, Realtors, Both |
| [ ] | Status: Draft / Published |
| [ ] | Publish template action |

### Template Drop Automation
| Status | Task |
|--------|------|
| [ ] | When template status → Published |
| [ ] | For each active agent → get their active realtors |
| [ ] | Send co-branded "New Template" email to each realtor |
| [ ] | Log event to `usage_logs` (event: "template_published") |

---

## 7. AI Tools

### Mortgage Agent AI Tools
| Status | Task |
|--------|------|
| [ ] | FilePrep / Deal Notes Specialist - Turn call notes into underwriter summaries |
| [ ] | Content Coach / Brand Story Specialist - Draft posts and newsletters |
| [ ] | Renewal Email Builder - Create renewal outreach emails |
| [ ] | Referral Thank-You Note Writer - Generate thank-you messages |

### Realtor AI Tools
| Status | Task |
|--------|------|
| [ ] | Listing Copy Generator - Write MLS descriptions from property details |
| [ ] | Social Caption Builder - Turn facts into ready-to-post captions |
| [ ] | Relationship Message Creator - Create thoughtful notes for clients |
| [ ] | Seller Update Writer - Build seller update emails from showing feedback |

### AI Backend
| Status | Task |
|--------|------|
| [ ] | Create `/api/generate` backend route |
| [ ] | Connect to OpenAI API |
| [ ] | Handle different tool prompts |
| [ ] | Rate limiting per user |

---

## 8. Admin Dashboard (Kelly)

### Stats Dashboard
| Status | Task |
|--------|------|
| [ ] | Total active agents |
| [ ] | Total active realtors |
| [ ] | Templates published |
| [ ] | Emails sent (past 30 days) |
| [ ] | Automation errors (last 24h) |

### Logs & Monitoring
| Status | Task |
|--------|------|
| [ ] | Usage logs view (filterable by event type) |
| [ ] | Error logs view (with resolve action) |
| [ ] | Agent activity overview |

---

## Xano Database Tables

| Status | Table | Fields |
|--------|-------|--------|
| [x] | **users** | id, email, password, name, role (admin/agent/realtor), agent_id (for realtors), created_at |
| [x] | **agents** | id, user_id, first_name, last_name, email, phone, company_name, status, brand_color, logo_url, calendly_link, cma_link, bio, seat_limit, seats_used, created_at, last_login |
| [x] | **realtors** | id, agent_id, user_id, first_name, last_name, email, brokerage, phone, status, invite_sent_at, activated_at, invite_token |
| [x] | **templates** | id, title, category, format, audience (array), short_description, preview_image_url, download_link, status, published_at, created_at, release_notes, created_by |
| [x] | **usage_logs** | id, event_type, agent_id, realtor_id, template_id, details, created_at |
| [x] | **error_logs** | id, source, scenario_name, message, severity, resolved, resolved_by, created_at |

---

## Xano API Endpoints

### Authentication
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | POST | `/auth/login` | Login & return auth token |
| [x] | GET | `/auth/me` | Get current user from token |
| [x] | POST | `/create_agent` | Admin creates new agent (generates temp password) |
| [ ] | POST | `/auth/change_password` | Change password (authenticated) |
| [ ] | POST | `/auth/accept_invite` | Realtor accepts invite & sets password |

### Admin Endpoints
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/dashboard_stats` | Dashboard stats (counts of agents, realtors, templates) |
| [x] | GET | `/agents` | List all agents (with auth verification) |
| [ ] | PATCH | `/agents/{id}` | Update agent status |
| [ ] | GET | `/realtors` | List all realtors |
| [ ] | GET | `/templates` | List templates |
| [ ] | POST | `/templates` | Create template |
| [ ] | PATCH | `/templates/{id}` | Update template |
| [ ] | POST | `/templates/publish` | Publish template (triggers email automation) |
| [ ] | GET | `/usage_logs` | Activity logs |
| [ ] | GET | `/error_logs` | Error logs |
| [ ] | POST | `/resolve_error_log` | Mark error resolved |

### Agent Endpoints
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/agents/me` | Get own agent profile |
| [ ] | PATCH | `/agents/me` | Update own branding (logo, color, links, bio, phone) |
| [ ] | GET | `/agents/me/stats` | Agent dashboard stats (realtors count, seats, etc.) |
| [ ] | GET | `/agents/me/realtors` | Get agent's realtors |
| [ ] | POST | `/invite_realtor` | Invite a realtor (checks seat limit) |
| [ ] | POST | `/resend_invite` | Resend realtor invite email |
| [ ] | POST | `/upload/image` | File upload (logos) |

### Realtor Endpoints
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/realtors/me` | Get own realtor profile |
| [ ] | GET | `/realtors/me/agent` | Get linked agent info (branding, contact) |
| [ ] | GET | `/templates` | Get realtor templates (filter by audience) |
| [ ] | POST | `/contact_agent` | Send message to agent |

### Invite Flow
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/invites/validate?token=xxx` | Validate invite token, return realtor + agent info |

### Stripe Checkout Endpoints
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | POST | `/create_checkout_session` | Create Stripe checkout session (public, no auth) |
| [ ] | GET | `/verify_checkout_session?session_id=xxx` | Verify checkout session after redirect |

**POST `/create_checkout_session` - Function Stack:**
```
Input: first_name, last_name, email, company_name (optional)
1. External API Request to Stripe: POST /v1/checkout/sessions
   - mode: "subscription"
   - payment_method_types: ["card"]
   - line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }]
   - customer_email: input.email
   - success_url: APP_URL/subscribe/success?session_id={CHECKOUT_SESSION_ID}
   - cancel_url: APP_URL/subscribe
   - metadata: { first_name, last_name, company_name }
2. Return: { checkout_url: session.url, session_id: session.id }
```

**GET `/verify_checkout_session` - Function Stack:**
```
Input: session_id (query param)
1. External API Request to Stripe: GET /v1/checkout/sessions/{session_id}
2. Return: { verified: true, email: session.customer_email, customer_id: session.customer }
```

### Webhooks (Stripe)
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | POST | `/webhooks/stripe` | Handle Stripe events (subscription created/updated/deleted) |

**POST `/webhooks/stripe` - Function Stack:**
```
Input: Stripe webhook payload (raw body)
1. Verify webhook signature using STRIPE_WEBHOOK_SECRET
2. Parse event type from payload
3. Handle event based on type:

   checkout.session.completed:
   - Extract customer email, metadata (first_name, last_name, company_name)
   - Generate random 12-char temporary password
   - Create users record: { email, password (hashed), name: first_name + " " + last_name, role: "agent" }
   - Create agents record: { user_id, first_name, last_name, email, company_name, status: "active", seat_limit: 50, seats_used: 0, stripe_customer_id }
   - Update users record with agent_id
   - Send welcome email via SendGrid with temp password
   - Log to usage_logs: { event_type: "agent_created", agent_id, details: "Stripe subscription" }

   customer.subscription.updated:
   - Find agent by stripe_customer_id
   - Update seat_limit based on new plan quantity
   - Log to usage_logs

   customer.subscription.deleted:
   - Find agent by stripe_customer_id
   - Update agent status to "cancelled"
   - Log to usage_logs

4. Return: { received: true }
```

---

## External Integrations

### Stripe (Payments)
| Status | Feature |
|--------|---------|
| [ ] | Create Stripe account and products |
| [ ] | Create price in Stripe Dashboard ($99/month) |
| [ ] | Add STRIPE_SECRET_KEY to Xano environment |
| [ ] | Add STRIPE_WEBHOOK_SECRET to Xano environment |
| [ ] | Create /create_checkout_session endpoint |
| [ ] | Create /verify_checkout_session endpoint |
| [ ] | Create /webhooks/stripe endpoint |
| [ ] | Test webhook locally using Stripe CLI |
| [ ] | Billing portal link for agents (use Stripe Customer Portal) |

### SendGrid (Emails)
| Status | Feature |
|--------|---------|
| [ ] | Account setup + domain authentication |
| [ ] | Add SENDGRID_API_KEY to Xano environment variables |
| [ ] | Create Agent Welcome email template (template ID: d-xxxxx) |
| [ ] | Create Realtor Invite email template (template ID: d-xxxxx) |
| [ ] | Create New Template Drop email template (template ID: d-xxxxx) |
| [ ] | Create Contact Form email template (template ID: d-xxxxx) |
| [ ] | Create Subscription Paused email template (template ID: d-xxxxx) |

**Xano SendGrid Integration:**
In Xano, use the External API Request function to call SendGrid:
```
POST https://api.sendgrid.com/v3/mail/send
Headers:
  - Authorization: Bearer {{SENDGRID_API_KEY}}
  - Content-Type: application/json
Body:
{
  "personalizations": [{
    "to": [{"email": "recipient@email.com"}],
    "dynamic_template_data": {
      "AgentFirstName": "John",
      "Email": "john@example.com",
      "TempPassword": "abc123xyz",
      "LoginURL": "https://app.thecollabportal.com/login"
    }
  }],
  "from": {"email": "noreply@thecollabportal.com", "name": "TheCollabPortal"},
  "template_id": "d-xxxxxxxxxxxx"
}
```

**Send Welcome Email Function (add to webhook/create_agent):**
```
1. Build email payload with dynamic data
2. External API Request to SendGrid
3. Log to usage_logs: { event_type: "email_sent", agent_id, details: "welcome_email" }
```

### OpenAI (AI Tools)
| Status | Feature |
|--------|---------|
| [ ] | API key setup |
| [ ] | Create `/api/generate` backend route |
| [ ] | Deal Notes Specialist prompt |
| [ ] | Content Coach prompt |
| [ ] | Email Builder prompt |
| [ ] | Thank You Notes prompt |
| [ ] | Listing Copy Generator prompt |
| [ ] | Social Caption Builder prompt |

### Bendigi (Calculators)
| Status | Feature |
|--------|---------|
| [ ] | Get embed codes for mortgage calculator |
| [ ] | Get embed codes for purchase calculator |
| [ ] | Get embed codes for closing cost calculator |

---

## File Storage (Xano)
| Status | Task |
|--------|------|
| [ ] | Configure file upload endpoint |
| [ ] | Set up `/logos` folder |
| [ ] | Set up `/templates` folder |
| [ ] | Return public URLs for uploaded files |

---

## Privacy & Permissions

### Rules
- Mortgage agents cannot see other agents or their Realtors
- Realtors cannot see each other or any other agent's materials
- Realtors are read-only (can view templates, cannot post/edit)
- Admins have full visibility

### Implementation
| Status | Task |
|--------|------|
| [ ] | All agent endpoints filter by authenticated user's agent_id |
| [ ] | All realtor endpoints filter by authenticated user's realtor_id |
| [ ] | Realtor templates filtered by audience includes "realtor" |
| [ ] | Verify realtor can only see their linked agent's info |

---

## Testing Checklist

| Test | Expected Result |
|------|-----------------|
| [ ] | New agent subscribes → user + agent created, welcome email sent |
| [ ] | Agent uploads branding → settings saved correctly |
| [ ] | Agent invites realtor → invite email sent, realtor record created |
| [ ] | Realtor accepts invite → can log in, sees agent branding |
| [ ] | New template published → all realtors receive co-branded email |
| [ ] | Realtors see only their agent's templates and info |
| [ ] | Agent can only see their own realtors |
| [ ] | Subscription cancelled → agent status updated |
| [ ] | AI tools return valid responses |

---

## Notes

- Xano Base URL: `https://xzkg-6hxh-f8to.n7d.xano.io/api:Y8CjHB2a`
- Authentication table: `users` (ID 39) - must have authentication ENABLED
- All authenticated endpoints need "users authentication" selected
- Always publish changes in Xano after editing endpoints
- All emails should be co-branded with agent's logo and color where applicable
- Footer for realtor-facing content: "This portal is maintained by {{AgentName}} through TheCollabPortal"

---

## Out of Scope (Future Phases)

- Multi-language support
- Mobile app
- Advanced analytics/heatmaps
- CRM/LOS integrations
- Bulk import/export
- SMS/WhatsApp notifications

---

*Last updated: January 20, 2026*
