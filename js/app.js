const INK_COLORS = ['Amber', 'Amethyst', 'Emerald', 'Ruby', 'Sapphire', 'Steel'];
const CARD_TYPES = ['Character', 'Action', 'Item', 'Location'];
const MIN_DECK_SIZE = 60;
const MAX_COPIES = 4;
const STORE_KEY = 'lorcana_plain_static_store';

const state = {
  cards: [],
  filters: { inkColors: [], inkCostMin: 0, inkCostMax: 10, inkableOnly: false, legality: 'All', cardTypes: [], searchText: '' },
  activeDeckName: 'Untitled Deck',
  activeDeck: [],
  savedDecks: [],
  simWorker: null,
  simResult: null
};

const $ = (id) => document.getElementById(id);

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.activeDeckName = parsed.activeDeckName || state.activeDeckName;
    state.activeDeck = parsed.activeDeck || [];
    state.savedDecks = parsed.savedDecks || [];
  } catch {}
}

function saveStore() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ activeDeckName: state.activeDeckName, activeDeck: state.activeDeck, savedDecks: state.savedDecks }));
}

function deckSize(deck = state.activeDeck) { return deck.reduce((sum, e) => sum + e.quantity, 0); }
function cardById(id) { return state.cards.find((c) => c.id === id); }

function deckErrors() {
  const errors = [];
  const size = deckSize();
  if (size < MIN_DECK_SIZE) errors.push(`Deck must contain at least ${MIN_DECK_SIZE} cards (currently ${size}).`);
  const over = state.activeDeck.filter((e) => e.quantity > MAX_COPIES);
  if (over.length) errors.push(`Cards over copy limit (${MAX_COPIES}): ${over.map((e) => e.cardId).join(', ')}`);
  return errors;
}

