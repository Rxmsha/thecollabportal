# Admin Portal Responsiveness Plan

## 1. Shared Layout Components

| Component | Current State | Fixes Needed |
|-----------|--------------|--------------|
| `DashboardLayout.tsx` | Has mobile sidebar toggle | Add proper padding for mobile menu button |
| `Sidebar.tsx` | Collapsible, mobile slide-out | Close on link click (mobile), improve touch targets |

## 2. Pages to Fix

| Page | Priority | Key Issues |
|------|----------|------------|
| **Dashboard** | High | Stats grid (4-col → 2-col → 1-col), Popular content cards, 3-col layout |
| **Agents** | High | Table → card layout on mobile, modals (create, detail, credentials) |
| **Realtors** | High | Table → card layout on mobile, modals |
| **Templates** | High | Grid layout, template cards |
| **Templates/New** | Medium | Form layout |
| **Templates/[id]** | Medium | Edit form layout |
| **Resources** | Medium | Drag-drop list, modals |
| **Tools** | Medium | Tool cards grid |
| **Calculators** | Medium | Calculator cards grid |
| **Logs** | Low | Table layout, filters |
| **Errors** | Low | Table layout |
| **Settings** | Low | Form layout |

## 3. Modal Responsiveness

All modals need:
- `max-h-[90vh]` with `overflow-y-auto`
- `w-full max-w-md` (or appropriate size)
- Proper padding on mobile
- Touch-friendly buttons

## 4. Breakpoint Strategy

```
Mobile:  < 640px  (sm)
Tablet:  640px - 1024px (md/lg)
Desktop: > 1024px
```

## 5. Common Patterns to Apply

- **Tables**: Convert to card-based layout on mobile
- **Grids**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- **Forms**: Full-width inputs, stacked labels
- **Buttons**: Full-width on mobile, inline on desktop
- **Text**: Truncate with `truncate` class, responsive font sizes

## 6. Execution Order

1. Shared Layout (DashboardLayout, Sidebar)
2. Dashboard
3. Agents (most complex with tables + modals)
4. Realtors
5. Templates (list + forms)
6. Resources
7. Ai Tools
8. Calculators
9. Usage logs
10. Error logs
11. Settings

## 7. File Locations

```
src/components/shared/DashboardLayout.tsx
src/components/shared/Sidebar.tsx
src/app/admin/dashboard/page.tsx
src/app/admin/agents/page.tsx
src/app/admin/realtors/page.tsx
src/app/admin/templates/page.tsx
src/app/admin/templates/new/page.tsx
src/app/admin/templates/[id]/page.tsx
src/app/admin/resources/page.tsx
src/app/admin/tools/page.tsx
src/app/admin/calculators/page.tsx
src/app/admin/logs/page.tsx
src/app/admin/errors/page.tsx
src/app/admin/settings/page.tsx
```
