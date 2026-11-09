/**
 * GhostDeck tests - Node.js test compatible
 * Run with: node --test engine.test.js
 */

import assert from 'node:assert';
import {
  validateCard,
  validateDeck,
  buildDeckObject,
  createInitialSession,
  applyChoice,
  toggleEvidence,
  startAuthoring,
  updateAuthorCard,
  applyAuthorChanges,
  cancelAuthoring,
  createEmptyDeck,
  generateId,
  exportSessionReport,
  exportDeckJson,
  importDeckJson,
  isTerminal,
  getCurrentCard,
  getCurrentChoices,
  getCurrentEvidence,
  resetSession,
  isSessionOverMax,
  MAX_SESSION_LENGTH,
  MAX_CARD_TITLE_LEN,
  MAX_NARRATIVE_LEN,
  MAX_CHOICE_LABEL_LEN,
  MAX_EVIDENCE_LABEL_LEN,
  MAX_EVIDENCE_CONTENT_LEN,
  ERR_DUP_CARD_ID,
  ERR_INVALID_DESTINATION,
  ERR_NONTERMINAL_NO_CHOICES,
  ERR_UNREACHABLE_CARD
} from './engine.js';

import { test } from 'node:test';

// ============ validateCard Tests ============

test('validateCard: valid card passes', () => {
  const card = {
    id: 'c1',
    title: 'Start',
    narrative: 'The beginning',
    evidence: [{ label: 'E1', content: 'Content' }],
    choices: [{ label: 'Go', destination: 'c2' }],
    isTerminal: false
  };
  assert.strictEqual(validateCard(card), null);
});

test('validateCard: empty id fails', () => {
  const card = {
    id: '',
    title: 'Start',
    narrative: 'The beginning',
    evidence: [],
    choices: [],
    isTerminal: true
  };
  assert(validateCard(card));
});

test('validateCard: empty title fails', () => {
  const card = {
    id: 'c1',
    title: '',
    narrative: 'The beginning',
    evidence: [],
    choices: [],
    isTerminal: true
  };
  assert(validateCard(card));
});

test('validateCard: oversized title fails', () => {
  const card = {
    id: 'c1',
    title: 'x'.repeat(MAX_CARD_TITLE_LEN + 1),
    narrative: 'The beginning',
    evidence: [],
    choices: [],
    isTerminal: true
  };
  assert(validateCard(card));
});

test('validateCard: nonterminal with no choices fails', () => {
  const card = {
    id: 'c1',
    title: 'Start',
    narrative: 'The beginning',
    evidence: [],
    choices: [],
    isTerminal: false
  };
  assert(validateCard(card));
});

test('validateCard: valid terminal with no choices passes', () => {
  const card = {
    id: 'c1',
    title: 'End',
    narrative: 'The end',
    evidence: [],
    choices: [],
    isTerminal: true
  };
  assert.strictEqual(validateCard(card), null);
});

test('validateCard: choice destination validation', () => {
  const card = {
    id: 'c1',
    title: 'Start',
    narrative: 'The beginning',
    evidence: [],
    choices: [{ label: 'Go', destination: '' }],
    isTerminal: false
  };
  assert(validateCard(card));
});

test('validateCard: oversized choice label fails', () => {
  const card = {
    id: 'c1',
    title: 'Start',
    narrative: 'The beginning',
    evidence: [],
    choices: [{ label: 'x'.repeat(MAX_CHOICE_LABEL_LEN + 1), destination: 'c2' }],
    isTerminal: false
  };
  assert(validateCard(card));
});

// ============ validateDeck Tests ============

test('validateDeck: valid deck passes', () => {
  const deck = {
    title: 'Test Scenario',
    description: 'A test',
    cards: [
      {
        id: 'c1',
        title: 'Start',
        narrative: 'Start here',
        evidence: [],
        choices: [{ label: 'Next', destination: 'c2' }],
        isTerminal: false
      },
      {
        id: 'c2',
        title: 'End',
        narrative: 'End here',
        evidence: [],
        choices: [],
        isTerminal: true
      }
    ]
  };
  const result = validateDeck(deck);
  assert.strictEqual(result.valid, true);
  assert.deepStrictEqual(result.errors, []);
});

