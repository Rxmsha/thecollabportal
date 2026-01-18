# Backend Integration Checklist

This document tracks all backend integration tasks for TheCollabPortal.

---

## 1. Xano Database Tables

| Status | Table | Fields |
|--------|-------|--------|
| [x] | **users** | id, email, password, name, role (admin/agent/realtor), agent_id (for realtors), created_at |
| [x] | **agents** | id, user_id, first_name, last_name, email, phone, company_name, status, brand_color, logo_url, calendly_link, cma_link, bio, seat_limit, seats_used, created_at, last_login |
| [x] | **realtors** | id, agent_id, user_id, first_name, last_name, email, brokerage, phone, status, invite_sent_at, activated_at, invite_token |
| [x] | **templates** | id, title, category, format, audience (array), short_description, preview_image_url, download_link, status, published_at, created_at, release_notes, created_by |
| [x] | **usage_logs** | id, event_type, agent_id, realtor_id, template_id, details, created_at |
| [x] | **error_logs** | id, source, scenario_name, message, severity, resolved, resolved_by, created_at |

---

## 2. Xano API Endpoints

### Authentication
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | POST | `/auth/signup` | Register new user |
| [x] | POST | `/auth/login` | Login & return auth token |
| [x] | GET | `/auth/me` | Get current user from token |

### Admin Endpoints
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/dashboard_stats` | Dashboard stats (counts of agents, realtors, templates) |
| [x] | GET | `/agents` | List all agents (auto-generated CRUD) |
| [x] | PATCH | `/agents/{id}` | Update agent status (auto-generated CRUD) |
| [x] | GET | `/realtors` | List all realtors (auto-generated CRUD) |
| [x] | GET | `/templates` | List templates (auto-generated CRUD) |
| [x] | POST | `/templates` | Create template (auto-generated CRUD) |
| [x] | PATCH | `/templates/{id}` | Update template (auto-generated CRUD) |
| [x] | POST | `/templates/publish` | Publish template |
| [x] | GET | `/usage_logs` | Activity logs (auto-generated CRUD) |
| [x] | GET | `/error_logs` | Error logs (auto-generated CRUD) |
| [x] | POST | `/resolve_error_log` | Mark error resolved |

### Agent Endpoints
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/stats/agent` | Agent dashboard stats |
| [x] | GET | `/agents/{id}` | Get agent profile/branding (auto-generated CRUD) |
| [x] | POST | `/update_agent_branding` | Update branding (logo, color, links, bio) |
| [x] | GET | `/realtors` | Get agent's realtors (filter by agent_id) |
| [x] | POST | `/invite_realtor` | Invite a realtor |
| [x] | POST | `/upload/image` | File upload (logos) |

### Realtor Endpoints
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/agents/{id}` | Get linked agent info (auto-generated CRUD) |
| [x] | GET | `/templates` | Get realtor templates (filter by audience) |
| [x] | POST | `/contact` | Send message to agent |

### Invite Flow
| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/invites/validate` | Validate invite token |
| [x] | POST | `/auth/accept_invite` | Accept invite & create account |

---

## 3. External Integrations

### SendGrid (Emails)
| Status | Feature |
|--------|---------|
| [ ] | Realtor invitation emails (with signup link) |
| [ ] | Contact form emails (realtor → agent) |
| [ ] | Notification emails (new realtor signup, etc.) |

### OpenAI (AI Tools)
| Status | Feature |
|--------|---------|
| [ ] | Create `/api/generate` backend route |
| [ ] | Deal Notes Specialist tool |
| [ ] | Content Coach tool |
| [ ] | Email Builder tool |
| [ ] | Thank You Notes tool |

### Stripe (Payments) - Future
| Status | Feature |
|--------|---------|
| [ ] | Subscription management for agents |
| [ ] | Seat upgrades |
| [ ] | Payment webhooks |

### Zapier (Automation) - Optional
| Status | Feature |
|--------|---------|
| [ ] | Webhook endpoints for workflow triggers |
| [ ] | Error logging from Zapier scenarios |

### Bendigi (Calculators)
| Status | Feature |
|--------|---------|
| [ ] | Get embed codes for mortgage calculator |
| [ ] | Get embed codes for purchase calculator |
| [ ] | Get embed codes for closing cost calculator |
| [ ] | Replace placeholders with actual embeds |

---

## 4. File Storage (Xano)
| Status | Task |
|--------|------|
| [ ] | Configure file upload endpoint |
| [ ] | Set up `/logos` folder |
| [ ] | Set up `/templates` folder |
| [ ] | Return public URLs for uploaded files |

---

## 5. Frontend Updates
| Status | Task |
|--------|------|
| [ ] | Update `.env.local` with real Xano URL |
| [ ] | Add OpenAI API route (`/api/generate`) |
| [ ] | Replace calculator placeholders with Bendigi embeds |
| [ ] | Wire up contact form to send emails |
| [ ] | Test all API integrations end-to-end |

---

## Implementation Order (Suggested)

1. **Auth & Users** - Login/signup working with real data
2. **Agents CRUD** - Admin can manage agents
3. **Realtors CRUD** - Agents can invite & manage realtors
4. **Templates CRUD** - Admin can create, publish templates
5. **SendGrid Integration** - Invitation emails
6. **File Upload** - Logo uploads
7. **Stats/Dashboard** - Real dashboard data
8. **OpenAI Integration** - AI tools working
9. **Logs** - Activity & error tracking
10. **Calculators** - Bendigi embeds

---

## Notes

- Xano Base URL: `https://your-instance.xano.io/api:your-api`
- Demo users still work without Xano configured
- All endpoints should return proper error messages
- Use Xano's built-in auth for JWT tokens

---

*Last updated: January 2026*
