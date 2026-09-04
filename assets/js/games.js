/* Oxide HUB — Supported Games.
 * The catalog comes from the Oxide backend worker. Banners are served from its
 * asset endpoint, and each card opens the matching Roblox experience.
 */
'use strict';

const API_BASE = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ? '/api' : 'https://premium-keys.oxide-premium.workers.dev';
const els = {
  grid: document.getElementById('games-grid'),
  count: document.getElementById('games-count'),
  search: document.getElementById('game-search'),
  empty: document.getElementById('empty-state'),
  error: document.getElementById('error-banner'),
};
let games = [];

const icon = (name) => `<svg class="ui-icon" aria-hidden="true"><use href="/assets/icons.svg#icon-${name}"></use></svg>`;

function renderSkeletons(count = 8) {
  els.grid.replaceChildren(...Array.from({ length: count }, () => {
    const card = document.createElement('div');
    card.className = 'skel glass';
    card.innerHTML = '<div class="skel-banner"></div><div class="skel-name"></div>';
    return card;
  }));
}

function card(game) {
  const a = document.createElement('a');
  a.className = 'game-card glass';
  a.href = `https://www.roblox.com/games/${encodeURIComponent(game.place_id)}`;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', `Open ${game.name} on Roblox`);

  const banner = document.createElement('div');
  banner.className = 'game-card-banner';
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  img.addEventListener('error', () => { img.remove(); });
  img.src = `${API_BASE}/banner/${encodeURIComponent(game.name)}.webp`;
  banner.appendChild(img);

  const footer = document.createElement('div');
  footer.className = 'game-card-footer';
  const name = document.createElement('div');
  name.className = 'game-card-name';
  name.textContent = game.name;
  const open = document.createElement('span');
  open.className = 'game-card-open';
  open.innerHTML = `Open ${icon('external-link')}`;
  footer.append(name, open);
  a.append(banner, footer);
  return a;
}

function render() {
  const query = els.search.value.trim().toLowerCase();
  const list = query ? games.filter((game) => game.name.toLowerCase().includes(query)) : games;
  els.grid.replaceChildren(...list.map(card));
  els.empty.hidden = list.length > 0;
  if (els.count) {
    const label = els.count.querySelector('span');
    if (label) label.textContent = query ? `${list.length} matches` : `${games.length} supported games`;
  }
}

renderSkeletons();
els.search.addEventListener('input', render);

fetch(`${API_BASE}/games`)
  .then((response) => { if (!response.ok) throw new Error(`API error ${response.status}`); return response.json(); })
  .then((data) => {
    games = (data.games || []).slice().reverse();
    render();
  })
  .catch(() => {
    els.grid.replaceChildren();
    els.error.hidden = false;
    els.error.textContent = 'The catalog could not be loaded. Try refreshing in a moment.';
  });