function toggleMulti(arr, value) {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

function filteredCards() {
  const f = state.filters;
  const t = f.searchText.toLowerCase();
  return state.cards.filter((c) => {
    if (f.inkColors.length && !f.inkColors.includes(c.inkColor)) return false;
    if (c.inkCost < f.inkCostMin || c.inkCost > f.inkCostMax) return false;
    if (f.inkableOnly && !c.isInkable) return false;
    if (f.legality !== 'All' && c.legality !== f.legality) return false;
    if (f.cardTypes.length && !f.cardTypes.includes(c.cardType)) return false;
    if (t && !`${c.name} ${c.abilities || ''}`.toLowerCase().includes(t)) return false;
    return true;
  });
}

function addCard(cardId) {
  const found = state.activeDeck.find((e) => e.cardId === cardId);
  if (found) {
    if (found.quantity >= MAX_COPIES) return;
    found.quantity += 1;
  } else {
    state.activeDeck.push({ cardId, quantity: 1 });
  }
  saveStore();
  render();
}

function removeCard(cardId) {
  const found = state.activeDeck.find((e) => e.cardId === cardId);
  if (!found) return;
  found.quantity -= 1;
  state.activeDeck = state.activeDeck.filter((e) => e.quantity > 0);
  saveStore();
  render();
}

function saveDeck() {
  const now = Date.now();
  state.savedDecks.push({ id: String(now), name: state.activeDeckName, cards: structuredClone(state.activeDeck), updatedAt: now });
  saveStore();
  render();
}

function loadDeck(id) {
  const d = state.savedDecks.find((x) => x.id === id);
  if (!d) return;
  state.activeDeck = structuredClone(d.cards);
  state.activeDeckName = d.name;
  $('deck-name').value = state.activeDeckName;
  saveStore();
  render();
}

function deleteDeck(id) {
  state.savedDecks = state.savedDecks.filter((d) => d.id !== id);
  saveStore();
  render();
}

function exportDeck() {
  const txt = state.activeDeck.map((e) => `${e.quantity} ${cardById(e.cardId)?.name || ''}`).join('\n');
  navigator.clipboard.writeText(txt);
  alert('Copied deck to clipboard');
}

function importDeck() {
  const text = $('import-text').value.trim();
  if (!text) return;
  const entries = [];
  text.split('\n').forEach((line) => {
    const m = line.match(/^(\d+)\s+(.+)$/);
    if (!m) return;
    const qty = Math.min(MAX_COPIES, Number(m[1]));
    const card = state.cards.find((c) => c.name.toLowerCase() === m[2].trim().toLowerCase());
    if (card) entries.push({ cardId: card.id, quantity: qty });
  });
  state.activeDeck = entries;
  state.activeDeckName = `${state.activeDeckName} (Imported)`;
  $('deck-name').value = state.activeDeckName;
  saveStore();
  render();
}

function renderBars(rootId, data, valueKey = 'value') {
  const root = $(rootId);
  root.innerHTML = '';
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  data.forEach((d) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${Math.max(8, (d[valueKey] / max) * 140)}px`;
    bar.title = `${d.label}: ${d[valueKey]}`;
    bar.textContent = d[valueKey];
    const label = document.createElement('small');
    label.textContent = d.label;
    bar.appendChild(label);
    root.appendChild(bar);
  });
}

function render() {
  const cards = filteredCards();
  $('card-count').textContent = String(cards.length);

  $('catalog').innerHTML = cards.map((c) => `
    <div class="card">
      <strong>${c.name}</strong><br>
      <small>${c.inkColor} · Cost ${c.inkCost} · ${c.cardType} · ${c.legality}</small>
      <p>${c.abilities || ''}</p>
      <button data-add="${c.id}">Add</button>
    </div>`).join('');

  $('deck-size').textContent = `Deck size: ${deckSize()}`;
  $('validation').innerHTML = deckErrors().map((e) => `<div>${e}</div>`).join('');

  $('deck-list').innerHTML = state.activeDeck.map((e) => {
    const c = cardById(e.cardId);
    return `<div class="deck-entry"><strong>${e.quantity}x ${c?.name || e.cardId}</strong>
      <div class="row"><button data-minus="${e.cardId}">-</button><button data-plus="${e.cardId}">+</button></div></div>`;
  }).join('');

  $('saved-decks').innerHTML = state.savedDecks.map((d) => `
    <div class="saved-entry">
      <strong>${d.name}</strong>
      <div class="row"><button data-load="${d.id}">Load</button><button data-delete="${d.id}">Delete</button></div>
    </div>`).join('');

  const mana = {};
  const colors = {};
  const types = {};
  state.activeDeck.forEach((e) => {
    const c = cardById(e.cardId);
    if (!c) return;
    mana[c.inkCost] = (mana[c.inkCost] || 0) + e.quantity;
    colors[c.inkColor] = (colors[c.inkColor] || 0) + e.quantity;
    types[c.cardType] = (types[c.cardType] || 0) + e.quantity;
  });
  renderBars('mana-chart', Object.keys(mana).sort((a,b)=>a-b).map((k) => ({ label: k, value: mana[k] })));
  renderBars('color-chart', Object.entries(colors).map(([label, value]) => ({ label, value })));
  renderBars('type-chart', Object.entries(types).map(([label, value]) => ({ label, value })));

  const deckOptions = ['<option value="">Select deck</option>']
    .concat(state.savedDecks.map((d) => `<option value="${d.id}">${d.name}</option>`));
  $('deck-a').innerHTML = deckOptions.join('');
  $('deck-b').innerHTML = deckOptions.join('');
}

function wireEvents() {
  document.body.addEventListener('click', (e) => {
    const t = e.target;
    if (t.dataset.add) addCard(t.dataset.add);
    if (t.dataset.plus) addCard(t.dataset.plus);
    if (t.dataset.minus) removeCard(t.dataset.minus);
    if (t.dataset.load) loadDeck(t.dataset.load);
    if (t.dataset.delete) deleteDeck(t.dataset.delete);
  });

  $('save-deck').onclick = saveDeck;
  $('clear-deck').onclick = () => { state.activeDeck = []; saveStore(); render(); };
  $('export-deck').onclick = exportDeck;
  $('import-deck').onclick = importDeck;
  $('deck-name').oninput = (e) => { state.activeDeckName = e.target.value; saveStore(); };

  $('search').oninput = (e) => { state.filters.searchText = e.target.value; render(); };
  $('cost-min').oninput = (e) => { state.filters.inkCostMin = Number(e.target.value); $('cost-min-value').textContent = e.target.value; render(); };
  $('cost-max').oninput = (e) => { state.filters.inkCostMax = Number(e.target.value); $('cost-max-value').textContent = e.target.value; render(); };
  $('inkable-only').onchange = (e) => { state.filters.inkableOnly = e.target.checked; render(); };
  $('legality').onchange = (e) => { state.filters.legality = e.target.value; render(); };

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.onclick = () => {
      location.hash = tab.dataset.route;
      setRoute();
    };
  });

  $('run-sim').onclick = runSimulation;
  $('cancel-sim').onclick = () => state.simWorker?.postMessage({ type: 'cancel' });
}

function drawFilterChips() {
  $('ink-colors').innerHTML = INK_COLORS.map((c) => `<button class="chip ${state.filters.inkColors.includes(c) ? 'active' : ''}" data-ink="${c}">${c}</button>`).join('');
  $('card-types').innerHTML = CARD_TYPES.map((c) => `<button class="chip ${state.filters.cardTypes.includes(c) ? 'active' : ''}" data-type="${c}">${c}</button>`).join('');

  $('ink-colors').onclick = (e) => {
    const t = e.target;
    if (!t.dataset.ink) return;
    state.filters.inkColors = toggleMulti(state.filters.inkColors, t.dataset.ink);
    drawFilterChips();
    render();
  };

  $('card-types').onclick = (e) => {
    const t = e.target;
    if (!t.dataset.type) return;
    state.filters.cardTypes = toggleMulti(state.filters.cardTypes, t.dataset.type);
    drawFilterChips();
    render();
  };
}

function setRoute() {
  const hash = location.hash || '#builder';
  document.querySelectorAll('.page').forEach((p) => p.classList.toggle('active', `#${p.id}` === hash));
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.route === hash));
}

