import './style.css';
import './patch.css';

type Route = '/' | '/demo' | '/privacy' | '/terms';
type GamePhase = 'ready' | 'playing' | 'paused' | 'postcard';

const habitats = [
  { name: 'Drainway', weather: 'Warm drizzle', color: '#82b7b9' },
  { name: 'Moss Court', weather: 'Breezy moss', color: '#b9d76c' },
  { name: 'Window Garden', weather: 'Soft sun', color: '#db7250' }
];

const app = document.querySelector<HTMLDivElement>('#app')!;
let isDemo = location.pathname === '/demo' || location.search.includes('demo=1');
let activeGame: Game | null = null;
const storeKey = (key: string) => `${isDemo ? 'demo:' : ''}couch-creatures:${key}`;

function settings() {
  return {
    assist: localStorage.getItem(storeKey('assist')) === 'true',
    mute: localStorage.getItem(storeKey('mute')) === 'true'
  };
}
function saveSetting(key: 'assist' | 'mute', value: boolean) { localStorage.setItem(storeKey(key), String(value)); }
function route(): Route | '404' {
  return (['/', '/demo', '/privacy', '/terms'] as string[]).includes(location.pathname) ? location.pathname as Route : '404';
}
function go(path: Route) { history.pushState({}, '', path); render(); }
function link(path: Route, label: string, cls = '') { return `<a class="${cls}" href="${path}" data-route>${label}</a>`; }

function shell(content: string, title: string, description: string) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  app.innerHTML = `
    <a class="skip-link" href="#main">Skip to game</a>
    <header class="site-header"><a class="wordmark" href="/" data-route aria-label="Couch Creatures home"><span aria-hidden="true">▰</span> Couch Creatures</a>
      <nav aria-label="Main navigation">${link('/demo', 'Demo')}${link('/privacy', 'Privacy')}${link('/terms', 'Terms')}</nav></header>
    ${isDemo ? `<aside class="demo-banner" aria-label="Demo status"><strong>Demo — sample data, nothing is saved</strong><button class="text-button" id="reset-demo">Reset demo</button><button class="text-button" id="start-real">Start for real</button></aside>` : ''}
    <main id="main" tabindex="-1">${content}</main>
    <footer><span>A gentle shared-screen rescue game.</span>${link('/privacy', 'Privacy')}${link('/terms', 'Terms')}<span>Built by Param Factory · v1.0.0</span><small>Artwork is AI-generated and original to Couch Creatures.</small></footer>
    <div class="sr-only" id="route-announcer" aria-live="polite"></div>`;
  app.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); go(a.getAttribute('href') as Route); }));
  app.querySelector('#reset-demo')?.addEventListener('click', () => { Object.keys(localStorage).filter(k => k.startsWith('demo:couch-creatures:')).forEach(k => localStorage.removeItem(k)); go('/demo'); });
  app.querySelector('#start-real')?.addEventListener('click', () => { isDemo = false; go('/'); });
  requestAnimationFrame(() => { const h1 = document.querySelector<HTMLElement>('h1'); h1?.focus(); document.querySelector('#route-announcer')!.textContent = h1?.textContent || ''; });
}

function legalPage(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  shell(`<section class="legal"><p class="eyebrow">Couch Creatures</p><h1>${privacy ? 'Privacy for shared play' : 'Terms for Couch Creatures'}</h1>
  ${privacy ? `<p>Couch Creatures does not ask for names, accounts, photos, contacts, or location.</p><h2>What stays on this device</h2><p>Your assist and sound choices stay in this browser. They are not sent anywhere.</p><h2>Demo mode</h2><p>The demo uses a separate local storage key. Reset demo clears it.</p><h2>Questions</h2><p>Email <a href="mailto:hello@sociobot.in">hello@sociobot.in</a> for privacy questions.</p>` : `<p>Couch Creatures is free to play. It is provided as-is for gentle shared play.</p><h2>Safe play</h2><p>An adult should choose what is suitable for their household. Do not use the game while walking or driving.</p><h2>No purchases</h2><p>This version has no purchases, ads, or paid features.</p><h2>Changes</h2><p>We may update the game or these terms. A new date will appear here.</p>`}</section>`, `${privacy ? 'Privacy' : 'Terms'} — Couch Creatures`, privacy ? 'How Couch Creatures keeps shared-play settings on your device.' : 'Terms for the Couch Creatures shared-screen game.');
}

