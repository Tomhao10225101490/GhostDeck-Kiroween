/**
 * GhostDeck Engine - Pure state machine for decision rehearsal
 * No external dependencies. Suitable for node:test.
 */

// Constants
export const MAX_SESSION_LENGTH = 200;
export const MAX_IMPORT_BYTES = 1024 * 1024;
export const MAX_CARDS = 100;
export const MAX_CARD_TITLE_LEN = 500;
export const MAX_NARRATIVE_LEN = 5000;
export const MAX_CHOICE_LABEL_LEN = 200;
export const MAX_EVIDENCE_LABEL_LEN = 200;
export const MAX_EVIDENCE_CONTENT_LEN = 5000;

// Validation errors
export const ERR_DUP_CARD_ID = 'Duplicate card ID found';
export const ERR_INVALID_DESTINATION = 'Choice references nonexistent card';
export const ERR_NONTERMINAL_NO_CHOICES = 'Nonterminal card has no choices';
export const ERR_UNREACHABLE_CARD = 'Card is unreachable from start';
export const ERR_EMPTY_CARD_LIST = 'Deck must have at least one card';
export const ERR_EMPTY_TITLE = 'Deck title is empty';
export const ERR_OVERRSIZED_INPUT = 'Input exceeds maximum length';

/**
 * Validate a single card
 * @param {Object} card
 * @returns {string|null} Error message or null if valid
 */
export function validateCard(card) {
  if (!card || typeof card !== 'object' || Array.isArray(card)) return 'Card must be an object';
  if (card.id?.length > 120) return 'Card id exceeds 120 characters';
  if (card.isTerminal !== undefined && typeof card.isTerminal !== 'boolean') return 'Terminal flag must be boolean';
  if (typeof card.id !== 'string' || card.id.trim() === '') {
    return 'Card id must be a non-empty string';
  }
  if (typeof card.title !== 'string' || card.title.trim() === '') {
    return 'Card title must be a non-empty string';
  }
  if (card.title.length > MAX_CARD_TITLE_LEN) {
    return `Card title exceeds ${MAX_CARD_TITLE_LEN} characters`;
  }
  if (typeof card.narrative !== 'string' || card.narrative.trim() === '') {
    return 'Card narrative must be a non-empty string';
  }
  if (card.narrative.length > MAX_NARRATIVE_LEN) {
    return `Card narrative exceeds ${MAX_NARRATIVE_LEN} characters`;
  }
  if (card.evidence?.length > 20) return 'Maximum 20 evidence items per card';
  if (!Array.isArray(card.evidence)) {
    return 'Card evidence must be an array';
  }
  for (let i = 0; i < card.evidence.length; i++) {
    const ev = card.evidence[i];
    if (!ev || typeof ev !== 'object') return `Evidence item ${i} must be an object`;
    if (typeof ev.label !== 'string' || ev.label.trim() === '') {
      return `Evidence item ${i} has invalid label`;
    }
    if (ev.label.length > MAX_EVIDENCE_LABEL_LEN) {
      return `Evidence label ${i} exceeds ${MAX_EVIDENCE_LABEL_LEN} characters`;
    }
    if (typeof ev.content !== 'string' || ev.content.trim() === '') {
      return `Evidence item ${i} has invalid content`;
    }
    if (ev.content.length > MAX_EVIDENCE_CONTENT_LEN) {
      return `Evidence content ${i} exceeds ${MAX_EVIDENCE_CONTENT_LEN} characters`;
    }
  }
  if (card.choices?.length > 10) return 'Maximum 10 choices per card';
  if (card.isTerminal === true && card.choices?.length) return 'Terminal cards cannot have choices';
  if (!Array.isArray(card.choices)) {
    return 'Card choices must be an array';
  }
  for (let i = 0; i < card.choices.length; i++) {
    const choice = card.choices[i];
    if (!choice || typeof choice !== 'object') return `Choice ${i} must be an object`;
    if (typeof choice.label !== 'string' || choice.label.trim() === '') {
      return `Choice ${i} has invalid label`;
    }
    if (choice.label.length > MAX_CHOICE_LABEL_LEN) {
      return `Choice label ${i} exceeds ${MAX_CHOICE_LABEL_LEN} characters`;
    }
    if (typeof choice.destination !== 'string' || choice.destination.trim() === '') {
      return `Choice ${i} has invalid destination`;
    }
  }
  if (card.isTerminal !== true && card.choices.length === 0) {
    return 'Nonterminal card must have at least one choice';
  }
  return null;
}