test('validateDeck: duplicate card IDs fail', () => {
  const deck = {
    title: 'Test',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n1', evidence: [], choices: [], isTerminal: true },
      { id: 'c1', title: '2', narrative: 'n2', evidence: [], choices: [], isTerminal: true }
    ]
  };
  const result = validateDeck(deck);
  assert.strictEqual(result.valid, false);
  assert(result.errors.includes(ERR_DUP_CARD_ID));
});

test('validateDeck: invalid destination fails', () => {
  const deck = {
    title: 'Test',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n1', evidence: [], choices: [{ label: 'X', destination: 'c99' }], isTerminal: false },
      { id: 'c2', title: '2', narrative: 'n2', evidence: [], choices: [], isTerminal: true }
    ]
  };
  const result = validateDeck(deck);
  assert.strictEqual(result.valid, false);
  assert(result.errors.some(e => e.includes(ERR_INVALID_DESTINATION)));
});

test('validateDeck: unreachable card fails', () => {
  const deck = {
    title: 'Test',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n1', evidence: [], choices: [], isTerminal: true },
      { id: 'c2', title: '2', narrative: 'n2', evidence: [], choices: [], isTerminal: true }
    ]
  };
  const result = validateDeck(deck);
  assert.strictEqual(result.valid, false);
  assert(result.errors.some(e => e.includes(ERR_UNREACHABLE_CARD)));
});

test('validateDeck: empty deck fails', () => {
  const deck = { title: 'T', description: '', cards: [] };
  const result = validateDeck(deck);
  assert.strictEqual(result.valid, false);
  assert(result.errors.includes('Deck must have at least one card'));
});

test('validateDeck: empty title fails', () => {
  const deck = { title: '', description: '', cards: [] };
  const result = validateDeck(deck);
  assert.strictEqual(result.valid, false);
  assert(result.errors.includes('Deck title must be a non-empty string'));
});

// ============ Session Tests ============

test('createInitialSession: creates session with start card', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [], isTerminal: true }]
  });
  const session = createInitialSession(deck);
  assert.strictEqual(session.currentCardId, 'c1');
  assert.deepStrictEqual(session.history, []);
  assert(session.evidenceRevealed instanceof Set);
  assert.strictEqual(session.isAuthoring, false);
});

test('applyChoice: records choice and advances', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [{ label: 'Go', destination: 'c2' }], isTerminal: false },
      { id: 'c2', title: '2', narrative: 'n', evidence: [], choices: [], isTerminal: true }
    ]
  });
  let session = createInitialSession(deck);
  session = applyChoice(session, 'c2');
  assert.strictEqual(session.currentCardId, 'c2');
  assert.strictEqual(session.history.length, 1);
  assert.strictEqual(session.history[0].choiceLabel, 'Go');
  assert.strictEqual(session.history[0].destinationId, 'c2');
});

test('applyChoice: captures evidence snapshot', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n', evidence: [{ label: 'E', content: 'C' }], choices: [{ label: 'Go', destination: 'c2' }], isTerminal: false },
      { id: 'c2', title: '2', narrative: 'n', evidence: [], choices: [], isTerminal: true }
    ]
  });
  let session = createInitialSession(deck);
  session = applyChoice(session, 'c2');
  assert.deepStrictEqual(session.history[0].evidenceSnapshot, [{ label: 'E', content: 'C' }]);
});

test('toggleEvidence: adds/removes card from revealed set', () => {
  let session = createInitialSession(buildDeckObject({
    title: 'T',
    description: '',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [], isTerminal: true }]
  }));
  session = toggleEvidence(session, 'c1');
  assert(session.evidenceRevealed.has('c1'));
  session = toggleEvidence(session, 'c1');
  assert(!session.evidenceRevealed.has('c1'));
});

