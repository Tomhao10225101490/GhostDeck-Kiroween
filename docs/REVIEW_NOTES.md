# Review notes for implementation pass

Independent review of the initial generated engine found acceptance gaps to resolve before release:
- validateCard accesses properties of null; all malformed imports must return structured errors, consistently arrays.
- importDeckJson needs a byte/size bound before JSON.parse and limits for number of cards/evidence/choices and text lengths.
- applyChoice must reject nonexistent destinations, invalid current cards, terminal transitions and transitions after MAX_SESSION_LENGTH; preserve original session on rejected operations.
- History should explicitly distinguish evidence available at decision time from evidence actually revealed. Add evidenceWasRevealed per step. Show both states in debrief.
- Author changes must validate before committing; accepted edits start a fresh history and revealed-evidence state. Reject invalid drafts while preserving active deck/session.
- Preserve exact clicked choice when different choices lead to the same destination; use choice index or reject duplicate destinations explicitly.
- Keep user content text-only in all views, including titles, graph, import errors, debrief, author UI.
- Test suite must include tests/regressions.test.js, not just the generated engine test file. Never weaken tests to match buggy implementation.
- renderer.renderAuthorForm currently interpolates untrusted card titles/narrative/evidence/choices into innerHTML. Replace with static markup + .value assignment or createElement/textContent. This is a release-blocking stored-XSS bug for imported decks.
- storage.saveSession JSON.stringify on Map/Set loses data. Use exportDeckJson and explicit arrays, validate/reconstruct on load, catch localStorage getter errors inside try. Corrupt sessions must not load as valid.
- progress currently calls history/200 a completion percentage, which is misleading for branching paths; show decision count and max limit instead.
- The sample story starts at 3 AM, so final video narration must match this actual scenario, not the earlier audition's Friday-evening wording.
