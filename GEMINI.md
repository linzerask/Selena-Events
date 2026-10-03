# Gemini Context & Developer Notes

This document contains important technical notes and context for future AI invocations working on the Selena Events website.

## What Was Completed Today
1. **Firebase Security Rules & Firestore Deployments:** 
   - Configured `firebase.json` with the firestore target and deployed `firestore.rules` directly via CLI (`firebase deploy --only firestore:rules --project selena-events-dashboard`).
   - Ensured `partners`, `sponsors`, `portfolio_events`, and `team_members` have public read access (`allow read: if true; allow write: if staff();`) so unauthenticated homepage visitors can view dynamic partners and portfolio highlights.
2. **Partner & Sponsor Management in Admin Dashboard:**
   - Added full CRUD management for Partners & Sponsors under the "Partner & Sponsoren" tab in `admin-selena-portal-8274.html` and `js/dashboard.js`.
   - Supports transparent 1:1 image uploads via Firebase Storage, display order reordering, active/hidden toggling, custom target URL links (`websiteUrl`), and deletion.
3. **Modal Nesting & DOM Debugging Lesson:**
   - Resolved a critical bug where an unclosed `</div>` tag in `#product-modal` silently nested `#partner-modal` inside it, causing the partner modal to be rendered with `0px × 0px` (invisible). Always ensure all modal container `<div>` tags are properly closed at the root body level.
4. **Dynamic Homepage Partner Marquee:**
   - Replaced static markup in `index.html`, `en/index.html`, and `ro/index.html` with dynamic Firestore loader (`js/site-content.js`).
   - Added automatic cache busting (`?v=2.1`) on all script inclusions to prevent browser caching.
   - Fixed field name parsing (`websiteUrl`) and added link formatting with `target="_blank"` and `rel="noopener noreferrer"`.
5. **Notification Badges & Cross-Device Read States:**
   - Transitioned from raw snapshot size to timestamp-based read tracking (`lastRead_messages`, `lastRead_shop`, `lastRead_verleih`, `lastRead_calendar`).
   - Volunteer role accounts only see calendar/event assignment notifications, hiding financial and contact message alerts.
6. **Manual Volunteer Assignment:**
   - Added `showEventManageModal` in `admin-selena-portal-8274.html`, allowing Owner/Dev roles to assign available volunteers directly to calendar events.
7. **Git & GitHub Repository Management:**
   - Connected and synchronized with `https://github.com/linzerask/Selena-Events` on branch `main`. All updates are tracked and committed cleanly.

## Architecture & Layout Notes
* **CSS Framework:** Tailwind CSS.
* **Marquee Animation:** Uses `.animate-scroll` with infinite loop keyframe translations. Hovering pauses the animation (`animation-play-state: paused`).
* **Blog Layout Grid:** Refactored to a 12-column CSS Grid system (`grid-cols-12`):
  * Left Sidebar: `lg:col-span-3`
  * Main Content: `lg:col-span-6`
  * Right Sidebar (Gallery): `lg:col-span-3`
* **Shop/Verleih Structure:** Product data is loaded client-side via localized Javascript objects (`js/shop.js`, `en/js/shop.js`, `ro/js/shop.js`).

## Firebase & Backend Notes
* **Collections:**
  * `partners`: Stores partner/sponsor entries (`name`, `logoUrl`, `websiteUrl`, `order`, `visible`). Public read, staff write.
  * `messages`: Stores inquiries from the contact form. Staff read/update/delete.
  * `blog_posts/{slug}/comments`: Stores comments for specific blog posts (`status: 'pending'` / `'approved'`).
  * `orders` & `booked_dates`: Store checkout submissions from Shop and Verleih.
  * `settings`: Stores global media and homepage highlight overrides (`site_images`, `media_overrides`).

## GitHub Repository
* **Remote:** `https://github.com/linzerask/Selena-Events`
* **Branch:** `main`