function landing() {
  shell(`<section class="game-layout" aria-labelledby="page-title">
    <div class="intro-panel"><p class="eyebrow">Shared keyboard rescue</p><h1 id="page-title">Guide creatures home together</h1><p class="lead">For families sharing one screen, turn two keys into a calm creature rescue.</p>
      <div class="actions">${link('/demo', 'Try it with sample data', 'button primary')}<span>Starts the three-habitat rescue.</span></div>
      <ul class="facts"><li>No account or child data</li><li>Free to play</li><li>Keyboard and touch pads</li></ul>
      <div class="control-note"><strong>Player one</strong> A / D &nbsp; <strong>Player two</strong> J / L<br><span>Move your lanterns. Nearby creatures follow them home.</span></div>
    </div>
    <figure class="route-art"><canvas id="landing-game" aria-label="A playable Couch Creatures rescue board preview. Use A and D for player one, and J and L for player two." role="img"></canvas><figcaption>Press A/D and J/L here, or start the sample rescue below.</figcaption></figure>
  </section>
  <section class="live-preview" aria-labelledby="preview-title"><div><p class="eyebrow">Play on this screen</p><h2 id="preview-title">Rescue board</h2><p>Move two lanterns along a route. Creatures trust nearby light and follow it to shelter.</p></div><button class="button primary" id="play-here">Start a local rescue</button></section>
  <figure class="world-art"><img src="/moss-rescue.webp" width="1200" height="800" loading="lazy" decoding="async" alt="Three small creatures approach a mossy concrete shelter together."><figcaption>Every run changes the weather, creature traits, and route markings.</figcaption></figure>
  <section class="steps" aria-labelledby="how-title"><h2 id="how-title">How shared play works</h2><ol><li><strong>Choose two lanes.</strong><span>Use A/D and J/L, or tap the two touch pads.</span></li><li><strong>Guide creatures.</strong><span>Stay close so shy creatures follow your lantern.</span></li><li><strong>Make a postcard.</strong><span>Finish three habitats for a group picture.</span></li></ol></section>
  <section class="privacy-strip" aria-labelledby="not-title"><h2 id="not-title">What this game does not do</h2><p>It has no chat, ads, accounts, behavioral tracking, or competitive matchmaking. It only keeps optional settings in this browser.</p></section>`, 'Couch Creatures — Guide creatures home together', 'A gentle shared-screen rescue game for two to four players.');
  activeGame = new Game(document.querySelector('#landing-game')!, () => {});
  document.querySelector('#play-here')?.addEventListener('click', () => { isDemo = false; go('/demo'); });
}

