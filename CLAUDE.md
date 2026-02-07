# PathSathi - Project Context
# Master Context file
- **CLAUDE.md**: works/PathSathi/.claude/CLAUDE.md
## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State/Animations**: Framer Motion, GSAP
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Icons**: Lucide React
- **Language**: TypeScript

## Code Quality Rules
- **Functional Components**: Use functional components with hooks. Avoid inline logic where possible.
- **Strict Typing**: No `any`. Define interfaces in `src/lib/types.ts` or component-specific files.
- **Component Structure**:
  - Small, focused components.
  - Colocate related sub-components if only used in one place, otherwise refactor to `src/components`.
- **Firebase**:
  - Abstract Firebase logic into hooks (`src/hooks`) or service functions (`src/lib/firebase-utils.ts`).
  - Do not call Firestore directly in UI components.
- **Styling**:
  - Use Tailwind utility classes.
  - Avoid `style={{}}` prop unless for dynamic values (e.g., animations).

## Directory Structure
- `src/app`: Routes and pages.
- `src/components`: UI components.
  - `src/components/ui`: Reusable primitives (buttons, inputs, cards).
- `src/hooks`: Custom React hooks (e.g., `useScrollytelling`).
- `src/lib`: Utilities, types, constants, Firebase config.

## Commands
- `npm run dev`: Start dev server.
- `npm run build`: Build for production.