/**
 * Validate an entire deck
 * @param {Object} deck
 * @returns {Object} { valid: boolean, errors: string[], deckObj: Object|null }
 */
export function validateDeck(deck) {
  const errors = [];

  if (!deck || typeof deck !== 'object' || Array.isArray(deck)) {
    return { valid: false, errors: ['Deck must be an object'], deckObj: null };
  }
  if (typeof deck.title !== 'string' || deck.title.trim() === '') {
    return { valid: false, errors: ['Deck title must be a non-empty string'], deckObj: null };
  }
  if (deck.title.length > MAX_CARD_TITLE_LEN) {
    return { valid: false, errors: [`Deck title exceeds ${MAX_CARD_TITLE_LEN} characters`], deckObj: null };
  }
  if (typeof deck.description !== 'string') {
    return { valid: false, errors: ['Deck description must be a string'], deckObj: null };
  }
  if (deck.description.length > 5000) return { valid:false, errors:['Description exceeds 5000 characters'], deckObj:null };
  if (deck.cards?.length > MAX_CARDS) return { valid:false, errors:['Maximum 100 cards per deck'], deckObj:null };
  if (!Array.isArray(deck.cards) || deck.cards.length === 0) {
    return { valid: false, errors: [ERR_EMPTY_CARD_LIST], deckObj: null };
  }

  // Check for duplicate IDs
  const seenIds = new Set();
  for (const card of deck.cards) {
    const cardError = validateCard(card);
    if (cardError) {
      errors.push(cardError);
    } else {
      if (seenIds.has(card.id)) {
        errors.push(ERR_DUP_CARD_ID);
        break;
      }
      seenIds.add(card.id);
    }
  }

  // Check destinations exist
  if (errors.length === 0) {
    for (const card of deck.cards) {
      for (const choice of card.choices) {
        if (!seenIds.has(choice.destination)) {
          errors.push(`${ERR_INVALID_DESTINATION}: "${choice.destination}"`);
          break;
        }
      }
      if (errors.length > 0) break;
    }
  }

  // Check reachability (BFS from start)
  if (errors.length === 0 && deck.cards.length > 0) {
    const visited = new Set();
    const queue = [deck.cards[0].id];
    visited.add(queue[0]);

    while (queue.length > 0) {
      const current = queue.shift();
      const card = deck.cards.find(c => c.id === current);
      if (card) {
        for (const choice of card.choices) {
          if (!visited.has(choice.destination)) {
            visited.add(choice.destination);
            queue.push(choice.destination);
          }
        }
      }
    }

    for (const card of deck.cards) {
      if (!visited.has(card.id)) {
        errors.push(`${ERR_UNREACHABLE_CARD}: "${card.id}"`);
      }
    }
  }

  const deckObj = errors.length === 0 ? buildDeckObject(deck) : null;
  return { valid: errors.length === 0, errors, deckObj };
}

/**
 * Build internal Deck representation
 * @param {Object} rawDeck
 * @returns {Object} Deck with cards as Map
 */
export function buildDeckObject(rawDeck) {
  const cardsMap = new Map();
  const terminalIds = new Set();

  for (const card of rawDeck.cards) {
    cardsMap.set(card.id, {
      id: card.id,
      title: card.title,
      narrative: card.narrative,
      evidence: card.evidence.map(e => ({label:e.label, content:e.content})),
      choices: card.choices.map(c => ({label:c.label, destination:c.destination})),
      isTerminal: card.isTerminal === true
    });
    if (card.isTerminal === true) {
      terminalIds.add(card.id);
    }
  }

  return {
    title: rawDeck.title,
    description: rawDeck.description,
    cards: cardsMap,
    terminalIds: terminalIds,
    startId: rawDeck.cards[0].id
  };
}

