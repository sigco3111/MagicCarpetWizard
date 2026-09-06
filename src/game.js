import { spawnEnemies } from './foes.js';
import { breakables, passageAt } from './landscape.js';
import { balanceAt } from './pacing.js';
import { gainFocus } from './focus.js';
export const RADIUS = 680;
export const CHUNK = 64;
export const ZONE_LENGTH = CHUNK * 20;
export const FLIGHT_HALF_WIDTH = 54;
export const MAX_ALTITUDE = 54;
export const LANE_SPACING = 22;
export const ZONES = [
  { name: '앰버 시티', subtitle: '천 개의 지붕. 단 하나의 도로도 없이.', ground: '#dfa06c', sky: '#c3ded7', fog: '#c7d8c5', accent: '#309b98', type: 'city' },
  { name: '술탄의 정원', subtitle: '분수조차 전할 이야기가 있다.', ground: '#89a679', sky: '#c6dfdb', fog: '#bbd5bf', accent: '#dfba66', type: 'palace' },
  { name: '새프론 해변', subtitle: '바람을 따라가라. 오직 경이로움만 남겨라.', ground: '#e6b775', sky: '#d8dfc6', fog: '#e6c895', accent: '#cd7655', type: 'desert' },
  { name: '노래하는 협곡', subtitle: '바위는 지나간 모든 폭풍을 기억한다.', ground: '#bb7963', sky: '#c9c2d3', fog: '#c7a593', accent: '#ce8b69', type: 'canyon' },
  { name: '별의 강', subtitle: '두 영원 사이의 푸른 리본.', ground: '#629f99', sky: '#b0d6d6', fog: '#a2c7be', accent: '#54b8b6', type: 'river' },
  { name: '에메랄드 들판', subtitle: '대지가 초록으로 꿈을 꾸는 곳.', ground: '#9ca971', sky: '#caddca', fog: '#c9cba0', accent: '#67a282', type: 'farm' },
  { name: '조상의 영역', subtitle: '오래된 마법. 새로운 지평.', ground: '#c49186', sky: '#b9b7d1', fog: '#c2a5b3', accent: '#aa89ba', type: 'ancient' },
  { name: '랜턴 어촌', subtitle: '돛, 소금, 그리고 천 개의 작은 소원.', ground: '#cfb995', sky: '#afd9d6', fog: '#bad1c8', accent: '#eea76e', type: 'fishing' },
  { name: '칸다하르 산맥', subtitle: '산이 걷기 시작했다.', ground: '#a99baf', sky: '#c5d7ea', fog: '#b7b9d0', accent: '#e6c2a0', type: 'mountain' },
  { name: '제이드 정글', subtitle: '모든 잎새가 또 다른 세계를 숨기고.', ground: '#648e77', sky: '#c5dc9f', fog: '#9ab99e', accent: '#e7a969', type: 'jungle' },
  { name: '오팔 해변', subtitle: '파도를 스치고, 거품을 쫓아라.', ground: '#efd4a8', sky: '#9fd8dd', fog: '#bde0d8', accent: '#edb99c', type: 'beach' },
  { name: '스파이스 섬', subtitle: '정향, 계피, 그리고 잠든 불꽃.', ground: '#bd947a', sky: '#e1bcb9', fog: '#d4bfa7', accent: '#e4a34f', type: 'island' },
  { name: '산 위의 사원', subtitle: '하늘 끝자락에서 펄럭이는 기도 깃발.', ground: '#b6b2ba', sky: '#c0c5e1', fog: '#ccbacf', accent: '#dca357', type: 'temple' },
];
export const SPELLS = {
  fire: { name: '파이어볼', glyph: '♨', color: '#ffac6d', description: '파이어볼 · 폭발과 남은 불길' },
  frost: { name: '프로스트', glyph: '❄', color: '#9ce8ed', description: '프로스트 · 적을 둔화; 얼린 적은 파이어에 산산조각' },
  storm: { name: '스톰', glyph: 'ϟ', color: '#edda86', description: '스톰 · 번개가 적 사이를 튀어오른다' },
  echo: { name: '에코', glyph: '✧', color: '#d4b6ff', description: '에코 · 추가 마법 볼트' },
  magnet: { name: '자석', glyph: '∪', color: '#8ae0b4', description: '자석 · 18초간 전리품 흡인 · 중첩 시 28 / 40 / 52m' },
  ward: { name: '보호', glyph: '◇', color: '#99ddff', description: '보호 · 하트 회복과 짧은 무적' },
  heart: { name: '하트', glyph: '♥', color: '#ff7292', description: '하트 · 하트 하나 회복' },
  wind: { name: '윈드 블래스트', glyph: '≋', color: '#a6ffdd', description: '윈드 블래스트 · 적 밀치기, 적 탄환 제거, 불길 부채질' },
  rapid: { name: '래피드 파이어', glyph: '»', color: '#ff9ce3', description: '래피드 파이어 · 10초간 빠른 시전' },
  fury: { name: '퓨리', glyph: '✹', color: '#ff7845', description: '퓨리 · 10초간 더 강하고 넓은 마법' },
  focus: { name: '포커스', glyph: '⊕', color: '#c0ff9f', description: '포커스 · 12초간 정밀한 연사와 관통 파이어볼' },
  overdrive: { name: '오버드라이브', glyph: '✷', color: '#e4b0ff', description: '오버드라이브 · 8초간 추가 투사체와 피해' },
};
export const clamp = (x, min, max) => Math.min(max, Math.max(min, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export function random(seed) { let n = seed >>> 0; return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function zoneAt(distance) { return Math.floor(Math.max(0, distance) / ZONE_LENGTH) % ZONES.length; }
export function difficultyAt(distance) { return balanceAt(distance).difficulty; }
export function flightSpeed(altitude, boosting, difficulty = 0) { return (boosting ? 102 : 40 + 36 * Math.exp(-Math.max(0, altitude - 1) / 7)) + difficulty * 3; }
export function createRun(seed = 42) { return { seed, distance: 0, time: 0, x: 0, altitude: 3.5, vx: 0, vy: 0, speed: 30, power: 25, focus: 65, slow: false, ambushTime: 0, spotCooldown: 0, magnetTime: 0, hp: 3, score: 0, chain: 0, chainTimer: 0, bestChain: 1, invulnerable: 2.5, boost: false, roll: 0, rollHeld: false, rollCooldown: 0, rollDirection: 1, shotCooldown: 0, weapon: 'fire', buffs: { rapid: 0, fury: 0, focus: 0, overdrive: 0 }, bosses: 0, spells: { fire: 1, frost: 0, storm: 1, wind: 1, echo: 0, magnet: 0 }, kills: 0, nearMisses: 0, tricks: 0, ended: false, events: [] }; }
export function multiplier(run) { return Math.min(8, 1 + Math.floor(run.chain / 3)); }
export function award(run, points, power = 0, chain = true) { if (chain) { run.chain++; run.chainTimer = 5; } run.score += Math.round(points * multiplier(run)); run.power = clamp(run.power + power, 0, 100); gainFocus(run, power * .45); run.bestChain = Math.max(run.bestChain, multiplier(run)); }
export function collectSpell(run, kind) {
  if (!SPELLS[kind]) return;
  if (kind === 'heart') { run.hp = Math.min(3, run.hp + 1); run.invulnerable = Math.max(run.invulnerable, .8); }
  else if (kind === 'magnet') { run.spells.magnet = Math.min(3, run.spells.magnet + 1); run.magnetTime = Math.min(32, (run.magnetTime || 0) + 18); }
  else if (kind === 'ward') { run.hp = Math.min(3, run.hp + 1); run.invulnerable = Math.max(run.invulnerable, 5); }
  else if (kind in run.buffs) run.buffs[kind] = kind === 'focus' ? 12 : kind === 'overdrive' ? 8 : 10;
  else if (run.spells[kind] >= 3) run.buffs.overdrive = 8;
  else run.spells[kind] = Math.min(3, (run.spells[kind] || 0) + 1);
  award(run, 100, 12);
}
export function damage(run) { if (run.invulnerable > 0 || run.ended) return false; run.hp--; run.invulnerable = 2; run.chain = 0; run.chainTimer = 0; run.roll = 0; run.power = Math.max(0, run.power - 15); if (run.hp <= 0) run.ended = true; return true; }
export function cliffRailAt(distance) {
  const index = Math.floor(Math.max(0, distance) / CHUNK), local = index % 40;
  if (local < 10 || local > 16) return null;
  const side = Math.floor(index / 40) % 2 ? -1 : 1;
  return { side, edge: side * 56, height: 48 };
}
export function updateRun(run, input, dt) {
  if (run.ended) return;
  dt = clamp(dt, 0, .05); run.time += dt;
  run.invulnerable = Math.max(0, run.invulnerable - dt); run.rollCooldown = Math.max(0, run.rollCooldown - dt); run.shotCooldown = Math.max(0, run.shotCooldown - dt);
  const responseDt = dt * (input.controlRate || 1);
  run.vx = lerp(run.vx, input.steer * (run.boost ? 56 : 48), 1 - Math.exp(-(input.steer ? 28 : 36) * responseDt));
  run.vy = lerp(run.vy, input.lift * (input.lift < 0 ? 29 : 25), 1 - Math.exp(-(input.lift ? 25 : 34) * responseDt));
  run.x = clamp(run.x + run.vx * dt, -FLIGHT_HALF_WIDTH, FLIGHT_HALF_WIDTH); run.altitude = clamp(run.altitude + run.vy * dt, 1, MAX_ALTITUDE);
  if ((run.x <= -FLIGHT_HALF_WIDTH && run.vx < 0) || (run.x >= FLIGHT_HALF_WIDTH && run.vx > 0)) run.vx = 0;
  if ((run.altitude <= 1 && run.vy < 0) || (run.altitude >= MAX_ALTITUDE && run.vy > 0)) run.vy = 0;
  if (input.roll && !run.rollHeld && !run.roll && !run.rollCooldown && run.altitude >= 4) { run.roll = .85; run.rollCooldown = 1.35; run.rollDirection = input.steer < 0 ? -1 : 1; }
  run.rollHeld = !!input.roll;
  if (run.roll > 0) { run.roll = Math.max(0, run.roll - dt); if (run.roll === 0 && run.altitude >= 4) { award(run, 90, 11); run.tricks++; run.events.push('roll'); } }
  run.boost = !!input.boost && (run.boost ? run.power > 0 : run.power >= 25);
  const rail = input.arena ? null : cliffRailAt(run.distance);
  run.railing = !!rail && Math.abs(run.x - rail.edge) < 6 && run.altitude > 5 && run.altitude < rail.height - 2;
  run.railClock = run.railing ? (run.railClock || 0) + dt : 0;
  if (run.railClock >= 1) { run.railClock -= 1; award(run, 45, 5); run.events.push('rail'); }
  const rate = run.boost ? -15 : run.railing ? 8 : run.altitude < 3.5 ? 4.5 : .3;
  run.power = clamp(run.power + rate * dt, 0, 100);
  const dive = Math.max(0, -run.vy) * .35;
  run.speed = lerp(run.speed, flightSpeed(run.altitude, run.boost, input.difficulty ?? difficultyAt(run.distance)) + dive + (run.railing ? 18 : 0), 1 - Math.exp(-5 * dt));
  run.distance += run.speed * dt; run.score += run.speed * dt * .2;
  run.chainTimer = Math.max(0, run.chainTimer - dt); if (!run.chainTimer) run.chain = 0;
}
export function safeLaneAt(index, seed) {
  // Meandering phrases explore five lanes, changing at most one lane per row.
  if (index < 2) return 0;
  const phrase = [0, 1, 2, 1, 0, -1, -2, -1];
  const direction = random(seed)() < .5 ? -1 : 1;
  return phrase[Math.floor(index / 2) % phrase.length] * direction;
}
export function segmentHitsSphere(from, to, center, radius) {
  const dx = to.x - from.x, dy = to.y - from.y, ds = to.s - from.s;
  const lengthSquared = dx * dx + dy * dy + ds * ds;
  const t = lengthSquared ? clamp(((center.x - from.x) * dx + (center.y - from.y) * dy + (center.s - from.s) * ds) / lengthSquared, 0, 1) : 0;
  return Math.hypot(from.x + dx * t - center.x, from.y + dy * t - center.y, from.s + ds * t - center.s) <= radius;
}
export function generateChunk(index, seed) {
  const rng = random(seed + index * 104729), start = index * CHUNK;
  const zone = zoneAt(start), balance = balanceAt(start), difficulty = balance.difficulty, type = ZONES[zone].type;
  const obstacles = [], pickups = [], enemies = [], rings = [];
  const safeLane = safeLaneAt(index, seed), rail = cliffRailAt(start);
  // Every row leaves a full flight lane clear. Outer architecture is decoration.
  if (index > 3) {
    for (let lane = -2; lane <= 2; lane++) {
      if (lane === safeLane || (rail && lane === rail.side * 2) || rng() > balance.obstacleChance) continue;
      obstacles.push({ x: lane * LANE_SPACING + (rng() - .5) * 3, s: start + 42 + (rng() - .5) * 8, width: 8 + rng() * 6, height: 9 + rng() * (balance.obstacleHeight + (type === 'canyon' ? 4 : 0)), depth: 8 + rng() * 7, angle: (rng() - .5) * 1.4, type });
    }
  }
  const laneX = safeLane * LANE_SPACING;
  const previousX = safeLaneAt(index - 1, seed) * LANE_SPACING;
  for (let i = 0; i < 8; i++) {
    const t = clamp((6 + i * 7) / 23, 0, 1), ease = t * t * (3 - 2 * t);
    pickups.push({ kind: 'gold', x: lerp(previousX, laneX, ease) + Math.sin(index + i * .7) * .9, s: start + 6 + i * 7, y: 2.3 + (index % 5 === 0 ? Math.sin(i / 7 * Math.PI) * 9 : 0) });
  }
  if (index > 2 && index % 3 === 0) {
    const kinds = ['frost', 'storm', 'echo', 'fire', 'wind', 'magnet', 'ward', 'rapid', 'fury', 'focus'];
    const kind = kinds[Math.floor(rng() * kinds.length)], height = 5.5 + rng() * 5;
    const guaranteedMagnet = index % 12 === 6;
    pickups.push({ kind: guaranteedMagnet ? 'magnet' : kind, x: laneX, s: start + 40, y: guaranteedMagnet ? 3 : height });
  }
  if (index > 3 && index % 9 === 5) pickups.push({ kind: 'heart', x: laneX, s: start + 28, y: 4 });
  enemies.push(...spawnEnemies(type, index, start, difficulty, rng, obstacles));
  if (passageAt(start)) { obstacles.length = 0; enemies.length = 0; rings.length = 0; for (const p of pickups) { p.x *= .45; p.y = Math.min(p.y, 20); } }
  if (index % 4 === 2) rings.push({ x: laneX, s: start + 15, y: 10 + rng() * 13, radius: 5.2 });
  const props = breakables(type, index, start, random(seed + index * 967 + 91)).filter(p => (!passageAt(start) || Math.abs(p.x) + p.radius < 26 && p.y + p.radius < 27) && !obstacles.some(o => Math.abs(p.x - o.x) < 13 && Math.abs(p.s - o.s) < 15) && (p.large ? Math.abs(p.x - laneX) > 10 : Math.abs(p.x - laneX) > 7));
  return { index, start, zone, safeLane, obstacles, pickups, enemies, rings, props };
}
export function obstacleExtents(obstacle) {
  const c = Math.abs(Math.cos(obstacle.angle || 0)), s = Math.abs(Math.sin(obstacle.angle || 0));
  return { x: (c * obstacle.width + s * obstacle.depth) / 2, s: (s * obstacle.width + c * obstacle.depth) / 2 };
}
export function intersectsObstacle(run, obstacle) {
  const dx = run.x - obstacle.x, ds = run.distance - obstacle.s, a = obstacle.angle || 0;
  const localX = Math.cos(a) * dx + Math.sin(a) * ds;
  const localS = -Math.sin(a) * dx + Math.cos(a) * ds;
  return Math.abs(localX) < obstacle.width / 2 + .7 && Math.abs(localS) < obstacle.depth / 2 + .7 && run.altitude < obstacle.height + .6;
}
export function nearObstacle(run, obstacle) {
  const extent = obstacleExtents(obstacle), passed = run.distance - obstacle.s - extent.s;
  const lateral = Math.abs(run.x - obstacle.x);
  return passed > .7 && passed < 4.5 && lateral < extent.x + 4 && run.altitude < obstacle.height + 3 && (lateral > extent.x + .7 || run.altitude > obstacle.height + .6);
}
export function spellDamage(spells, frozen = false) { return (1 + .45 * (spells.fire - 1)) * (frozen && spells.fire ? 1.8 : 1); }
export function paletteAt(distance, seed = 0) {
  const rng = random(seed + Math.floor(Math.max(0, distance) / ZONE_LENGTH) * 1879);
  return { hue: (rng() - .5) * .075, saturation: (rng() - .5) * .12, lightness: (rng() - .5) * .08 };
}