class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  phase: GamePhase = 'ready';
  habitat = 0;
  rescued = 0;
  creatures: { x: number; y: number; hue: string; wobble: number }[] = [];
  lanterns = [150, 420];
  keys = new Set<string>();
  last = 0; accumulator = 0; raf = 0;
  assist = settings().assist; mute = settings().mute;
  onUpdate: () => void;
  resizeHandler = () => this.resize(); visibilityHandler = () => { this.last = 0; };
  keyDownHandler = (e: KeyboardEvent) => { if (['a','d','j','l',' ','Escape'].includes(e.key.toLowerCase())) e.preventDefault(); if (e.key === 'Escape') this.togglePause(); else { this.keys.add(e.key.toLowerCase()); if (this.phase === 'ready' && e.key !== 'Escape') this.start(); } };
  keyUpHandler = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());
  constructor(canvas: HTMLCanvasElement, onUpdate: () => void) { this.canvas = canvas; this.ctx = canvas.getContext('2d')!; this.onUpdate = onUpdate; this.reset(); this.resize(); addEventListener('resize', this.resizeHandler); document.addEventListener('visibilitychange', this.visibilityHandler); this.bind(); this.raf = requestAnimationFrame(t => this.frame(t)); }
  reset() { this.habitat = 0; this.rescued = 0; this.lanterns = [145, 415]; this.makeCreatures(); this.phase = 'ready'; }
  makeCreatures() { const colors = ['#d8aa58', '#82b7b9', '#db7250', '#f4efd9']; this.creatures = Array.from({ length: 4 }, (_, i) => ({ x: 130 + i * 55, y: 92 + ((i * 71 + this.habitat * 37) % 180), hue: colors[(i + this.habitat) % 4], wobble: i * 1.7 })); }
  bind() {
    addEventListener('keydown', this.keyDownHandler);
    addEventListener('keyup', this.keyUpHandler);
  }
  destroy() { cancelAnimationFrame(this.raf); removeEventListener('resize', this.resizeHandler); document.removeEventListener('visibilitychange', this.visibilityHandler); removeEventListener('keydown', this.keyDownHandler); removeEventListener('keyup', this.keyUpHandler); }
  start() { if (this.phase === 'ready') { this.phase = 'playing'; this.onUpdate(); } }
  togglePause() { if (this.phase === 'playing') { this.phase = 'paused'; this.onUpdate(); } else if (this.phase === 'paused') { this.phase = 'playing'; this.onUpdate(); } }
  move(player: number, dir: number) { this.start(); this.lanterns[player] = Math.max(66, Math.min(548, this.lanterns[player] + dir * 22)); }
  helpHerd() { this.start(); this.creatures.forEach(c => c.x += this.assist ? 115 : 78); }
  step() {
    if (this.phase !== 'playing') return;
    const speed = this.assist ? 118 : 160;
    if (this.keys.has('a')) this.lanterns[0] = Math.max(66, this.lanterns[0] - speed / 60);
    if (this.keys.has('d')) this.lanterns[0] = Math.min(548, this.lanterns[0] + speed / 60);
    if (this.keys.has('j')) this.lanterns[1] = Math.max(66, this.lanterns[1] - speed / 60);
    if (this.keys.has('l')) this.lanterns[1] = Math.min(548, this.lanterns[1] + speed / 60);
    for (const c of [...this.creatures]) {
      c.wobble += 0.035;
      const nearest = this.lanterns.reduce((best, x) => Math.abs(x - c.x) < Math.abs(best - c.x) ? x : best, this.lanterns[0]);
      const attraction = Math.abs(nearest - c.x) < (this.assist ? 140 : 112) ? (nearest > c.x ? 1 : -1) * 4.3 : 0;
      c.x += attraction + Math.sin(c.wobble) * .28;
      c.y += Math.cos(c.wobble * .7) * .35;
      c.y = Math.max(58, Math.min(310, c.y));
      if (c.x > 535) { this.creatures.splice(this.creatures.indexOf(c), 1); this.rescued++; this.onUpdate(); }
    }
    if (!this.creatures.length) { if (this.habitat === 2) { this.phase = 'postcard'; this.onUpdate(); } else { this.habitat++; this.makeCreatures(); this.lanterns = [145, 415]; this.onUpdate(); } }
  }
  frame(now: number) { const delta = Math.min(.1, (now - this.last) / 1000 || 0); this.last = now; this.accumulator += delta; while (this.accumulator >= 1 / 60) { this.step(); this.accumulator -= 1 / 60; } this.draw(); this.raf = requestAnimationFrame(t => this.frame(t)); }
  resize() { const rect = this.canvas.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio, 2); this.canvas.width = rect.width * dpr; this.canvas.height = rect.width * .59 * dpr; this.ctx.setTransform(dpr * rect.width / 600, 0, 0, dpr * rect.width / 600, 0, 0); }
  draw() { const c = this.ctx; c.clearRect(0,0,600,354); c.fillStyle = '#202723'; c.fillRect(0,0,600,354); c.fillStyle = '#35403a'; for(let x=0;x<600;x+=100){ c.fillRect(x+4, 10+(x%3)*10, 88, 80); c.fillRect(x+4, 235, 88, 106); } c.strokeStyle = '#6f963e'; c.lineWidth=7; c.setLineDash([18,14]); c.beginPath(); c.moveTo(20,180); c.lineTo(580,180); c.stroke(); c.setLineDash([]); c.fillStyle='#b9d76c'; c.fillRect(550,40,26,270); c.fillStyle='#202723'; c.font='bold 14px Arial'; c.fillText('SHELTER', 522, 28);
    this.lanterns.forEach((x,i)=>{ c.fillStyle=i?'#db7250':'#b9d76c'; c.beginPath(); c.arc(x,180,20,0,Math.PI*2); c.fill(); c.strokeStyle='#f4efd9'; c.lineWidth=3; c.stroke(); c.fillStyle='#202723'; c.fillText(i?'2':'1',x-4,185); });
    this.creatures.forEach(creature=>{ c.save(); c.translate(creature.x,creature.y); const bob=Math.sin(creature.wobble)*3; c.fillStyle=creature.hue; c.beginPath(); c.ellipse(0,bob,19,24,0,0,Math.PI*2); c.fill(); c.strokeStyle='#111612'; c.lineWidth=3; c.stroke(); c.fillStyle='#111612'; c.beginPath(); c.arc(-6,bob-3,3,0,7); c.arc(6,bob-3,3,0,7); c.fill(); c.restore(); });
    c.fillStyle='#f4efd9'; c.font='bold 15px Arial'; c.fillText(`${habitats[this.habitat].weather} · ${this.rescued}/12 rescued`, 20, 332);
    if(this.phase==='ready'||this.phase==='paused'){ c.fillStyle='rgba(17,22,18,.84)'; c.fillRect(155,118,290,112); c.fillStyle='#f4efd9'; c.textAlign='center'; c.font='bold 22px Arial'; c.fillText(this.phase==='paused'?'Paused':'Press a movement key',300,160); c.font='16px Arial'; c.fillText(this.phase==='paused'?'Escape resumes':'or tap a touch pad to begin',300,190); c.textAlign='start'; }
  }
}

