import "./style.css";
import "./patch.css";
import QRCode from "qrcode";

type Route = "/" | "/demo" | "/privacy" | "/terms" | "/controller";
type Phase = "ready" | "playing" | "paused" | "lost" | "postcard";
type LossReason = "storm" | "deadline";
type Creature = {
  x: number;
  y: number;
  hue: string;
  trait: string;
  progress: number;
  wobble: number;
};
type Hazard = { x: number; y: number; r: number; drift: number };
type Snapshot = {
  phase: Phase;
  habitat: number;
  rescued: number;
  elapsed: number;
  strikes: number;
  lanterns: number[];
  creatures: Creature[];
  seed: string;
  lossReason?: LossReason | null;
};
const app = document.querySelector<HTMLDivElement>("#app")!;
const habitats = ["Drainway", "Moss Court", "Window Garden"];
const weather = [
  "Warm drizzle",
  "Breezy moss",
  "Soft sun",
  "Puddle fog",
  "Chalky wind",
  "Moss light",
];
const playerKeys = [
  ["a", "d"],
  ["j", "l"],
  ["f", "h"],
  ["arrowleft", "arrowright"],
];
const playerColors = ["#b9d76c", "#db7250", "#82b7b9", "#f4efd9"];
const realtimeEndpoint = (
  document.querySelector<HTMLMetaElement>('meta[name="couch-realtime"]')
    ?.content || "/api"
).replace(/\/$/, "");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let activeGame: Game | null = null;
function route(): Route | "404" {
  return (
    ["/", "/demo", "/privacy", "/terms", "/controller"] as string[]
  ).includes(location.pathname)
    ? (location.pathname as Route)
    : "404";
}
function demoMode() {
  return route() === "/demo";
}
function key(name: string) {
  return `${demoMode() ? "demo:" : ""}couch-creatures:${name}`;
}
function readBool(name: string) {
  return localStorage.getItem(key(name)) === "true";
}
function setBool(name: string, v: boolean) {
  localStorage.setItem(key(name), String(v));
}
function go(path: Route) {
  history.pushState({}, "", path);
  render(true);
}
function link(path: Route, label: string, cls = "") {
  return `<a class="${cls}" href="${path}" data-route>${label}</a>`;
}
function makeSeed() {
  return `moss-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
}
function hash(seed: string) {
  let n = 2166136261;
  for (const char of seed) n = Math.imul(n ^ char.charCodeAt(0), 16777619);
  return n >>> 0;
}
// Normalize the unsigned integer before callers use it as a coordinate fraction.
export function rng(seed: string) {
  let n = hash(seed);
  return () =>
    (((n = Math.imul(n ^ (n >>> 15), 1 | n)) ^
      (n + Math.imul(n ^ (n >>> 7), 61 | n))) >>>
      0) /
    4294967296;
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function validCreature(value: unknown): value is Creature {
  const c = value as Creature;
  return (
    !!c &&
    typeof c === "object" &&
    ["x", "y", "progress", "wobble"].every((k) =>
      Number.isFinite(c[k as keyof Creature] as number),
    ) &&
    typeof c.hue === "string" &&
    typeof c.trait === "string"
  );
}
function validSnapshot(value: unknown): value is Snapshot {
  const s = value as Snapshot;
  return (
    !!s &&
    typeof s === "object" &&
    ["ready", "playing", "paused", "lost", "postcard"].includes(s.phase) &&
    Number.isInteger(s.habitat) &&
    s.habitat >= 0 &&
    s.habitat < 3 &&
    Number.isFinite(s.rescued) &&
    Number.isFinite(s.elapsed) &&
    s.elapsed >= 0 &&
    Number.isFinite(s.strikes) &&
    s.strikes >= 0 &&
    typeof s.seed === "string" &&
    !!s.seed &&
    Array.isArray(s.lanterns) &&
    s.lanterns.length === 4 &&
    s.lanterns.every(Number.isFinite) &&
    Array.isArray(s.creatures) &&
    s.creatures.length === 4 &&
    s.creatures.every(validCreature) &&
    (s.lossReason === undefined ||
      s.lossReason === null ||
      ["storm", "deadline"].includes(s.lossReason))
  );
}
function savedRun(): Snapshot | undefined {
  try {
    const raw = localStorage.getItem(key("run"));
    if (!raw) return;
    const s: unknown = JSON.parse(raw);
    if (validSnapshot(s)) return s;
  } catch {}
  localStorage.removeItem(key("run"));
  return;
}
function shell(content: string, title: string, description: string) {
  document.title = title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", description);
  document
    .querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?.setAttribute(
      "href",
      `https://couch-creatures.sociobot.in${location.pathname}`,
    );
  app.innerHTML = `<a class="skip-link" href="#main">Skip to game</a><header class="site-header"><a class="wordmark" href="/" data-route aria-label="Couch Creatures home"><span aria-hidden="true">▰</span> Couch Creatures</a><nav aria-label="Main navigation">${link("/demo", "Demo")}${link("/controller", "Phone controls")}${link("/privacy", "Privacy")}${link("/terms", "Terms")}</nav></header>${demoMode() ? `<aside class="demo-banner" aria-label="Demo status"><strong>Demo — sample data, nothing is saved</strong><button id="reset-demo" class="text-button">Reset demo</button><button id="start-real" class="text-button">Start for real</button></aside>` : ""}<main id="main" tabindex="-1">${content}</main><footer><span>A shared-screen creature rescue for 2–4 players.</span>${link("/privacy", "Privacy")}${link("/terms", "Terms")}<span>Built by Param Factory · v1.3.0</span><small>Artwork is AI-generated and original to Couch Creatures.</small></footer><div id="route-announcer" class="sr-only" aria-live="polite"></div>`;
  app.querySelectorAll<HTMLAnchorElement>("[data-route]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      go(a.getAttribute("href") as Route);
    }),
  );
  app.querySelector("#reset-demo")?.addEventListener("click", () => {
    for (const item of Object.keys(localStorage))
      if (item.startsWith("demo:couch-creatures:"))
        localStorage.removeItem(item);
    go("/demo");
  });
  app.querySelector("#start-real")?.addEventListener("click", () => {
    for (const item of Object.keys(localStorage))
      if (item.startsWith("demo:couch-creatures:"))
        localStorage.removeItem(item);
    go("/");
  });
}
function focusRoute() {
  requestAnimationFrame(() => {
    const h = document.querySelector<HTMLElement>("h1");
    if (h) {
      h.tabIndex = -1;
      h.focus();
    }
    const a = document.querySelector("#route-announcer");
    if (a) a.textContent = h?.textContent || "";
  });
}

