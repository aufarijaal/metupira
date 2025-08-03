# Product Requirements Document (PRD)

## Project: Metu Pira

Metu Pira is a modern web application for managing personal finances, built with Nuxt 3, Supabase, and Tailwind CSS. The app provides a secure, responsive, and user-friendly experience for tracking expenses and incomes.

---

## 1. Purpose

To help users manage their personal finances by providing authentication, a dashboard, and a scalable structure for future features such as reports, settings, and user profiles.

---

## 2. Features

### 2.1 Authentication

- Google OAuth sign-in via Supabase.
- Secure sign-in and sign-out flows.
- Auth middleware to protect routes.
- Callback page for handling OAuth redirects.

### 2.2 Dashboard

- Responsive dashboard layout with sidebar navigation.
- Sidebar is collapsible and adapts to mobile (full-screen menu).
- Navigation items: Home, Profile, Settings, Reports.
- Placeholder content for each dashboard section.
- User profile and sign-out in sidebar (layout).

### 2.3 Layout & UI

- Uses Tailwind CSS for styling and responsive design.
- Custom transitions for sidebar, mobile menu, and content.
- Google Fonts (Inter) integration.
- Main layout and dashboard layout separation.

### 2.4 Project Structure

- `pages/` for route-based views (index, auth, dashboard, etc).
- `layouts/` for default and dashboard layouts.
- `composables/` for reusable logic (e.g., Supabase client).
- `assets/css/` for global styles.
- `public/` for static assets (favicon, robots.txt).
- `docs/` for documentation.

### 2.5 Tech Stack

- Nuxt 3 (Vue 3 framework)
- Supabase (auth & backend)
- Tailwind CSS (utility-first CSS)
- DaisyUI (optional, for UI components)

---

## 3. User Stories

- As a user, I can sign in securely with Google.
- As a user, I see a dashboard with navigation and my profile info.
- As a user, I can log out from any page.
- As a user, I can navigate between Home, Profile, Settings, and Reports (placeholders for now).
- As a user, I see a responsive UI on both desktop and mobile.

---

## 4. Future Enhancements

- Expense and income tracking features.
- Detailed reports and analytics.
- User settings and profile management.
- Notifications and reminders.
- Multi-language support.

---

## 5. Non-Functional Requirements

- Responsive and accessible UI.
- Secure authentication and session management.
- Scalable codebase for future features.
- Modern, maintainable code using Nuxt 3 best practices.

---

## 6. Appendix

### Main Files & Folders

- `pages/index.vue`: Landing page
- `pages/auth/signin/index.vue`: Google sign-in
- `pages/auth/callback/index.vue`: OAuth callback
- `pages/dashboard/index.vue`: Dashboard with sidebar
- `layouts/default.vue`: Default layout
- `layouts/dashboard.vue`: Dashboard layout (sidebar, header, profile)
- `composables/supabaseClient.ts`: Supabase client setup
- `assets/css/main.css`: Tailwind CSS entry
- `nuxt.config.ts`: Nuxt configuration
- `package.json`: Project dependencies

---

## 7. Future Features & Updates (Editable Section)

> Use this section to add, remove, or update planned features and improvements as the project evolves. This is a living list for product planning and team collaboration.

### Planned Features

-

### Feature Ideas / Backlog

-

### Recently Added or Changed

-

---

This PRD is based on the current state of the codebase and is intended to guide further development and onboarding.
