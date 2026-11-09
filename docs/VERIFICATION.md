# Verification

November 9, 2026. Node.js core test runner: **53 tests passed**.

Coverage includes malformed and oversized imports; missing/duplicate destinations; graph reachability; cycles with a 200-decision cap; terminal and invalid transition rejection; exact choice identity when two choices share a destination; independent evidence snapshots; imported/exported deck equality; Map/Set persistence reconstruction; tampered paths; storage denial; and author draft isolation.

Actual Chrome checks:
- Loaded the Release Rollback fixture, opened evidence, and chose Investigate → Reduce pool → Monitor.
- Number keys advanced valid decisions. An authored terminal card was reached after three choices.
- Refresh restored all three choices and the terminal card.
- Debrief distinguished the first decision's opened evidence from the two later closed evidence panels; each step retained available evidence.
- Edited the Monitoring Hotfix title, previewed and applied the stack; the history reset. The actual downloaded `ghostdeck-stack.json` contained 11 cards and the edited title.
- Importing a deck with a null card returned “Card must be an object” and preserved the active rehearsal.

Further browser/deployment checks are recorded as completed below; unperformed checks are not implied. There is no formal real-team usability study or claimed training efficacy. No production integration was tested or included.

Additional actual checks:
- The downloaded debrief JSON parsed successfully: three decisions, terminal status, exact choice labels and evidence-open flags `[true, false, false]`.
- A valid test deck containing HTML-looking text and an `onerror` attribute displayed literally in play and author fields; the browser title remained unchanged.
- Loaded the independent Lost Badge Access fixture successfully.
- Public GitHub Pages returned HTTP 200 after the initial test-and-publish workflow.