test('startAuthoring: creates editable copy', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [], isTerminal: true }]
  });
  let session = createInitialSession(deck);
  session = startAuthoring(session, 'c1');
  assert.strictEqual(session.isAuthoring, true);
  assert.deepStrictEqual(session.authorCard, { id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [], isTerminal: true });
});

test('applyAuthorChanges: updates deck', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [], isTerminal: true }]
  });
  let session = createInitialSession(deck);
  session = startAuthoring(session, 'c1');
  session = updateAuthorCard(session, { id: 'c1', title: 'Updated', narrative: 'New n', evidence: [], choices: [], isTerminal: true });
  session = applyAuthorChanges(session);
  const card = session.deck.cards.get('c1');
  assert.strictEqual(card.title, 'Updated');
  assert.strictEqual(card.narrative, 'New n');
});

test('cancelAuthoring: discards changes', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [], isTerminal: true }]
  });
  let session = createInitialSession(deck);
  session = startAuthoring(session, 'c1');
  session = updateAuthorCard(session, { id: 'c1', title: 'Updated', narrative: 'New n', evidence: [], choices: [], isTerminal: true });
  session = cancelAuthoring(session);
  assert.strictEqual(session.isAuthoring, false);
  assert.strictEqual(session.authorCard, null);
});

test('resetSession: clears history and returns to start', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [{ label: 'Go', destination: 'c2' }], isTerminal: false },
      { id: 'c2', title: '2', narrative: 'n', evidence: [], choices: [], isTerminal: true }
    ]
  });
  let session = createInitialSession(deck);
  session = applyChoice(session, 'c2');
  session = resetSession(session);
  assert.strictEqual(session.currentCardId, 'c1');
  assert.deepStrictEqual(session.history, []);
  assert.strictEqual(session.evidenceRevealed.size, 0);
});

test('isTerminal: detects terminal cards', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [{ label: 'Go', destination: 'c2' }], isTerminal: false },
      { id: 'c2', title: '2', narrative: 'n', evidence: [], choices: [], isTerminal: true }
    ]
  });
  let session = createInitialSession(deck);
  assert(!isTerminal(session));
  session = applyChoice(session, 'c2');
  assert(isTerminal(session));
});

test('getCurrentCard: returns current card', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [], isTerminal: true }]
  });
  const session = createInitialSession(deck);
  const card = getCurrentCard(session);
  assert.strictEqual(card.id, 'c1');
});

test('getCurrentChoices: returns choices', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [{ label: 'A', destination: 'c1' }], isTerminal: true }]
  });
  const session = createInitialSession(deck);
  const choices = getCurrentChoices(session);
  assert.deepStrictEqual(choices, [{ label: 'A', destination: 'c1' }]);
});

test('getCurrentEvidence: returns evidence', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [{ label: 'E', content: 'C' }], choices: [], isTerminal: true }]
  });
  const session = createInitialSession(deck);
  const evidence = getCurrentEvidence(session);
  assert.deepStrictEqual(evidence, [{ label: 'E', content: 'C' }]);
});

// ============ Import/Export Tests ============

test('exportSessionReport: returns session summary', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [{ label: 'Go', destination: 'c2' }], isTerminal: false },
      { id: 'c2', title: '2', narrative: 'n', evidence: [], choices: [], isTerminal: true }
    ]
  });
  let session = createInitialSession(deck);
  session = applyChoice(session, 'c2');
  session = toggleEvidence(session, 'c1');
  const report = exportSessionReport(session);
  assert.strictEqual(report.scenario, 'T');
  assert.strictEqual(report.finalStatus, 'terminal');
  assert.strictEqual(report.steps, 1);
  assert.strictEqual(report.evidenceRevealedCount, 1);
});

