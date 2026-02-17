# Wellness Frontend

## Overview

This is the Next.js App Router frontend for Wellness Fuel. It includes the public website, authentication pages, and role-based dashboards for admins, doctors, and influencers.

## Tech Stack

- Next.js (App Router)
- React 19
- Redux Toolkit
- Tailwind CSS
- Radix UI + shadcn-style components

## Project Structure

Key areas to know:

- app/: route groups and layouts (App Router)
- components/: shared UI and feature components
- lib/: Redux store, contexts, utilities
- public/: static assets
- middleware.ts: route protection and role gating

## Route Groups

Routes are organized with App Router groups:

- (website): public site pages like home, products, checkout, and content
- (auth): login/signup/logout
- (dashboard): admin dashboard sections
- (dashboard)/doctors: doctor portal
- (dashboard)/influencers: influencer portal

Entry layout files:

- [frontend/app/layout.tsx](frontend/app/layout.tsx): global layout, Redux provider, and popup
- [frontend/app/(website)/layout.tsx](<frontend/app/(website)/layout.tsx>): website header/footer and providers

## State Management

- Redux store and slices live in [frontend/lib/redux](frontend/lib/redux)
- Context providers for cart and wishlist live in [frontend/lib/context](frontend/lib/context)

## Middleware (Auth + Role Access)

Route protection and redirects are handled in [frontend/middleware.ts](frontend/middleware.ts) using role-based rules and cookies.

## API Integration

API calls use the base URL from `NEXT_PUBLIC_API_BASE_URL` (see [frontend/lib/utils/auth.ts](frontend/lib/utils/auth.ts)).

## Environment Variables

Create a .env.local file in frontend/ with:

- NEXT_PUBLIC_API_BASE_URL

## Script
- dev: start local dev server
- build: production build
- start: run production server
- lint: run ESLint

## Folder Map (Quick Reference)

- app/(website)/: public pages (home, products, checkout, content)
- app/(auth)/: auth screens
- app/(dashboard)/dashboard/: admin dashboard sections
- app/(dashboard)/doctors/: doctor dashboard sections
- app/(dashboard)/influencers/: influencer dashboard sections
- components/: UI and feature components
- lib/redux/features/: Redux slices per domain

## API Documentation

Backend API reference is in [backend/API_DOCUMENTATION_UPDATED.md](backend/API_DOCUMENTATION_UPDATED.md).
