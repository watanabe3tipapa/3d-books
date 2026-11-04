// 3Dブック／本棚／LP で共有する色・書体・本棚のスタイル。

export const BASE_CSS = `
:root {
  --bg: #0c1020;
  --bg-2: #11162a;
  --surface: #141a30;
  --surface-2: #1c2440;
  --ink: #f5f0e8;
  --ink-dim: rgba(245, 240, 232, 0.72);
  --muted: #8c8a9c;
  --gold: #c9a227;
  --gold-soft: #e7cd72;
  --gold-weak: rgba(201, 162, 39, 0.14);
  --gold-line: rgba(201, 162, 39, 0.3);
  --rose: #e94560;
  --rose-weak: rgba(233, 69, 96, 0.14);
  --paper: #f5f0e8;
  --paper-dark: #e8e0d4;
  --paper-line: #d8cdbb;
  --text: #1d2233;
  --text-soft: #596074;
  --code-bg: #20232b;
  --shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  --serif: "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif;
  --sans: "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif;
  --mono: "SFMono-Regular", "JetBrains Mono", "Courier New", monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a { color: var(--gold-soft); text-decoration: none; }
a:hover { color: #fff; }

button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}

::selection { background: rgba(201, 162, 39, 0.35); color: #fff; }

.gold-rule {
  width: 64px;
  height: 2px;
  border: 0;
  background: linear-gradient(90deg, var(--gold), rgba(201, 162, 39, 0.1));
}

.eyebrow {
  font-size: 0.68rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold);
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
`;