test('exportDeckJson: returns plain object', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: 'D',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [{ label: 'E', content: 'C' }], choices: [], isTerminal: true }]
  });
  const json = exportDeckJson(deck);
  assert.strictEqual(json.title, 'T');
  assert.strictEqual(json.description, 'D');
  assert.strictEqual(json.cards.length, 1);
});

test('importDeckJson: validates and imports', () => {
  const deck = {
    title: 'T',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [{ label: 'Go', destination: 'c2' }], isTerminal: false },
      { id: 'c2', title: '2', narrative: 'n', evidence: [], choices: [], isTerminal: true }
    ]
  };
  const result = importDeckJson(JSON.stringify(deck));
  assert.strictEqual(result.success, true);
  assert(result.deckObj);
});

test('importDeckJson: rejects invalid JSON', () => {
  const result = importDeckJson('{invalid}');
  assert.strictEqual(result.success, false);
  assert(result.errors.length > 0);
});

test('importDeckJson: rejects duplicate IDs', () => {
  const deck = {
    title: 'T',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [], isTerminal: true },
      { id: 'c1', title: '2', narrative: 'n', evidence: [], choices: [], isTerminal: true }
    ]
  };
  const result = importDeckJson(JSON.stringify(deck));
  assert.strictEqual(result.success, false);
});

test('importDeckJson: rejects invalid destination', () => {
  const deck = {
    title: 'T',
    description: '',
    cards: [
      { id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [{ label: 'X', destination: 'c99' }], isTerminal: false },
      { id: 'c2', title: '2', narrative: 'n', evidence: [], choices: [], isTerminal: true }
    ]
  };
  const result = importDeckJson(JSON.stringify(deck));
  assert.strictEqual(result.success, false);
});

// ============ Generation Tests ============

test('generateId: produces unique strings', () => {
  const ids = new Set();
  for (let i = 0; i < 100; i++) {
    ids.add(generateId());
  }
  assert.strictEqual(ids.size, 100);
});

test('createEmptyDeck: creates starter deck', () => {
  const deck = createEmptyDeck('My Scenario', 'Test desc');
  assert.strictEqual(deck.title, 'My Scenario');
  assert.strictEqual(deck.description, 'Test desc');
  assert.strictEqual(deck.cards.length, 1);
  assert.strictEqual(deck.cards[0].title, 'Start');
});

// ============ Length Validation Tests ============

test('validateDeck: oversized title fails', () => {
  const deck = {
    title: 'x'.repeat(MAX_CARD_TITLE_LEN + 1),
    description: '',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [], isTerminal: true }]
  };
  const result = validateDeck(deck);
  assert.strictEqual(result.valid, false);
});

test('validateCard: oversized narrative fails', () => {
  const card = {
    id: 'c1',
    title: '1',
    narrative: 'x'.repeat(MAX_NARRATIVE_LEN + 1),
    evidence: [],
    choices: [],
    isTerminal: true
  };
  assert(validateCard(card));
});

test('validateCard: oversized evidence label fails', () => {
  const card = {
    id: 'c1',
    title: '1',
    narrative: 'n',
    evidence: [{ label: 'x'.repeat(MAX_EVIDENCE_LABEL_LEN + 1), content: 'c' }],
    choices: [],
    isTerminal: true
  };
  assert(validateCard(card));
});

test('validateCard: oversized evidence content fails', () => {
  const card = {
    id: 'c1',
    title: '1',
    narrative: 'n',
    evidence: [{ label: 'E', content: 'x'.repeat(MAX_EVIDENCE_CONTENT_LEN + 1) }],
    choices: [],
    isTerminal: true
  };
  assert(validateCard(card));
});

test('isSessionOverMax: detects session length limit', () => {
  const deck = buildDeckObject({
    title: 'T',
    description: '',
    cards: [{ id: 'c1', title: '1', narrative: 'n', evidence: [], choices: [], isTerminal: true }]
  });
  const session = createInitialSession(deck);
  assert(!isSessionOverMax(session));
});