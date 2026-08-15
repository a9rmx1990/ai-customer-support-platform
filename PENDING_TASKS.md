# Project Client-Readiness & Pending Tasks Roadmap

This document outlines the remaining roadmap required to bring the **Multi-Domain AI Support Platform** to 100% client production readiness.

---

## 📌 Phase 1: Core Design System & Tokens (COMPLETED)
- [x] **Domain Token Foundation**: Defined `--ink`, `--surface-base`, `--surface-elevated`, `--surface-overlay`, `--triage-border`, `--clinical-mint`, `--signal-amber`, and `--signal-violet` in `app/globals.css`.
- [x] **Anti-AI Slop Enforcement**: Removed heavy drop shadows (`box-shadow: 0 25px 50px...`), 2px neon borders, and gaudy multi-color text gradients.
- [x] **Signature Hero Element**: Built the Live Vector Scope & Triage Command Bar in `app/page.tsx`.
- [x] **Operational Header**: Rebuilt `components/Navbar.tsx` with quiet surface elevation and live telemetry indicator.
- [x] **Chat Widget**: Updated `components/ChatWidget.tsx` with high-legibility dark message bubbles and intent tags.
- [x] **Auth Portal**: Updated `app/login/page.tsx` matching surface tokens.

---

## ⏳ Phase 2: Secondary Pages Craft Refactoring (PENDING)
- [ ] **Chat Workspace (`app/chat/page.tsx`)**:
  - Replace legacy `bg-gray-900`, `border-gray-800`, and `gradient-button` classes with `--surface-base`, `--surface-elevated`, and `--triage-border`.
  - Standardize domain switcher pills and patient profile selection cards.
- [ ] **Support Ticket Dashboard (`app/tickets/page.tsx`)**:
  - Refactor metric counter cards and ticket list items to use whisper-quiet 1px surface borders.
  - Update ticket creation modal with surface overlays.
- [ ] **RAG Knowledge Base (`app/knowledge/page.tsx`)**:
  - Refactor document search cards and domain collection filters using domain tokens.
- [ ] **System Architecture Diagram (`app/architecture/page.tsx`)**:
  - Rebuild node flow diagrams and tool execution pipeline views using quiet dark surface cards.
- [ ] **Patient/Customer Sign Up (`app/signup/page.tsx`)**:
  - Align signup form cards with the refined `app/login/page.tsx` craft aesthetics.

---

## 🧹 Phase 3: Garbage Cleanup & Code Sanitation (IN PROGRESS)
- [x] Remove `.next` cache artifacts.
- [ ] Audit for unused CSS rules and dead code blocks.
- [ ] Verify zero console warnings during production build.

---

## 🚀 Phase 4: Final Client Delivery Verification (PENDING)
- [ ] Execute clean `npm run build` verification across all 20 routes.
- [ ] Verify full responsive mobile layout rendering.
- [ ] Granular git commit push to `origin/main`.
