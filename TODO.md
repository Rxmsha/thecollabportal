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
| [ ] | API endpoint: `POST /change_password` |

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

## Xano Database Tables (6 Active)

| Status | Table | ID | Fields |
|--------|-------|-----|--------|
| [x] | **users** | #39 | id, email, password, name, role (enum), agent_id, created_at |
| [x] | **agents** | #40 | id, user_id, first_name, last_name, email, phone, company_name, status (enum), brand_color, logo_url, calendly_link, cma_link, bio |
| [x] | **realtors** | #41 | id, agent_id, user_id, first_name, last_name, email, brokerage, phone, status (enum), created_at, invite_sent_at |
| [x] | **templates** | #42 | id, title, category (enum), format (enum), audience [text], short_description, preview_image_url, download_link, status (enum), published_at, created_at, release_notes, created_by |
| [x] | **usage_logs** | #43 | id, event_type (enum), agent_id, realtor_id, template_id, details (json), created_at |
| [x] | **error_logs** | #44 | id, source (enum), scenario_name, message, severity (enum), resolved (bool), resolved_by, created_at |

> Note: `mortgage_rates` table exists but is NOT being used (crossed out)

---

## Xano API Endpoints (52 Total)

### Authentication (4 endpoints)
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | GET | `/auth/me` | Private | Get current user from token |
| [x] | POST | `/auth/login` | Public | Login & return auth token |
| [x] | POST | `/auth/signup` | Public | Sign up a new user |
| [x] | POST | `/auth/accept_invite` | Public | Accept realtor invitation, create user, return token |

### Agents (5 endpoints)
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | GET | `/agents` | Private | Query all agents records |
| [x] | POST | `/agents` | Private | Add agents record |
| [x] | GET | `/agents/{agents_id}` | Private | Get agents record |
| [x] | PATCH | `/agents/{agents_id}` | Private | Edit agents record |
| [x] | DELETE | `/agents/{agents_id}` | Private | Delete agents record |

### Agent-Specific Endpoints
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | POST | `/create_agent` | Private | Creates new agent + user account |
| [x] | POST | `/signup_agent` | Public | Creates new agent account with temp password |
| [x] | POST | `/update_agent_branding` | Private | Updates branding for a specific agent |
| [x] | GET | `/stats/agent` | Private | Retrieve agent stats (realtor counts, seat usage) |
| [x] | POST | `/reset_agent_password` | Private | Reset agent password (Admin only) |

### Realtors (5 endpoints)
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | GET | `/realtors` | Private | Query all realtors records |
| [x] | POST | `/realtors` | Private | Add realtors record |
| [x] | GET | `/realtors/{realtors_id}` | Private | Get realtors record |
| [x] | PATCH | `/realtors/{realtors_id}` | Private | Edit realtors record |
| [x] | DELETE | `/realtors/{realtors_id}` | Private | Delete realtors record |

### Realtor Invite Flow
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | POST | `/invite_realtor` | Private | Invite realtor (checks seat limits, prevents duplicates) |
| [x] | GET | `/invites/validate` | Public | Validate invite token, get realtor + agent details |

### Templates (6 endpoints)
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | GET | `/templates` | Private | Query templates (with filtering) |
| [x] | POST | `/templates` | Private | Add templates record |
| [x] | GET | `/templates/{templates_id}` | Private | Get templates record |
| [x] | PATCH | `/templates/{templates_id}` | Private | Edit templates record |
| [x] | DELETE | `/templates/{templates_id}` | Private | Delete templates record |
| [x] | POST | `/templates/publish` | Private | Publish a template |

### Admin Endpoints
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | GET | `/dashboard_stats` | Private | Aggregated stats for admin dashboard |
| [x] | POST | `/create_template` | Private | Create template (admin only) |
| [x] | POST | `/resolve_error_log` | Private | Resolve an error log by ID |

### Usage Logs (5 endpoints)
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | GET | `/usage_logs` | Private | Query all usage_logs records |
| [x] | POST | `/usage_logs` | Private | Add usage_logs record |
| [x] | GET | `/usage_logs/{usage_logs_id}` | Private | Get usage_logs record |
| [x] | PATCH | `/usage_logs/{usage_logs_id}` | Private | Edit usage_logs record |
| [x] | DELETE | `/usage_logs/{usage_logs_id}` | Private | Delete usage_logs record |

### Error Logs (5 endpoints)
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | GET | `/error_logs` | Private | Query all error_logs records |
| [x] | POST | `/error_logs` | Private | Add error_logs record |
| [x] | GET | `/error_logs/{error_logs_id}` | Private | Get error_logs record |
| [x] | PATCH | `/error_logs/{error_logs_id}` | Private | Edit error_logs record |
| [x] | DELETE | `/error_logs/{error_logs_id}` | Private | Delete error_logs record |

### Users (5 endpoints)
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | GET | `/users` | Private | Query all users records |
| [x] | POST | `/users` | Private | Add users record |
| [x] | GET | `/users/{users_id}` | Private | Get users record |
| [x] | PATCH | `/users/{users_id}` | Private | Edit users record |
| [x] | DELETE | `/users/{users_id}` | Private | Delete users record |

### File Upload
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | POST | `/upload/image` | Private | Upload image with validation |

### Stripe (2 endpoints)
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | POST | `/stripe/create-checkout-session` | Private | Create Stripe checkout session |
| [ ] | POST | `/stripe/webhook` | Public | Handle Stripe webhooks (DRAFT) |

### Other/Unused
| Status | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| [x] | POST | `/generate_placid_pdf` | Private | Generate Placid PDF |
| [x] | GET | `/placid/get_status` | Private | Get Placid status |
| [x] | POST | `/placid/webhook_receiver` | Public | Placid webhook receiver |
| [x] | POST | `/helcim/approval-post` | Public | Helcim approval (likely unused) |

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

*Last updated: January 27, 2026*
