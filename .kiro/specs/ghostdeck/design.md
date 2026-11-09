# GhostDeck Design

## Architecture

```
dist/
├── index.html              # Main entry with semantic HTML, ARIA
├── css/
│   └── style.css           # Phosphor green + paper-white on dark ink
├── js/
│   ├── engine.js           # Pure shared state machine (node:test compatible)
│   ├── renderer.js         # DOM rendering, accessible components
│   └── storage.js          # Browser persistence (safe fallbacks)
└── data/
    ├── release-rollback.json   # Fictional scenario 1
    └── lost-badge.json         # Fictional scenario 2
```

## Engine state (pure)

```js
// Deck definition (immutable after load)
{
  title: string,
  description: string,
  cards: Map<id, Card>,
  terminalIds: Set<id>
}

// Card
{
  id: string,
  title: string,
  narrative: string,
  evidence: Array<{label: string, content: string}>,
  choices: Array<{label: string, destination: string}>,
  isTerminal: boolean
}

// Session state
{
  deckId: string,
  deck: Deck,
  history: Array<ChoiceRecord>,
  currentCardId: string,
  evidenceRevealed: Set<cardId>,
  isAuthoring: boolean,
  authorCard: Card | null
}

// ChoiceRecord (each decision)
{
  cardId: string,
  choiceIndex: number,
  choiceLabel: string,
  destinationId: string,
  evidenceSnapshot: Array<{label: string, content: string}>
}
```

## Validation rules

1. No duplicate card IDs in a deck
2. Every choice destination must exist as a card ID
3. Nonterminal cards must have ≥1 choice
4. No unreachable cards (from start card via BFS)
5. Cycles allowed; bounded by `MAX_SESSION_LENGTH` (e.g., 200 steps)
6. Empty or oversized inputs rejected (card title >500, narrative >5000, choice label >200)

## UI modes

- **Play**: Choice buttons only; evidence toggle per card; debrief at terminal
- **Author**: Editable form with validation; preview button; apply saves changes
- **Debrief**: History table with evidence snapshots; export buttons

## Accessibility

- `role="application"`, `aria-live="polite"` for card changes
- Full keyboard navigation (Tab/Enter/Arrow)
- High contrast phosphor green on ink, paper-white cards
- `prefers-reduced-motion: no-preference` support
- Semantic `<main>`, `<nav>`, `<section>`, `<article>`, `<aside>`

## Data formats

**Export deck JSON** (schema-validated before import)
```json
{
  "title": "string",
  "description": "string",
  "cards": [
    {
      "id": "unique-string",
      "title": "string",
      "narrative": "string",
      "evidence": [{"label": "string", "content": "string"}],
      "choices": [{"label": "string", "destination": "string"}],
      "isTerminal": boolean
    }
  ]
}
```

**Export session report JSON**
```json
{
  "scenario": "string",
  "finalStatus": "terminal|abandoned",
  "steps": 12,
  "history": [...ChoiceRecord[]],
  "evidenceRevealedCount": 8
}
```
