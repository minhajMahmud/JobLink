# Admin Dashboard (Frontend)

This folder contains the main admin entry page for the JobLink frontend.

- **File:** `AdminDashboard.tsx`
- **Primary UI pattern:** modern SaaS-style layout with a vertical navigation sidebar
- **Sidebar component:** `Frontend/src/components/admin/AdminSidebar.tsx`

## Overview

The admin dashboard uses a split layout:

1. **Left sidebar**
   - Vertical icon + label navigation
   - Grouped sections (Overview, Management, Insights, System)
   - Active item highlighting
   - Collapsible mode (icon rail)
   - Tooltips for collapsed items
   - Mobile drawer behavior

2. **Main content area**
   - Top utility row (search, notifications, profile, logout)
   - Tab-driven content rendering
   - Dashboard home section with quick actions

## Navigation Items

Defined in `AdminDashboard.tsx` as `navItems`:

- Dashboard
- Analytics
- Users
- Employers
- Jobs
- Posts
- Reports
- Spam
- Audit logs
- Settings

## Content Mapping

`contentByTab` maps each nav key to a tab component.

Examples:

- `analytics` → `PlatformAnalyticsTab`
- `users` → `UserManagementTab`
- `jobs` → `JobModerationTab`
- `settings` → `RolePermissionsTab`

## Responsive Behavior

- **Desktop (`lg+`)**: sticky sidebar shown inline with content
- **Mobile (< `lg`)**: sidebar is rendered as a drawer (`Sheet`)
- Sidebar auto-collapses when the app is in mobile mode

## Accessibility

Implemented patterns include:

- `aria-label` on icon-only controls
- `aria-current="page"` for the active nav item
- Keyboard-focus styling via `focus-visible`
- Tooltip labels for collapsed icon-only nav buttons

## Styling Notes

Design system is Tailwind-based and follows project tokens:

- `bg-card`, `border-border`, `text-muted-foreground`, `bg-secondary`
- Rounded corners (`rounded-2xl`, `rounded-3xl`)
- Subtle transitions (`transition-all duration-200/300`)

## Customization Guide

### Add a new sidebar item

1. Add an entry to `navItems`
2. Add a matching key in `contentByTab`
3. Import/render the corresponding tab component

### Change section grouping

- Update the `section` value in each `navItems` entry
- Update `sectionOrder` in `AdminSidebar.tsx` if needed

### Change default open tab

- Update initial state:
  - `const [activeTab, setActiveTab] = useState<AdminTab>("dashboard")`

## Related Files

- `Frontend/src/components/admin/AdminSidebar.tsx`
- `Frontend/src/components/admin/*.tsx` (tab modules)
- `Frontend/src/hooks/use-mobile.tsx`
- `Frontend/src/components/ui/sheet.tsx`
- `Frontend/src/components/ui/tooltip.tsx`
