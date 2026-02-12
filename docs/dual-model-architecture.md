# FLEXDESK — Dual Model Architecture

## Overview
FlexDesk supports two parallel business models:
- **Side 1: B2B Coworking Operators** (SaaS revenue engine)
- **Side 2: Micro‑Hosts** (Airbnb‑for‑desks)

This document defines the product modes, required platform capabilities, and structural additions needed to support both models.

---

## SIDE 1 — B2B Coworking Operators

### Mode A — Closed Environment (Private Workspace Management)
**Ideal for:**
- Corporate offices
- Universities
- Innovation hubs
- Private coworking clubs

**Core features:**
- Invite‑only access
- Employee email domain restriction
- Internal booking only
- No public listing
- No marketplace visibility
- Admin dashboard
- Floor/desk builder
- Internal analytics
- Seat utilization tracking
- Team booking

**Monetization:**
- Monthly SaaS subscription per location
- Or per active seat

> This is **not** a marketplace. It’s workspace infrastructure software.

### Mode B — Open Marketplace Operator
**Ideal for:**
- Public coworking spaces
- Shared offices
- Hybrid spaces wanting exposure

**Core features:**
- Public listing
- Public desk booking
- Instant or approval flow
- Payment processing
- Reviews enabled
- Host analytics
- Revenue dashboard

**Monetization:**
- Platform commission (5–15%)
- Or subscription + reduced commission

---

## SIDE 2 — Micro‑Host Model (Individual Desk Owners)

**Ideal for:**
- Freelancers with extra office room
- People with spare home office desk
- Small studios with extra seats

**Core features:**
- Simple onboarding
- Single‑floor builder (simplified)
- Identity verification
- Address verification
- Set availability schedule
- Hourly/daily pricing
- Payment wallet
- Payout system
- Rating system
- Optional ID requirement for renters

**Trust & safety required:**
- Strong verification
- Review layer
- Dispute handling

**Monetization:**
- Higher commission (10–20%)
- Optional featured listing boost

---

## Critical Structural Additions (Required)

### 1) Account Types (Signup Entry)
Users select at signup:
- Book a desk
- Manage a coworking space
- Rent my desk at home

Each selection triggers a **different onboarding flow** and default permissions.

### 2) Smart Role System
**Roles:**
- Customer
- Corporate Admin
- Coworking Operator
- Micro Host
- Super Admin

### 3) Trust & Safety Layer (Mandatory for Micro Hosts)
- ID verification
- Security deposit option
- House rules agreement
- Cancellation penalties
- Insurance disclaimer
- Rating moderation

### 4) Availability Engine
Must support:
- Recurring availability windows
- Blackout dates
- Partial‑day bookings
- Per‑desk schedule overrides

### 5) Insurance & Legal
For individuals renting desks:
- Liability disclaimer
- Terms of use acceptance
- Property damage clause
- Platform liability limitation
