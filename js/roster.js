// Fills a roster page from Supabase. Shows real players first, then OPEN slots up to the team's roster size.
import { SUPABASE_URL, SUPABASE_KEY } from './supabase-config.js';

const grid = document.getElementById('rosterGrid');
const empty = document.getElementById('rosterEmpty');
const note = document.getElementById('rosterNote');
const teamId = grid?.dataset.team;

const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

async function get(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function slot(p) {
  if (!p) return '<div class="roster-slot"><span class="roster-num">#</span><span class="roster-name">OPEN</span></div>';
  const num = p.jersey_number ?? '';
  const name = `${p.first_name} ${p.last_name}`.trim();
  const meta = [p.position, p.note].filter(Boolean).join(' · ');
  return `<div class="roster-slot filled">
    <span class="roster-num">${num === '' ? '#' : '#' + esc(num)}</span>
    <span class="roster-player">${esc(name)}</span>
    ${meta ? `<span class="roster-meta">${esc(meta)}</span>` : ''}
  </div>`;
}

async function load() {
  if (!grid || !teamId) return;
  try {
    const [[team], players] = await Promise.all([
      get(`bdelite_teams?id=eq.${encodeURIComponent(teamId)}&select=roster_size`),
      get(`bdelite_players?team_id=eq.${encodeURIComponent(teamId)}&select=*&order=jersey_number.asc.nullslast,last_name.asc`),
    ]);
    const size = Math.max(team?.roster_size ?? 0, players.length);
    grid.innerHTML = players.map(slot).join('') + Array.from({ length: size - players.length }, () => slot(null)).join('');
    if (players.length > 0) {
      empty?.classList.add('is-hidden');
      if (note) note.textContent = players.length >= (team?.roster_size ?? 0)
        ? 'Full roster.'
        : `${players.length} of ${team.roster_size} spots filled.`;
    }
  } catch (err) {
    // Leave the static OPEN placeholders in place if the roster can't be loaded.
    console.warn('Roster unavailable:', err);
  }
}

load();
