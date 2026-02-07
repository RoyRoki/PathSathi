# PathSathi - Travel Journey Platform

## ROCKET System (Root Agent)

**Root:** `/Users/test/agent`
**Skills:** `/Users/test/agent/.claude/skills/` (27 master skills)
**Skill Catalog:** `/Users/test/agent/.claude/skills/INDEX.md`
**Skill Router:** `/Users/test/agent/.claude/skills/SKILL_ROUTER.md`
**Session State:** `/Users/test/agent/.claude/config/state/session-state.md`
**Operating Mode:** `/Users/test/agent/.claude/core/governance/operating-mode.md`
**Git Rules:** `/Users/test/agent/.claude/core/governance/git-governance.md`

To load a skill, read: `/Users/test/agent/.claude/skills/<skill-name>/SKILL.md`

## Stack

- **Framework:** Next.js 14 (App Router, static export)
- **Language:** TypeScript strict
- **Styling:** Tailwind CSS 3 + shadcn/ui (Radix)
- **Animation:** GSAP + Framer Motion + Lenis (smooth scroll)
- **Backend:** Firebase (Firestore + Auth) + Brevo SMTP
- **Deploy:** GitHub Pages (static export)

## Skills to Load

When working in this project, load these ROCKET skills:
- `nextjs-mastery` (+ react-mastery, typescript-mastery auto-load)
- `tailwind-mastery`
- `gsap-mastery` + `scroll-interactions` (scroll-driven journey)
- `clean-architecture` (code structure)

On-demand (load when relevant):
- `framer-motion-mastery` (layout animations)
- `authentication-patterns` (Firebase OTP flow)
- `seo-optimization` (meta, OG tags)
- `web-performance` (Lighthouse, asset optimization)
- `design-systems` (shadcn components)

## Project Structure

```
src/
├── app/                    # Routes (App Router)
│   ├── page.tsx            # Hero + routes grid
│   ├── routes/[slug]/      # Journey player (core feature)
│   ├── login/ & signup/    # Firebase OTP auth
│   ├── admin/              # Route/agency management
│   ├── dashboard/          # User bookmarks + history
│   └── api/                # OTP + route-folders endpoints
├── components/             # 19 components
│   └── ui/                 # 13 shadcn-style primitives
├── lib/                    # Firebase, GSAP, Brevo, services
├── hooks/                  # useAutoScroll, useDeviceType
└── data/                   # Route content + JSON
```

## Core Feature: Scroll-Driven Journey

The main product is `RouteClient.tsx` — a scroll-driven travel narrative with:
- GSAP ScrollTrigger for section transitions
- Lenis smooth scrolling
- POI markers on route map
- Auto-scroll sequencing engine
- Journey audio/visual player

## Conventions

- Components: PascalCase (`RouteClient.tsx`)
- Hooks: `use` prefix (`useAutoScroll.ts`)
- Services: `lib/services/` (data fetching)
- UI primitives: `components/ui/` (shadcn pattern)
- Server endpoints: `app/api/` (Next.js route handlers)
- Feature components: `components/` root level

## Quality Rules

- Lighthouse >= 90 (all metrics)
- 60fps scroll animations (GPU-accelerated transforms only)
- Mobile-first responsive
- WCAG 2.1 AA
- TypeScript strict (no `any`)

## Current Status

- Scaffold complete
- Scroll engine + Firebase OTP + admin/agency flows built
- Needs: env setup, route seeding, real WebP assets, multi-sponsor routing