function runSimulation() {
  const deckA = state.savedDecks.find((d) => d.id === $('deck-a').value);
  const deckB = state.savedDecks.find((d) => d.id === $('deck-b').value);
  const iterations = Number($('sim-count').value || '0');

  if (!deckA || !deckB) return alert('Select both decks.');
  if (iterations > 10000) {
    $('sim-warning').classList.remove('hidden');
    return;
  }
  $('sim-warning').classList.add('hidden');

  $('progress-wrap').classList.remove('hidden');
  $('progress-text').textContent = '0%';
  $('progress-bar').style.width = '0%';

  if (state.simWorker) state.simWorker.terminate();
  state.simWorker = new Worker('./js/simulationWorker.js');
  state.simWorker.onmessage = (e) => {
    const msg = e.data;
    if (msg.type === 'progress') {
      const pct = ((msg.completed / msg.total) * 100).toFixed(1);
      $('progress-text').textContent = `${pct}%`;
      $('progress-bar').style.width = `${pct}%`;
    }
    if (msg.type === 'cancelled') {
      $('result-summary').textContent = 'Simulation cancelled.';
      state.simWorker.terminate();
    }
    if (msg.type === 'done') {
      state.simResult = msg.result;
      drawResults();
      state.simWorker.terminate();
    }
  };
  state.simWorker.postMessage({ type: 'start', deckA: deckA.cards, deckB: deckB.cards, cards: state.cards, iterations });
}

function drawResults() {
  const r = state.simResult;
  if (!r) return;
  $('result-summary').textContent = `Deck A ${r.deckAWinRate.toFixed(2)}% · Deck B ${r.deckBWinRate.toFixed(2)}% · Avg Turns ${r.averageTurns.toFixed(2)} · First Player ${r.firstPlayerWinRate.toFixed(2)}%`;
  renderBars('win-chart', [{ label: 'Deck A', value: Number(r.deckAWinRate.toFixed(2)) }, { label: 'Deck B', value: Number(r.deckBWinRate.toFixed(2)) }]);
  const turnData = Object.entries(r.turnDistribution).sort((a, b) => Number(a[0]) - Number(b[0])).map(([label, value]) => ({ label, value }));
  renderBars('turn-chart', turnData);
}

async function init() {
  loadStore();
  const res = await fetch('./data/cards.json');
  state.cards = await res.json();
  wireEvents();
  drawFilterChips();
  setRoute();
  window.addEventListener('hashchange', setRoute);
  $('deck-name').value = state.activeDeckName;
  render();
}

init();