export const SHELF_CSS = `
/* ---- 本棚（棚ページと開幕アニメーションで共用） ---- */
.shelf-room {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1800px;
  perspective-origin: 50% 42%;
}

.shelf-room::before {
  content: "";
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(ellipse at 50% 18%, rgba(201, 162, 39, 0.16), transparent 55%),
    radial-gradient(ellipse at 20% 75%, rgba(233, 69, 96, 0.08), transparent 45%);
  pointer-events: none;
}

.shelf-cabinet {
  position: relative;
  width: min(1000px, 92vw);
  padding: 28px 38px 20px;
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(255,255,255,0.05), transparent 10%, transparent 90%, rgba(0,0,0,0.25)),
    linear-gradient(180deg, #4a3122 0%, #352216 45%, #28180f 100%);
  border: 1px solid rgba(231, 205, 114, 0.16);
  box-shadow:
    0 40px 90px rgba(0, 0, 0, 0.65),
    0 6px 0 #1b110b,
    inset 0 1px 0 rgba(255, 226, 170, 0.16);
  transform: rotateX(2.2deg);
}

.shelf-cabinet::before,
.shelf-cabinet::after {
  content: "";
  position: absolute;
  top: 10px;
  bottom: 10px;
  width: 14px;
  border-radius: 3px;
  background: linear-gradient(90deg, #1c120b, #4a3122 45%, #2b1a11);
  box-shadow: inset 0 0 0 1px rgba(231, 205, 114, 0.1);
}
.shelf-cabinet::before { left: 9px; }
.shelf-cabinet::after { right: 9px; }

.shelf-inner {
  position: relative;
  padding: 18px 22px 0;
  border-radius: 4px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(201, 162, 39, 0.1), transparent 60%),
    linear-gradient(180deg, #120d09 0%, #1b130d 60%, #0e0906 100%);
  box-shadow:
    inset 0 20px 40px rgba(0, 0, 0, 0.8),
    inset 0 0 0 1px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.shelf-row {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: clamp(4px, 0.8vw, 11px);
  min-height: 318px;
  padding: 0 clamp(6px, 1.4vw, 18px);
  z-index: 1;
}

.shelf-row::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 28px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.55));
  pointer-events: none;
}

.shelf-board {
  position: relative;
  height: 18px;
  margin: 0 -22px;
  background:
    linear-gradient(180deg, #6b472e 0%, #4a2e1e 22%, #2c1a10 78%, #1a0f09 100%);
  border-top: 1px solid rgba(255, 224, 166, 0.22);
  box-shadow:
    0 10px 18px rgba(0, 0, 0, 0.55),
    inset 0 -2px 0 rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.shelf-board::after {
  content: "";
  position: absolute;
  left: 6%;
  right: 6%;
  top: 4px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(231, 205, 114, 0.28), transparent);
}

.shelf-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 6px 0;
  color: rgba(245, 240, 232, 0.46);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

/* 背表紙 */
.spine {
  position: relative;
  flex: 0 0 auto;
  width: var(--w, 46px);
  height: var(--h, 296px);
  border-radius: 2px 3px 3px 2px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.22), transparent 14%, transparent 82%, rgba(0, 0, 0, 0.32)),
    linear-gradient(180deg, var(--c1, #5a3a2a), var(--c2, #2c1a12));
  border: 1px solid rgba(255, 240, 210, 0.1);
  box-shadow:
    inset 1px 0 0 rgba(255, 235, 200, 0.18),
    inset -2px 0 4px rgba(0, 0, 0, 0.35),
    0 5px 12px rgba(0, 0, 0, 0.45);
  color: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 0;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-family: var(--serif);
  font-size: clamp(0.7rem, 0.9vw, 0.84rem);
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 1.2;
  cursor: pointer;
  transform-style: preserve-3d;
  transform: translateZ(0);
  transition: transform 0.38s cubic-bezier(0.22, 0.8, 0.2, 1), box-shadow 0.38s ease, filter 0.38s ease;
  user-select: none;
  overflow: hidden;
}

.spine::before,
.spine::after {
  content: "";
  position: absolute;
  left: 8%;
  right: 8%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(231, 205, 114, 0.72), transparent);
  opacity: 0.8;
}
.spine::before { top: 12px; }
.spine::after { bottom: 12px; }

.spine .spine-title {
  max-height: calc(100% - 44px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.spine .spine-dot {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 5px;
  height: 5px;
  margin-left: -2.5px;
  border-radius: 50%;
  background: var(--gold-soft);
  box-shadow: 0 0 8px rgba(231, 205, 114, 0.75);
}

.spine:hover,
.spine:focus-visible,
.spine.current {
  transform: translateY(-16px) translateZ(34px) rotateY(-5deg);
  box-shadow:
    inset 1px 0 0 rgba(255, 235, 200, 0.25),
    0 22px 30px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(231, 205, 114, 0.55),
    0 0 26px rgba(201, 162, 39, 0.28);
  outline: none;
  filter: brightness(1.12);
}

.spine.current {
  transform: translateY(-22px) translateZ(52px) rotateY(-4deg);
}

.spine:active {
  transform: translateY(-8px) translateZ(20px) rotateY(-2deg);
}

.shelf-empty {
  margin: 40px auto;
  padding: 48px;
  max-width: 460px;
  text-align: center;
  color: var(--ink-dim);
  border: 1px dashed rgba(201, 162, 39, 0.3);
  border-radius: 6px;
  line-height: 2;
}
.shelf-empty code {
  color: var(--gold-soft);
  font-family: var(--mono);
  font-size: 0.9em;
}

/* ---- 本棚から取り出すアニメーション ---- */
.takeout-layer {
  position: fixed;
  inset: 0;
  z-index: 600;
  background:
    radial-gradient(ellipse at 50% 50%, rgba(201, 162, 39, 0.08), transparent 60%),
    rgba(5, 7, 16, 0.72);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.5s ease;
}
.takeout-layer.done { opacity: 0; pointer-events: none; }

.tb-spine {
  position: fixed;
  z-index: 2;
  border-radius: 2px 3px 3px 2px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.24), transparent 16%, transparent 82%, rgba(0, 0, 0, 0.34)),
    linear-gradient(180deg, var(--c1, #5a3a2a), var(--c2, #2c1a12));
  border: 1px solid rgba(255, 240, 210, 0.14);
  box-shadow:
    inset 1px 0 0 rgba(255, 235, 200, 0.22),
    0 24px 50px rgba(0, 0, 0, 0.65),
    0 0 40px rgba(201, 162, 39, 0.2);
  color: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  font-family: var(--serif);
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  overflow: hidden;
}
.tb-spine::before,
.tb-spine::after {
  content: "";
  position: absolute;
  left: 8%;
  right: 8%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(231, 205, 114, 0.75), transparent);
}
.tb-spine::before { top: 12px; }
.tb-spine::after { bottom: 12px; }

.tb-book {
  position: fixed;
  z-index: 3;
  transform-style: preserve-3d;
  transform-origin: left center;
}

.tb-pages {
  position: absolute;
  inset: 0;
  border-radius: 2px 5px 5px 2px;
  background:
    repeating-linear-gradient(90deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 4px),
    linear-gradient(180deg, #fbf7ef, #e9e1d3);
  box-shadow:
    0 30px 70px rgba(0, 0, 0, 0.6),
    inset -8px 0 14px rgba(0, 0, 0, 0.12);
}

.tb-cover {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform-origin: left center;
  border-radius: 2px 5px 5px 2px;
}

.tb-cover-front,
.tb-cover-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 2px 5px 5px 2px;
  overflow: hidden;
}

.tb-cover-front {
  background:
    radial-gradient(circle at 78% 16%, rgba(201, 162, 39, 0.22), transparent 45%),
    linear-gradient(145deg, #18203c 0%, #0d1226 55%, #090d1a 100%);
  border: 1px solid rgba(231, 205, 114, 0.32);
  box-shadow: inset 0 0 0 6px rgba(231, 205, 114, 0.08);
  color: var(--ink);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 13% 12%;
  text-align: center;
}
.tb-cover-front::before {
  content: "";
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(231, 205, 114, 0.28);
  pointer-events: none;
}
.tb-cover-front .tb-kicker {
  font-size: 0.58em;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--gold);
}
.tb-cover-front .tb-title {
  font-family: var(--serif);
  font-size: 2em;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.03em;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.5);
}
.tb-cover-front .tb-sub {
  font-size: 0.72em;
  color: var(--ink-dim);
  line-height: 1.7;
}
.tb-cover-front .tb-author {
  font-size: 0.62em;
  letter-spacing: 0.18em;
  color: rgba(245, 240, 232, 0.55);
}

.tb-cover-back {
  transform: rotateY(180deg);
  background:
    repeating-linear-gradient(0deg, transparent 0 27px, rgba(0, 0, 0, 0.025) 27px 28px),
    linear-gradient(180deg, #f4eee2, #e8dfd0);
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.08);
}
.tb-cover-back::before {
  content: "3D BOOKS";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--serif);
  font-size: 1.4em;
  letter-spacing: 0.3em;
  color: rgba(29, 34, 51, 0.18);
}

.takeout-caption {
  position: fixed;
  left: 50%;
  bottom: 7vh;
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: var(--ink-dim);
  font-size: 0.72rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  opacity: 0;
  animation: caption-in 0.8s ease 0.5s forwards;
}
@keyframes caption-in { to { opacity: 1; } }

.skip-btn {
  padding: 9px 20px;
  border: 1px solid rgba(231, 205, 114, 0.35);
  border-radius: 999px;
  color: var(--gold-soft);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  background: rgba(12, 16, 32, 0.55);
  transition: background 0.25s ease, border-color 0.25s ease;
}
.skip-btn:hover { background: rgba(201, 162, 39, 0.16); border-color: var(--gold); }

@media (max-width: 720px) {
  .shelf-cabinet { padding: 18px 22px 14px; }
  .shelf-inner { padding: 10px 12px 0; }
  .shelf-row { min-height: 240px; }
  .spine { height: var(--hm, 220px); }
}
`;