/**
 * Create initial session state
 * @param {Object} deckObj
 * @param {string} deckId
 * @returns {Object} Initial session
 */
export function createInitialSession(deckObj, deckId = 'default') {
  return {
    deckId,
    deck: deckObj,
    history: [],
    currentCardId: deckObj.startId,
    evidenceRevealed: new Set(),
    isAuthoring: false,
    authorCard: null
  };
}

/**
 * Apply a choice to the session
 * @param {Object} session
 * @param {string} destinationId
 * @returns {Object} New session
 */
export function applyChoice(session, destinationId, selectedIndex) {
  const currentCard = session?.deck?.cards?.get(session.currentCardId);
  if (!currentCard || currentCard.isTerminal || session.history.length >= MAX_SESSION_LENGTH) return session;
  const choiceIndex = selectedIndex === undefined ? currentCard.choices.findIndex(c => c.destination === destinationId) : selectedIndex;
  if (!Number.isInteger(choiceIndex) || !currentCard.choices[choiceIndex] || currentCard.choices[choiceIndex].destination !== destinationId || !session.deck.cards.has(destinationId)) return session;
  const choice = currentCard.choices[choiceIndex];

  const evidenceSnapshot = currentCard.evidence.map(e => ({ label: e.label, content: e.content }));

  const newRecord = {
    cardId: session.currentCardId,
    choiceIndex,
    choiceLabel: choice.label,
    destinationId,
    cardTitle: currentCard.title,
    evidenceWasRevealed: session.evidenceRevealed.has(currentCard.id),
    evidenceSnapshot
  };

  return {
    ...session,
    history: [...session.history, newRecord],
    currentCardId: destinationId
  };
}

/**
 * Toggle evidence reveal for a card
 * @param {Object} session
 * @param {string} cardId
 * @returns {Object} New session
 */
export function toggleEvidence(session, cardId) {
  if (!session.deck.cards.has(cardId)) return session;
  const newRevealed = new Set(session.evidenceRevealed);
  if (newRevealed.has(cardId)) {
    newRevealed.delete(cardId);
  } else {
    newRevealed.add(cardId);
  }
  return { ...session, evidenceRevealed: newRevealed };
}

/**
 * Start authoring mode with a copy of a card
 * @param {Object} session
 * @param {string} cardId
 * @returns {Object} New session
 */
export function startAuthoring(session, cardId) {
  const card = session.deck.cards.get(cardId);
  return {
    ...session,
    isAuthoring: true,
    authorCard: JSON.parse(JSON.stringify(card))
  };
}

/**
 * Update the author card being edited
 * @param {Object} session
 * @param {Object} updatedCard
 * @returns {Object} New session
 */
export function updateAuthorCard(session, updatedCard) {
  return {
    ...session,
    authorCard: { ...updatedCard }
  };
}

/**
 * Apply author changes to the deck
 * @param {Object} session
 * @returns {Object} New session
 */
export function applyAuthorChanges(session) {
  if (!session.authorCard) return session;

  const newCards = [];
  for (const card of session.deck.cards.values()) {
    if (card.id === session.authorCard.id) {
      newCards.push({
        id: session.authorCard.id,
        title: session.authorCard.title,
        narrative: session.authorCard.narrative,
        evidence: session.authorCard.evidence,
        choices: session.authorCard.choices,
        isTerminal: session.authorCard.isTerminal
      });
    } else {
      newCards.push({
        id: card.id,
        title: card.title,
        narrative: card.narrative,
        evidence: card.evidence,
        choices: card.choices,
        isTerminal: card.isTerminal
      });
    }
  }

  const validated = validateDeck({
    title: session.deck.title,
    description: session.deck.description,
    cards: newCards
  });
  if (!validated.valid) return session;
  const newDeck = validated.deckObj;

  return {
    ...session,
    deck: newDeck,
    isAuthoring: false,
    authorCard: null,
    // Reset to first card if current card was changed
    history: [],
    evidenceRevealed: new Set(),
    currentCardId: newDeck.startId
  };
}

