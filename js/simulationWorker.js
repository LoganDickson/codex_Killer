let cancelled = false;

self.onmessage = async (e) => {
  const msg = e.data;
  if (msg.type === 'cancel') {
    cancelled = true;
    return;
  }

  cancelled = false;
  const { deckA, deckB, cards, iterations } = msg;
  const total = Math.min(Math.max(1, iterations), 10000);
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  const expand = (deck) => {
    const arr = [];
    deck.forEach(({ cardId, quantity }) => {
      const card = cardMap.get(cardId);
      if (!card) return;
      for (let i = 0; i < quantity; i += 1) arr.push(card);
    });
    return arr.slice(0, 60);
  };

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const score = (card, ink) => {
    if (card.inkCost > ink) return -999;
    return (card.loreValue || 0) * 3 + (card.strength || 0) * 1.2 + (card.cardType === 'Action' ? 0.8 : 0) - card.inkCost * 0.5 + (card.isInkable ? 0.3 : 0);
  };

  const turn = (p, turnNo) => {
    if (p.draw.length) p.hand.push(p.draw.pop());
    if (turnNo > 0) {
      const inkIdx = p.hand.findIndex((c) => c.isInkable);
      if (inkIdx >= 0) {
        p.hand.splice(inkIdx, 1);
        p.ink += 1;
      }
    }

    let available = p.ink;
    while (available > 0) {
      let best = -1;
      let bestScore = -999;
      p.hand.forEach((c, idx) => {
        const s = score(c, available);
        if (s > bestScore) {
          bestScore = s;
          best = idx;
        }
      });
      if (best < 0 || bestScore < 0) break;
      const played = p.hand.splice(best, 1)[0];
      available -= played.inkCost;
      p.lore += played.loreValue || 0;
      if (played.cardType === 'Character') p.lore += Math.max(0, Math.floor((played.strength || 0) / 4));
    }
    p.lore += Math.min(2, Math.floor(available / 2));
  };

  const listA = expand(deckA);
  const listB = expand(deckB);

  let aWins = 0;
  let bWins = 0;
  let fpWins = 0;
  let turns = 0;
  const turnDist = {};

  for (let i = 0; i < total; i += 1) {
    if (cancelled) {
      self.postMessage({ type: 'cancelled' });
      return;
    }

    const aFirst = i % 2 === 0;
    const a = { draw: shuffle(listA), hand: [], ink: 0, lore: 0 };
    const b = { draw: shuffle(listB), hand: [], ink: 0, lore: 0 };
    a.hand = a.draw.splice(0, 7);
    b.hand = b.draw.splice(0, 7);

    let t = 1;
    while (t < 40) {
      if (aFirst) {
        turn(a, t); if (a.lore >= 20) break;
        turn(b, t);
      } else {
        turn(b, t); if (b.lore >= 20) break;
        turn(a, t);
      }
      if (a.lore >= 20 || b.lore >= 20) break;
      t += 1;
    }

    turns += t;
    turnDist[t] = (turnDist[t] || 0) + 1;

    const aWin = a.lore >= b.lore;
    if (aWin) {
      aWins += 1;
      if (aFirst) fpWins += 1;
    } else {
      bWins += 1;
      if (!aFirst) fpWins += 1;
    }

    if ((i + 1) % 100 === 0 || i + 1 === total) {
      self.postMessage({ type: 'progress', completed: i + 1, total });
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  self.postMessage({
    type: 'done',
    result: {
      deckAWinRate: (aWins / total) * 100,
      deckBWinRate: (bWins / total) * 100,
      averageTurns: turns / total,
      firstPlayerWinRate: (fpWins / total) * 100,
      turnDistribution: turnDist
    }
  });
};
