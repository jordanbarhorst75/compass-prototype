# Compass — pitchable prototype

Interactive educator-only prototype for **Project Compass**: a growth “front door” between formal observations (see PRD in `Project_Compass_PRD.docx`).

## Scripts

```bash
npm install
npm run dev      # local dev server
npm run build    # production bundle to dist/
npm run lint
```

## Demo checklist

1. First load opens the **board tour**: spotlight on the Kanban, each column (**Know → Apply**), then **task card** areas (competency, source, XP, call-to-action). **Skip** or **Next** through **Go to my board**.
2. **Board** (after tour): time-aware greeting, streak, level bar. Open a card **CTA**, then **Mark Complete** on the placeholder activity.
3. Watch the **check → exit** animation, then the **celebration overlay** (XP, optional level-up / upload milestone badge).
4. **Profile**: Competencies, engagement badges, XP history. **Press and hold** a competency tile to cycle locked → earned → mastery (demo). **Reset demo** clears `localStorage`.
5. **Journey**: horizontal timeline between two formal observations; tap nodes and bookends for details. Second observation shows **↑ since last feedback** (non-evaluative copy; no numeric “scores” in UI).
6. **?** (top right) sends you to the board and restarts the tour from the beginning. **Exit tour** (link, X button, or Escape) dismisses anytime; first visit exit also marks the tour as seen.

Task card hero images are JPEGs in `public/placeholders/` (listed in [`src/lib/placeholderStock.ts`](src/lib/placeholderStock.ts)): preschool, early childhood, and pre-K–style classroom and play spaces from [Unsplash](https://unsplash.com/license). Swap files and update that list together.

## Competency data

Educator-facing competency **names** and **short descriptions** are defined in [`src/data/competencies.ts`](src/data/competencies.ts), derived from [`public/Draft Educator Competencies_April 2023 - Excerpt - Draft Competencies.pdf`](public/Draft%20Educator%20Competencies_April%202023%20-%20Excerpt%20-%20Draft%20Competencies.pdf) (top-level **Connect**, **Engage**, **Inspire learning** groupings and named competencies; sub-competency rows and CLASS indicators from the sheet are not surfaced in the UI). Category ids changed from the old `cat-a` / `cat-b` / `cat-c` — use **Reset demo** if a saved browser state still shows old labels.

## Tech

Vite 6, React 19, TypeScript, Tailwind CSS v4, Framer Motion, React Router. All data is mocked; structure matches the PRD’s entity sketch for future wiring.

## Best demo width

1280px width is ideal; layout scrolls horizontally on the board and timeline down to ~768px.