/**
 * Cancel authoring and discard changes
 * @param {Object} session
 * @returns {Object} New session
 */
export function cancelAuthoring(session) {
  return {
    ...session,
    isAuthoring: false,
    authorCard: null
  };
}

/**
 * Create a new empty deck
 * @param {string} title
 * @param {string} description
 * @returns {Object} Empty deck object
 */
export function createEmptyDeck(title = 'Untitled Scenario', description = '') {
  const id = generateId();
  return {
    title,
    description,
    cards: [{
      id,
      title: 'Start',
      narrative: 'This is the beginning of your scenario.',
      evidence: [],
      choices: [],
      isTerminal: true
    }]
  };
}

/**
 * Generate a simple unique ID
 * @returns {string}
 */
export function generateId() {
  return 'card_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
}

/**
 * Export session report
 * @param {Object} session
 * @returns {Object}
 */
export function exportSessionReport(session) {
  return {
    scenario: session.deck.title,
    finalStatus: session.deck.terminalIds.has(session.currentCardId) ? 'terminal' : 'abandoned',
    steps: session.history.length,
    history: session.history,
    evidenceRevealedCount: session.evidenceRevealed.size,
    currentCardId: session.currentCardId
  };
}

/**
 * Export deck as plain JSON
 * @param {Object} deck
 * @returns {Object}
 */
export function exportDeckJson(deck) {
  const cards = [];
  for (const card of deck.cards.values()) {
    cards.push({
      id: card.id,
      title: card.title,
      narrative: card.narrative,
      evidence: card.evidence,
      choices: card.choices,
      isTerminal: card.isTerminal
    });
  }
  return {
    title: deck.title,
    description: deck.description,
    cards
  };
}

/**
 * Import deck from JSON (validates before changing)
 * @param {string} jsonString
 * @returns {Object} { success: boolean, deckObj|null, errors: string[] }
 */
export function importDeckJson(jsonString) {
  if (typeof jsonString !== 'string' || new TextEncoder().encode(jsonString).length > MAX_IMPORT_BYTES) return {success:false,deckObj:null,errors:['Import exceeds 1 MiB size limit']};
  try {
    const parsed = JSON.parse(jsonString);
    const result = validateDeck(parsed);
    if (result.valid) {
      return { success: true, deckObj: result.deckObj, errors: [] };
    }
    return { success: false, deckObj: null, errors: result.errors };
  } catch (e) {
    return { success: false, deckObj: null, errors: ['Invalid JSON: ' + e.message] };
  }
}

/**
 * Check if current card is terminal
 * @param {Object} session
 * @returns {boolean}
 */
export function isTerminal(session) {
  return session.deck.terminalIds.has(session.currentCardId);
}

/**
 * Get current card from session
 * @param {Object} session
 * @returns {Object|undefined}
 */
export function getCurrentCard(session) {
  return session.deck.cards.get(session.currentCardId);
}

/**
 * Get choices available from current card
 * @param {Object} session
 * @returns {Array}
 */
export function getCurrentChoices(session) {
  const card = getCurrentCard(session);
  return card ? card.choices : [];
}

/**
 * Get evidence for current card
 * @param {Object} session
 * @returns {Array}
 */
export function getCurrentEvidence(session) {
  const card = getCurrentCard(session);
  return card ? card.evidence : [];
}

/**
 * Reset session to start
 * @param {Object} session
 * @returns {Object} New session
 */
export function resetSession(session) {
  return {
    ...session,
    history: [],
    currentCardId: session.deck.startId,
    evidenceRevealed: new Set(),
    isAuthoring: false,
    authorCard: null
  };
}

/**
 * Test if session exceeded max length
 * @param {Object} session
 * @returns {boolean}
 */
export function isSessionOverMax(session) {
  return session.history.length >= MAX_SESSION_LENGTH;
}