function demo() {
  shell(`<section class="game-page"><div class="game-top"><div><p class="eyebrow">Seed: moss-postcard</p><h1>Guide creatures home together</h1><p id="status" aria-live="polite">Habitat 1 of 3: Drainway. Four creatures need shelter.</p></div><button class="button quiet" id="pause">Pause</button></div>
  <div class="canvas-wrap"><canvas id="game" aria-label="Couch Creatures rescue board. Move player one with A and D. Move player two with J and L." role="img"></canvas></div>
  <section class="touch-controls" aria-label="Touch controls"><div><strong>Player one</strong><button class="touch moss" data-player="0" data-dir="-1" aria-label="Move player one left">◀</button><button class="touch moss" data-player="0" data-dir="1" aria-label="Move player one right">▶</button></div><div><strong>Player two</strong><button class="touch clay" data-player="1" data-dir="-1" aria-label="Move player two left">◀</button><button class="touch clay" data-player="1" data-dir="1" aria-label="Move player two right">▶</button></div></section>
  <section class="game-tools" aria-labelledby="settings-title"><h2 id="settings-title">Play settings</h2><label><input id="assist" type="checkbox"> Assist mode slows the creatures</label><label><input id="mute" type="checkbox"> Mute sound</label><button class="button quiet" id="help-herd">Help herd creatures</button><p>Press Escape to pause. Refreshing keeps these settings.</p></section>
  <section class="postcard" id="postcard" hidden aria-labelledby="postcard-title"><img src="/moss-rescue.webp" width="1200" height="800" alt="Three rescued creatures stand at their mossy shelter."><div><p class="eyebrow">Group postcard</p><h2 id="postcard-title">All 12 creatures are home</h2><p>You guided through Drainway, Moss Court, and Window Garden.</p><button class="button primary" id="again">Play again</button></div></section></section>`, 'Demo — Couch Creatures', 'Play a sample three-habitat Couch Creatures rescue game.');
  const game = new Game(document.querySelector('#game')!, update); activeGame = game;
  const status = document.querySelector('#status')!; const postcard = document.querySelector<HTMLDivElement>('#postcard')!;
  function update() { const h = habitats[game.habitat]; status.textContent = game.phase === 'postcard' ? 'The rescue is complete.' : `Habitat ${game.habitat + 1} of 3: ${h.name}. ${game.creatures.length} creatures still need shelter.`; (document.querySelector('#pause') as HTMLButtonElement).textContent = game.phase === 'paused' ? 'Resume' : 'Pause'; postcard.hidden = game.phase !== 'postcard'; }
  document.querySelector('#pause')?.addEventListener('click', () => game.togglePause());
  document.querySelector('#help-herd')?.addEventListener('click', () => game.helpHerd());
  document.querySelectorAll<HTMLButtonElement>('[data-player]').forEach(b => { const act=()=>game.move(Number(b.dataset.player), Number(b.dataset.dir)); b.addEventListener('pointerdown', act); b.addEventListener('click', act); });
  const assist = document.querySelector<HTMLInputElement>('#assist')!; assist.checked=game.assist; assist.addEventListener('change',()=>{game.assist=assist.checked;saveSetting('assist',game.assist);});
  const mute = document.querySelector<HTMLInputElement>('#mute')!; mute.checked=game.mute; mute.addEventListener('change',()=>{game.mute=mute.checked;saveSetting('mute',game.mute);});
  document.querySelector('#again')?.addEventListener('click',()=>{game.reset(); update();});
  update();
}

function notFound() { shell(`<section class="legal"><p class="eyebrow">Route missing</p><h1>This route has no creatures</h1><p>Go back to the rescue board.</p>${link('/', 'Open Couch Creatures', 'button primary')}</section>`, 'Page not found — Couch Creatures', 'The requested Couch Creatures page was not found.'); }
function render() { activeGame?.destroy(); activeGame = null; const r=route(); if(r==='/privacy') legalPage('privacy'); else if(r==='/terms') legalPage('terms'); else if(r==='/demo') demo(); else if(r==='/') landing(); else notFound(); }
addEventListener('popstate', render); render();