class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  onUpdate: () => void;
  phase: Phase = "ready";
  habitat = 0;
  rescued = 0;
  elapsed = 0;
  strikes = 0;
  lossReason: LossReason | null = null;
  lanterns = [90, 230, 370, 510];
  creatures: Creature[] = [];
  hazards: Hazard[] = [];
  seed: string;
  keys = new Set<string>();
  last = 0;
  accumulator = 0;
  raf = 0;
  saveAt = 0;
  assist = readBool("assist");
  readonly habitatSeconds = 180;
  roomSocket: WebSocket | null = null;
  reduced = reducedMotion.matches;
  resizeHandler = () => this.resize();
  motionHandler = () => {
    this.reduced = reducedMotion.matches;
    this.draw();
  };
  visibilityHandler = () => {
    this.last = 0;
    if (document.hidden && this.phase === "playing") {
      this.phase = "paused";
      this.persist();
      this.onUpdate();
    }
  };
  keyDownHandler = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if ([...playerKeys.flat(), "escape"].includes(k)) e.preventDefault();
    if (k === "escape") this.togglePause();
    else {
      this.keys.add(k);
      this.start();
    }
  };
  keyUpHandler = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());
  constructor(
    canvas: HTMLCanvasElement,
    update: () => void,
    seed: string,
    saved?: Snapshot,
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.onUpdate = update;
    this.seed = seed;
    if (saved) this.restore(saved);
    else this.reset(seed);
    this.resize();
    addEventListener("resize", this.resizeHandler);
    document.addEventListener("visibilitychange", this.visibilityHandler);
    reducedMotion.addEventListener("change", this.motionHandler);
    addEventListener("keydown", this.keyDownHandler);
    addEventListener("keyup", this.keyUpHandler);
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }
  reset(seed = makeSeed()) {
    this.seed = seed;
    this.phase = "ready";
    this.habitat = 0;
    this.rescued = 0;
    this.elapsed = 0;
    this.strikes = 0;
    this.lossReason = null;
    this.lanterns = [90, 230, 370, 510];
    this.setHabitat();
    this.persist();
  }
  setHabitat() {
    const random = rng(`${this.seed}:${this.habitat}`),
      hues = ["#d8aa58", "#82b7b9", "#db7250", "#f4efd9"],
      traits = ["bold", "bouncy", "sleepy", "curious"],
      shuffled = [...traits].sort(() => random() - 0.5),
      lanes = [90, 230, 370, 510];
    this.creatures = lanes.map((lane, i) => ({
      x: clamp(lane + (random() - 0.5) * 52, 52, 548),
      y: 72 + random() * 210,
      hue: hues[i],
      trait: shuffled[i],
      progress: 0,
      wobble: random() * 6,
    }));
    this.hazards = [0, 1, 2].map((i) => ({
      x: 350 + i * 76 + (random() - 0.5) * 18,
      y: 60 + random() * 240,
      r: 22 + Math.floor(random() * 9),
      drift: (random() > 0.5 ? 1 : -1) * (22 + i * 3),
    }));
  }
  restore(s: Snapshot) {
    this.seed = s.seed;
    this.habitat = s.habitat;
    this.rescued = s.rescued;
    this.elapsed = s.elapsed;
    this.strikes = s.strikes;
    this.lanterns = s.lanterns.map((x) => clamp(x, 42, 558));
    this.setHabitat();
    this.creatures = s.creatures;
    this.phase = s.phase === "playing" ? "paused" : s.phase;
    this.lossReason = s.lossReason ?? (s.phase === "lost" ? "storm" : null);
  }
  snapshot(): Snapshot {
    return {
      phase: this.phase,
      habitat: this.habitat,
      rescued: this.rescued,
      elapsed: this.elapsed,
      strikes: this.strikes,
      lanterns: this.lanterns,
      creatures: this.creatures,
      seed: this.seed,
      lossReason: this.lossReason,
    };
  }
  persist() {
    localStorage.setItem(key("run"), JSON.stringify(this.snapshot()));
  }
  destroy() {
    cancelAnimationFrame(this.raf);
    this.roomSocket?.close();
    removeEventListener("resize", this.resizeHandler);
    document.removeEventListener("visibilitychange", this.visibilityHandler);
    reducedMotion.removeEventListener("change", this.motionHandler);
    removeEventListener("keydown", this.keyDownHandler);
    removeEventListener("keyup", this.keyUpHandler);
  }
  start() {
    if (this.phase === "ready" || this.phase === "paused") {
      this.phase = "playing";
      this.onUpdate();
    }
  }
  togglePause() {
    if (this.phase === "playing") this.phase = "paused";
    else if (this.phase === "paused") this.phase = "playing";
    this.persist();
    this.onUpdate();
  }
  move(player: number, direction: number) {
    if (player < 0 || player > 3 || ![-1, 1].includes(direction)) return;
    this.start();
    this.lanterns[player] = clamp(
      this.lanterns[player] + direction * 28,
      42,
      558,
    );
    this.persist();
  }
  replay(kind: "rescue" | "storm") {
    this.reset(this.seed);
    if (kind === "rescue") this.lanterns = [90, 230, 42, 42];
    this.start();
    const tick = () => {
      for (let i = 0; i < 300 && this.phase === "playing"; i++) this.step();
      this.draw();
      if (this.phase === "playing") requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  connectRoom(room: string, status: (m: string) => void) {
    let after = 0;
    status(`Room ${room} is ready. Scan the QR code with a phone.`);
    const poll = async () => {
      if (activeGame !== this) return;
      try {
        const response = await fetch(
          `${realtimeEndpoint}/rooms/${encodeURIComponent(room)}/moves?after=${after}`,
        );
        if (!response.ok) throw new Error();
        const result = (await response.json()) as {
          cursor: number;
          moves: { player: number; direction: number }[];
        };
        after = result.cursor;
        for (const move of result.moves) this.move(move.player, move.direction);
      } catch {
        status(
          "Phone room disconnected. Use the shared touch pads and try again.",
        );
      }
      if (activeGame === this) setTimeout(poll, 450);
    };
    poll();
  }
  step() {
    if (this.phase !== "playing") return;
    const dt = 1 / 60;
    this.elapsed += dt;
    const speed = this.assist ? 118 : 175;
    playerKeys.forEach(([left, right], p) => {
      if (this.keys.has(left))
        this.lanterns[p] = clamp(this.lanterns[p] - speed * dt, 42, 558);
      if (this.keys.has(right))
        this.lanterns[p] = clamp(this.lanterns[p] + speed * dt, 42, 558);
    });
    if (!this.reduced)
      for (const h of this.hazards) {
        h.y += h.drift * dt;
        if (h.y < 48 || h.y > 306) h.drift *= -1;
      }
    for (const c of this.creatures) {
      if (!this.reduced) c.wobble += 0.04;
      const nearest = this.lanterns.reduce(
          (best, v) => (Math.abs(v - c.x) < Math.abs(best - c.x) ? v : best),
          this.lanterns[0],
        ),
        near = Math.abs(nearest - c.x) < (this.assist ? 145 : 105),
        hazard = this.hazards.some(
          (h) => Math.hypot(h.x - c.x, h.y - c.y) < h.r + 17,
        );
      if (near && !hazard) {
        c.progress = Math.min(
          100,
          c.progress + (this.assist ? 1.45 : 0.95) * dt,
        );
        if (!this.reduced) c.x += (nearest - c.x) * 0.014;
      } else {
        c.progress = Math.max(0, c.progress - 0.24 * dt);
        if (!this.reduced) c.x += Math.sin(c.wobble) * 0.5;
      }
      if (!this.reduced)
        c.y = clamp(c.y + Math.cos(c.wobble * 0.61) * 0.35, 48, 306);
    }
    if (
      this.hazards.some((h) =>
        this.lanterns.some((x) => Math.hypot(x - h.x, 180 - h.y) < h.r + 16),
      )
    )
      this.strikes += dt * (this.assist ? 0.18 : 0.34);
    if (this.strikes >= 3) {
      this.phase = "lost";
      this.lossReason = "storm";
      this.persist();
      this.onUpdate();
      return;
    }
    const ready = this.creatures.filter((c) => c.progress >= 100).length;
    if (this.elapsed >= (this.habitat + 1) * this.habitatSeconds) {
      if (ready < 2) {
        this.phase = "lost";
        this.lossReason = "deadline";
        this.persist();
        this.onUpdate();
        return;
      }
      this.rescued += ready;
      if (this.habitat === 2) this.phase = "postcard";
      else {
        this.habitat++;
        this.setHabitat();
        this.lanterns = [90, 230, 42, 42];
      }
      this.persist();
      this.onUpdate();
    }
    if (this.elapsed - this.saveAt > 1) {
      this.saveAt = this.elapsed;
      this.persist();
      this.onUpdate();
    }
  }
  frame(now: number) {
    const delta = Math.min(0.1, (now - this.last) / 1000 || 0);
    this.last = now;
    this.accumulator += delta;
    while (this.accumulator >= 1 / 60) {
      this.step();
      this.accumulator -= 1 / 60;
    }
    this.draw();
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }
  resize() {
    const r = this.canvas.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio, 2);
    this.canvas.width = Math.max(1, Math.round(r.width * dpr));
    this.canvas.height = Math.max(1, Math.round(r.width * 0.59 * dpr));
    this.ctx.setTransform(
      (dpr * r.width) / 600,
      0,
      0,
      (dpr * r.width) / 600,
      0,
      0,
    );
  }
  draw() {
    const c = this.ctx;
    c.clearRect(0, 0, 600, 354);
    c.fillStyle = "#202723";
    c.fillRect(0, 0, 600, 354);
    c.fillStyle = "#35403a";
    for (let x = 0; x < 600; x += 100) {
      c.fillRect(x + 4, 10 + (x % 3) * 10, 88, 80);
      c.fillRect(x + 4, 235, 88, 106);
    }
    c.strokeStyle = "#6f963e";
    c.lineWidth = 7;
    c.setLineDash([18, 14]);
    c.beginPath();
    c.moveTo(20, 180);
    c.lineTo(580, 180);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = "#b9d76c";
    c.fillRect(550, 40, 26, 270);
    this.hazards.forEach((h) => {
      c.fillStyle = "#db7250";
      c.beginPath();
      c.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#202723";
      c.fillRect(h.x - 2, h.y - h.r + 5, 4, h.r * 2 - 10);
    });
    this.lanterns.forEach((x, i) => {
      c.fillStyle = playerColors[i];
      c.beginPath();
      c.arc(x, 180, 18, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#111612";
      c.lineWidth = 3;
      c.stroke();
      c.fillStyle = "#111612";
      c.font = "bold 14px Arial";
      c.fillText(String(i + 1), x - 4, 185);
    });
    this.creatures.forEach((creature) => {
      const bob = this.reduced ? 0 : Math.sin(creature.wobble) * 3;
      c.save();
      c.translate(creature.x, creature.y);
      c.fillStyle = creature.hue;
      c.beginPath();
      c.ellipse(0, bob, 18, 23, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#111612";
      c.lineWidth = 3;
      c.stroke();
      c.fillStyle = "#111612";
      c.beginPath();
      c.arc(-6, bob - 3, 3, 0, 7);
      c.arc(6, bob - 3, 3, 0, 7);
      c.fill();
      c.fillStyle = "#f4efd9";
      c.fillRect(-18, bob + 31, (36 * creature.progress) / 100, 4);
      c.restore();
    });
    c.fillStyle = "#f4efd9";
    c.font = "bold 15px Arial";
    c.fillText(
      `${weather[hash(this.seed + this.habitat) % weather.length]} · ${Math.ceil(Math.max(0, this.habitatSeconds * (this.habitat + 1) - this.elapsed))}s to shelter window · ${Math.max(0, 3 - Math.ceil(this.strikes))} lamps safe`,
      18,
      332,
    );
    if (this.phase !== "playing") {
      c.fillStyle = "rgba(17,22,18,.86)";
      c.fillRect(110, 110, 380, 126);
      c.fillStyle = "#f4efd9";
      c.textAlign = "center";
      c.font = "bold 23px Arial";
      const title =
        this.phase === "lost"
          ? this.lossReason === "deadline"
            ? "The shelter window closed"
            : "The storm scattered the group"
          : this.phase === "postcard"
            ? "All shelters are warm"
            : this.phase === "paused"
              ? "Paused"
              : "Press a player key to begin";
      c.fillText(title, 300, 156);
      c.font = "16px Arial";
      c.fillText(
        this.phase === "lost"
          ? this.lossReason === "deadline"
            ? "Shelter two creatures before time runs out"
            : "Try the same seed again"
          : this.phase === "postcard"
            ? "Open your postcard below"
            : "Keep creatures away from clay storms",
        300,
        190,
      );
      c.textAlign = "start";
    }
  }
}
function controls() {
  return `<section class="touch-controls" aria-label="Touch controls">${["one", "two", "three", "four"].map((name, i) => `<div class="player-control p${i + 1}"><strong>Player ${name}</strong><span>${playerKeys[i][0].replace("arrowleft", "←")} / ${playerKeys[i][1].replace("arrowright", "→")}</span><button class="touch" data-player="${i}" data-dir="-1" aria-label="Move player ${name} left">◀</button><button class="touch" data-player="${i}" data-dir="1" aria-label="Move player ${name} right">▶</button></div>`).join("")}</section>${demoMode() ? `<section class="demo-replay" aria-labelledby="replay-title"><h2 id="replay-title">Watch the sample route</h2><p>Run the same public rules at replay speed before sharing the controls.</p><button id="replay-rescue" class="button">Watch sample rescue</button><button id="replay-storm" class="button">Watch storm loss</button></section>` : ""}`;
}
function roomPanel() {
  return `<section class="room-panel" aria-labelledby="room-title"><div><p class="eyebrow">Phone controller</p><h2 id="room-title">Add a phone controller</h2><p>Start a room, scan its QR code, then choose a lantern on the phone.</p><button id="start-room" class="button primary">Start phone room</button><p id="room-status" aria-live="polite"></p></div><div id="qr-box" hidden><img id="room-qr" width="220" height="220" alt="QR code for joining this Couch Creatures phone controller room."><p>Room <strong id="room-code"></strong></p></div></section>`;
}
function gamePage() {
  const saved = savedRun(),
    seed = saved?.seed || (demoMode() ? "moss-postcard-17" : makeSeed());
  const coldStart = demoMode()
    ? ""
    : `<div class="cold-start"><p class="audience">For families and friends sharing one device, guide four creatures through storms before each shelter closes.</p><div class="cold-actions">${link("/demo", "Try it with sample data", "button primary")}<span>Starts a fixed sample route. Demo changes stay separate.</span></div><ul class="first-facts"><li>No account or child profile.</li><li>Loaded shared-device play works without a network.</li><li>Free, with no ads or purchases.</li></ul></div>`;
  shell(
    `<section class="game-page"><div class="game-top"><div><p class="eyebrow">Seed: ${seed}</p><h1>Guide creatures home together</h1>${coldStart}<p id="status" aria-live="polite"></p></div><button class="button quiet" id="pause">Pause</button></div><div class="canvas-wrap"><canvas id="game" role="img" aria-label="Creature rescue board. Players one to four move lanterns with A and D, J and L, F and H, or left and right arrows."></canvas></div>${controls()}${roomPanel()}<section class="game-tools" aria-labelledby="settings-title"><h2 id="settings-title">Play settings</h2><label><input id="assist" type="checkbox"> Assist mode widens lantern light and slows storm strikes</label><p>Each habitat has a three-minute shelter window. Shelter two creatures before time runs out or the route ends. Move spare lanterns away from clay storms. Escape pauses. Refreshing restores this run.</p></section><section class="result" id="lost" hidden aria-labelledby="lost-title"><h2 id="lost-title"></h2><p id="lost-copy"></p><button class="button primary" id="retry">Try this route again</button></section><section class="postcard" id="postcard" hidden aria-labelledby="postcard-title"><img src="/moss-rescue.webp" width="1200" height="800" alt="Three rescued creatures stand at their mossy shelter."><div><p class="eyebrow">Group postcard</p><h2 id="postcard-title">Rescue total</h2><p id="postcard-copy"></p><button class="button primary" id="again">Play a new route</button></div></section><section class="how-to-play" aria-labelledby="how-title"><h2 id="how-title">How this rescue works</h2><ol><li>Start with a lantern key or touch pad.</li><li>Shelter at least two creatures before the timer reaches zero.</li><li>Move lanterns clear of three clay-storm strikes.</li></ol></section></section>`,
    demoMode()
      ? "Demo — Couch Creatures"
      : "Couch Creatures — Shared creature rescue",
    "Play a nine-minute shared creature rescue with four local or phone controllers.",
  );
  const status = document.querySelector("#status")!,
    lost = document.querySelector<HTMLDivElement>("#lost")!,
    postcard = document.querySelector<HTMLDivElement>("#postcard")!,
    lostTitle = document.querySelector("#lost-title")!,
    lostCopy = document.querySelector("#lost-copy")!,
    postcardTitle = document.querySelector("#postcard-title")!,
    game = new Game(document.querySelector("#game")!, update, seed, saved);
  activeGame = game;
  function update() {
    const time = Math.ceil(
      Math.max(0, game.habitatSeconds * (game.habitat + 1) - game.elapsed),
    );
    status.textContent =
      game.phase === "postcard"
        ? "The rescue is complete."
        : game.phase === "lost"
          ? game.lossReason === "deadline"
            ? "The shelter closed before two creatures were ready."
            : "The route ended in a storm."
          : `Habitat ${game.habitat + 1} of 3: ${habitats[game.habitat]}. ${game.creatures.filter((c) => c.progress >= 100).length} creatures ready. ${time} seconds remain.`;
    (document.querySelector("#pause") as HTMLButtonElement).textContent =
      game.phase === "paused" ? "Resume" : "Pause";
    lost.hidden = game.phase !== "lost";
    postcard.hidden = game.phase !== "postcard";
    lostTitle.textContent =
      game.lossReason === "deadline"
        ? "The shelter window closed"
        : "The group needs another try";
    lostCopy.textContent =
      game.lossReason === "deadline"
        ? "Fewer than two creatures reached shelter in three minutes. Retrying keeps this route seed."
        : "Three lanterns hit clay storms. Retrying keeps this route seed.";
    postcardTitle.textContent = `${game.rescued} of 12 creatures reached shelter`;
    document.querySelector("#postcard-copy")!.textContent =
      `Your group finished all three habitats and sheltered ${game.rescued} creatures.`;
  }
  document
    .querySelector("#pause")
    ?.addEventListener("click", () => game.togglePause());
  document.querySelector("#retry")?.addEventListener("click", () => {
    game.reset(game.seed);
    update();
  });
  document.querySelector("#again")?.addEventListener("click", () => {
    game.reset(makeSeed());
    update();
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-player]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        game.move(Number(b.dataset.player), Number(b.dataset.dir)),
      ),
    );
  const assist = document.querySelector<HTMLInputElement>("#assist")!;
  assist.checked = game.assist;
  assist.addEventListener("change", () => {
    game.assist = assist.checked;
    setBool("assist", game.assist);
    game.persist();
  });
  document
    .querySelector<HTMLButtonElement>("#start-room")
    ?.addEventListener("click", async () => {
      const status = document.querySelector("#room-status")!;
      if (!realtimeEndpoint) {
        status.textContent =
          "Phone rooms are unavailable while this local build has no room service URL.";
        return;
      }
      status.textContent = "Creating room…";
      try {
        const response = await fetch(`${realtimeEndpoint}/rooms`, {
          method: "POST",
        });
        if (!response.ok)
          throw new Error(
            response.status === 429
              ? `Eight rooms are already active. Wait ${response.headers.get("Retry-After") || "60"} seconds and try again.`
              : "Room service unavailable.",
          );
        const room = (await response.json()) as { room: string };
        const joinUrl = `${location.origin}/controller?room=${encodeURIComponent(room.room)}`,
          qr = await QRCode.toDataURL(joinUrl, {
            margin: 1,
            width: 220,
            color: { dark: "#202723", light: "#f4efd9" },
          });
        document.querySelector<HTMLImageElement>("#room-qr")!.src = qr;
        document.querySelector("#room-code")!.textContent = room.room;
        document.querySelector<HTMLElement>("#qr-box")!.hidden = false;
        game.connectRoom(room.room, (m) => (status.textContent = m));
      } catch (e) {
        status.textContent =
          e instanceof Error ? e.message : "Room service unavailable.";
      }
    });
  update();
}
function controller2() {
  const room =
    new URLSearchParams(location.search).get("room")?.toUpperCase() || "";
  shell(
    `<section class="controller-page"><p class="eyebrow">Phone controller</p><h1>Use your phone as a lantern controller</h1><p>Enter the room code shown on the shared game, choose a lantern, then use the large direction buttons.</p><form id="join-room" class="join-room"><label for="room-input">Room code</label><input id="room-input" name="room" value="${room.replace(/[^A-Z0-9]/g, "")}" maxlength="6" autocomplete="off" required><button class="button primary">Join room</button></form><section id="phone-pad" hidden aria-labelledby="phone-pad-title"><h2 id="phone-pad-title">Choose your lantern</h2><div class="phone-players">${[1, 2, 3, 4].map((n) => `<button type="button" data-phone-player="${n - 1}">Lantern ${n}</button>`).join("")}</div><p id="controller-status" aria-live="polite"></p><div class="phone-move"><button type="button" id="phone-left" disabled>Move left</button><button type="button" id="phone-right" disabled>Move right</button></div></section></section>`,
    "Phone controls — Couch Creatures",
    "Use a phone as a one-thumb Couch Creatures lantern controller.",
  );
  const form = document.querySelector<HTMLFormElement>("#join-room")!,
    pad = document.querySelector<HTMLElement>("#phone-pad")!,
    status = document.querySelector("#controller-status")!;
  let code = "",
    selected = -1;
  const join = async (value: string) => {
    if (!/^[A-Z0-9]{6}$/.test(value)) {
      status.textContent = "Enter the six-character room code.";
      return;
    }
    const response = await fetch(
      `${realtimeEndpoint}/rooms/${value}/moves?after=0`,
    );
    if (!response.ok) {
      status.textContent =
        "Could not join that room. Check the code and try again.";
      return;
    }
    code = value;
    pad.hidden = false;
    status.textContent = "Connected. Choose a lantern.";
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    join(new FormData(form).get("room")?.toString().toUpperCase() || "");
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-phone-player]")
    .forEach((b) =>
      b.addEventListener("click", () => {
        selected = Number(b.dataset.phonePlayer);
        document
          .querySelectorAll("[data-phone-player]")
          .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        document
          .querySelectorAll<HTMLButtonElement>("#phone-left,#phone-right")
          .forEach((x) => (x.disabled = false));
        status.textContent = `Lantern ${selected + 1} selected.`;
      }),
    );
  const send = async (direction: number) => {
    if (selected < 0 || !code) {
      status.textContent = "Choose a lantern after the room connects.";
      return;
    }
    const response = await fetch(`${realtimeEndpoint}/rooms/${code}/moves`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ player: selected, direction }),
    });
    if (!response.ok) {
      status.textContent = "Room disconnected. Scan the QR code again.";
      return;
    }
    status.textContent = `Lantern ${selected + 1} moved ${direction < 0 ? "left" : "right"}.`;
  };
  document
    .querySelector("#phone-left")
    ?.addEventListener("click", () => send(-1));
  document
    .querySelector("#phone-right")
    ?.addEventListener("click", () => send(1));
  if (room) join(room);
}
function legalPage(kind: "privacy" | "terms") {
  const privacy = kind === "privacy";
  shell(
    `<section class="legal"><p class="eyebrow">Couch Creatures</p><h1>${privacy ? "Privacy for shared play" : "Terms for Couch Creatures"}</h1>${privacy ? "<p>Couch Creatures does not ask for names, accounts, photos, contacts, or location.</p><h2>What stays on this device</h2><p>Run recovery and assist mode stay in this browser.</p><h2>Phone rooms</h2><p>A phone room forwards room codes and left or right presses. The relay deletes rooms after 20 minutes.</p><p>A one-way connection hash limits room creation. The relay deletes expired limit records every minute.</p><h2>Demo mode</h2><p>The demo uses a separate local storage namespace. Reset demo clears it.</p>" : "<p>Couch Creatures is free to play and has no purchases.</p><h2>Safe play</h2><p>Choose what is suitable for your household. Do not play while walking or driving.</p><h2>Changes</h2><p>We may update the game or these terms.</p>"}</section>`,
    `${privacy ? "Privacy" : "Terms"} — Couch Creatures`,
    privacy
      ? "How Couch Creatures stores shared-play settings on your device."
      : "Terms for the Couch Creatures shared-screen game.",
  );
}
function notFound() {
  shell(
    `<section class="legal"><p class="eyebrow">Route missing</p><h1>This route has no creatures</h1><p>Go back to the rescue board.</p>${link("/", "Open Couch Creatures", "button primary")}</section>`,
    "Page not found — Couch Creatures",
    "The requested Couch Creatures page was not found.",
  );
}
function render(focus = false) {
  activeGame?.destroy();
  activeGame = null;
  const current = route();
  if (current === "/" || current === "/demo") gamePage();
  else if (current === "/privacy" || current === "/terms")
    legalPage(current.slice(1) as "privacy" | "terms");
  else if (current === "/controller") controller2();
  else notFound();
  if (focus) focusRoute();
}
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (target.id === "replay-rescue") activeGame?.replay("rescue");
  if (target.id === "replay-storm") activeGame?.replay("storm");
});
addEventListener("popstate", () => render(true));
render();
