# Teacher Cockpit SMT ป.4/2 Project Contract

## App

- Repo path: `C:\Users\picha\Documents\New project 4`
- Frontend: React + Vite
- Hosting: GitHub Pages
- Main app files: `src/App.jsx`, `src/styles.css`, `src/supabaseClient.js`
- Live URL: `https://pichayanon89.github.io/SMT_2-4/`
- Classroom: `SMT ป.4/2`
- School: `โรงเรียนอนุบาลหนองหานวิทยายน`

## Data Model

Core Supabase tables used by the app:

- `students`
- `attendance`
- `homework`
- `homework_status`
- `behavior`
- `follow_ups`
- `scores`
- `parent_contacts`
- `classroom_teachers`
- `profiles`

Important classroom id: `c-p4-2`

## Teacher Workflow Priorities

1. Open app on phone.
2. See Today page.
3. Check next class and teaching schedule.
4. Check attendance quickly.
5. See who still needs follow-up.
6. Open a student profile and call guardian if needed.
7. Print individual official report for parent meeting.

## Report Rules

- Individual report belongs in `รายงาน`.
- Class overview report belongs on dashboard unless the user asks to move it.
- Official reports must include school identity and teacher signature.
- Print CSS should preserve readability. Do not shrink official documents too aggressively.

## Data Safety Rules

- Do not delete real student, attendance, behavior, or contact data unless explicitly requested.
- Attendance overwrites must preserve the "who recorded" context and warn before replacing another teacher's record.
- Roster updates should preserve existing student history, photos, health notes, and contact data where possible.

## Deployment Rules

- Run `npm run build` before commit/push.
- Use intentional commit messages.
- After push, verify GitHub Pages workflow when network is available.
- If GitHub Pages is stale, inspect Actions status before changing code again.
