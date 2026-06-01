---
name: impeccable
description: Production-readiness and quality workflow for the Teacher Cockpit SMT ป.4/2 web app. Use when Codex is asked to make this app impeccable, polish quality, validate before real classroom use, review UX, check mobile behavior, verify reports/printing, optimize Supabase-backed React/GitHub Pages deployment, or run an end-to-end release pass.
---

# Impeccable

Use this skill to take a senior, production-readiness pass over the Teacher Cockpit SMT ป.4/2 app. The goal is not decorative polish; the goal is a dependable tool a classroom teacher can open on a phone and trust during real daily work.

## Core Workflow

1. **Orient**
   - Read the latest user request and the current repo state.
   - Inspect `src/App.jsx`, `src/styles.css`, `src/supabaseClient.js`, `README.md`, and relevant `supabase/` files before changing behavior.
   - Read `references/project-contract.md` when touching Supabase tables, login, reports, schedule, printing, or deployment assumptions.

2. **Protect the real workflow**
   - Keep first-screen workflows fast: login, Today page, check attendance, select student, quick call, and print individual report.
   - Do not remove teacher attribution, logos, classroom identity, or official-report structure unless explicitly requested.
   - Prefer small, direct improvements over broad rewrites.

3. **Check the production surface**
   - Build: `npm run build`.
   - Review TypeScript/JS syntax errors from Vite output even if the change looks visual.
   - Confirm no secrets are added to git.
   - Check Git status before and after edits.

4. **UX QA**
   - Mobile first: 390px width must not have overlapping nav, clipped buttons, or unreadable report controls.
   - Desktop must remain scannable, with dense operational panels rather than marketing-style sections.
   - Use existing dark glass theme unless the user asks for a new theme.
   - Keep official print reports white, readable, and school-document-like.

5. **Data QA**
   - Attendance must preserve `updated_by` and warn before overwriting another teacher's entry.
   - Student profile edits must keep existing roster/history data.
   - Reports must tolerate missing Supabase rows and show useful fallback text.
   - Avoid loading unnecessary large tables on first screen.

6. **Release QA**
   - If pushing to GitHub Pages, build first, commit intentionally, push `main`, and verify the Pages workflow result when network access is available.
   - If network is unavailable, state exactly what was verified locally and what remains to verify online.

## Impeccable Review Checklist

Run this checklist before calling the task done:

- **Functionality:** login, Today page, attendance, student profile, photo/profile data, work/behavior, reports.
- **Mobile:** nav wraps acceptably, cards do not overflow, buttons remain tappable.
- **Reports:** individual report prints only the selected student; class report remains dashboard-only unless requested otherwise.
- **Data safety:** no destructive schema/data actions without explicit approval; no reset of user data.
- **Performance:** avoid repeated full reloads unless data correctness requires it; prefer derived memoized summaries.
- **Accessibility:** buttons have clear text or recognizable icons; form inputs have labels; contrast remains readable.
- **Deployment:** build passes; git working tree is clean after commit/push if release was requested.

## Decision Rules

- If the user asks "ทำเลย", implement a narrow improvement that increases classroom usefulness, then build and report the outcome.
- If the issue is login, Supabase auth, RLS, storage, or database performance, use the local `supabase` skill as well.
- If the issue is print layout, inspect CSS print rules and keep official documents readable over forcing everything into a tiny one-page layout.
- If the issue is speed, profile data fetching and rendering first; do not guess.
- If the issue is a missing capability, add the simplest version that works with the current schema before designing a new subsystem.

## Output Standard

Final responses should be short and concrete:

- What changed.
- What was verified.
- The live URL or file path when relevant.
- Any real limitation or next verification step.

Avoid vague claims like "fully optimized" unless measured.
