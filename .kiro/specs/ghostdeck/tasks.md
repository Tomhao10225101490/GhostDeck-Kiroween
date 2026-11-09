# GhostDeck Tasks

## Phase 1: Core engine (pure, testable)

- [ ] Create engine.js: Deck validation, session state machine, graph traversal
- [ ] Write engine.test.js: validation rules, session invariants, history isolation, export roundtrip, malformed data, terminal barrier

## Phase 2: Fictional scenario decks

- [ ] Create data/release-rollback.json: Fictional release incident scenario
- [ ] Create data/lost-badge.json: Fictional access badge scenario

## Phase 3: Storage layer

- [ ] Create storage.js: localStorage persistence with try/catch fallbacks

## Phase 4: DOM renderer (accessible)

- [ ] Create renderer.js: Semantic HTML, ARIA, keyboard navigation, responsive layout
- [ ] Create index.html: Main entry point with accessible structure

## Phase 5: UI modes

- [ ] Implement Play mode: Choices, evidence toggle, debrief at terminal
- [ ] Implement Author mode: Edit form, validation, preview, apply changes
- [ ] Implement Debrief mode: History table, export buttons

## Phase 6: Integration & polish

- [ ] Wire engine ↔ storage ↔ renderer
- [ ] CSS: Phosphor green + paper-white on dark ink, responsive, reduced-motion
- [ ] Keyboard navigation and focus management
- [ ] Final testing and documentation
