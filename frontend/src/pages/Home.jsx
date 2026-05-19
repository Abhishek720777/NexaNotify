import { useEffect, useRef, useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:       #F7F8F8;
  --surface:  #FFFFFF;
  --ink:      #0D1117;
  --ink-2:    #57606A;
  --ink-3:    #8B949E;
  --border:   #E1E4E8;
  --accent:   #1DB88B;
  --accent-2: #179E77;
  --accent-bg:#E6F9F4;
  --dark:     #0D1117;
  --dark-2:   #161B22;
}
html { scroll-behavior: auto; }
section { scroll-margin-top: 80px; }
body {
  background: var(--bg); color: var(--ink); overflow-x: hidden;
  font-family: 'Barlow', sans-serif; -webkit-font-smoothing: antialiased;
}

/* ── Progress bar ── */
.nn-bar {
  position: fixed; top: 0; left: 0; height: 2px; z-index: 1000;
  background: var(--accent); width: 0%; transition: width .06s linear;
}

/* ── Nav ── */
.nn-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: 58px; display: flex; align-items: center;
  padding: 0 52px; justify-content: space-between;
  transition: background .4s, border-bottom .4s;
}
.nn-nav.solid {
  background: rgba(247,248,248,.96);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border);
}
.nn-logo {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  font-size: 20px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink);
}
.nn-logo b { color: var(--accent); font-weight: 700; }
.nn-nav-links { display: flex; gap: 32px; list-style: none; }
.nn-nav-links a {
  font-size: 13px; font-weight: 400; color: var(--ink-2);
  text-decoration: none; letter-spacing: .2px; transition: color .2s;
}
.nn-nav-links a:hover { color: var(--ink); }
.nn-nav-end { display: flex; gap: 10px; }
.btn-ghost {
  padding: 7px 18px; border: 1px solid var(--border); border-radius: 3px;
  background: transparent; font-size: 13px; font-weight: 400;
  color: var(--ink); font-family: inherit; transition: border-color .2s; cursor: pointer;
}
.btn-ghost:hover { border-color: var(--ink-2); }
.btn-fill {
  padding: 7px 18px; border: 1px solid var(--accent); border-radius: 3px;
  background: var(--accent); font-size: 13px; font-weight: 500;
  color: #fff; font-family: inherit; transition: background .2s; cursor: pointer;
}
.btn-fill:hover { background: var(--accent-2); border-color: var(--accent-2); }

/* ── Hero ── */
.nn-hero {
  min-height: 100vh; padding: 58px 52px 80px;
  display: grid; grid-template-columns: 1fr 400px;
  align-items: center; gap: 60px; position: relative; overflow: hidden;
}
.nn-hero-deco {
  position: absolute; right: -60px; top: 50%; transform: translateY(-50%);
  font-family: 'Barlow Condensed', sans-serif; font-weight: 800;
  font-size: clamp(300px, 28vw, 440px); letter-spacing: -10px;
  color: var(--ink); opacity: .025; pointer-events: none;
  user-select: none; line-height: 1;
}
.nn-hero-l { position: relative; z-index: 2; }
.nn-overline {
  display: flex; align-items: center; gap: 12px; margin-bottom: 32px;
  font-size: 11px; font-weight: 500; letter-spacing: 2.5px;
  text-transform: uppercase; color: var(--ink-3);
}
.nn-overline-bar { width: 28px; height: 1px; background: var(--accent); display: block; flex-shrink: 0; }
.nn-h1-l {
  display: block; font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(74px, 10vw, 136px); font-weight: 800;
  line-height: .92; letter-spacing: -2px; text-transform: uppercase;
  will-change: transform;
}
.nn-h1-em { color: var(--accent); }
.nn-hero-sub {
  font-size: 15.5px; font-weight: 300; line-height: 1.85;
  color: var(--ink-2); max-width: 420px; margin: 30px 0 38px;
}
.nn-hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-hero-a {
  padding: 13px 26px; border-radius: 3px; background: var(--accent); border: none;
  color: #fff; font-size: 14px; font-weight: 500; font-family: inherit;
  transition: all .22s; display: flex; align-items: center; gap: 10px; cursor: pointer;
}
.btn-hero-a:hover {
  background: var(--accent-2); transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(29,184,139,.25);
}
.btn-hero-b {
  padding: 13px 26px; border-radius: 3px; background: transparent;
  border: 1px solid var(--border); color: var(--ink);
  font-size: 14px; font-weight: 400; font-family: inherit;
  transition: border-color .2s; cursor: pointer;
}
.btn-hero-b:hover { border-color: var(--ink-2); }

/* Hero right: live metrics widget */
.nn-hero-r { position: relative; z-index: 2; }
.nn-widget {
  background: #fff; border: 1px solid var(--border);
  border-radius: 10px; overflow: hidden;
  box-shadow: 0 4px 32px rgba(0,0,0,.06), 0 1px 4px rgba(0,0,0,.04);
}
.nn-widget-hd {
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.nn-widget-title {
  font-size: 12px; font-weight: 600; color: var(--ink); letter-spacing: .2px;
}
.nn-widget-live {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 500; color: var(--accent); letter-spacing: .5px;
  font-family: 'JetBrains Mono', monospace;
}
.nn-widget-live-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--accent);
  animation: livepulse 2s ease-in-out infinite;
}
@keyframes livepulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .4; transform: scale(.8); }
}
.nn-widget-metrics { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.nn-widget-metric {}
.nn-widget-metric-row {
  display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;
}
.nn-widget-metric-lbl { font-size: 11px; color: var(--ink-3); font-weight: 400; }
.nn-widget-metric-val { font-size: 18px; font-weight: 700; color: var(--ink); font-family: 'Barlow Condensed', sans-serif; letter-spacing: -.5px; }
.nn-widget-metric-val span { font-size: 11px; font-weight: 400; color: var(--accent); margin-left: 4px; }
.nn-widget-bar-bg { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.nn-widget-bar-fill { height: 100%; border-radius: 2px; background: var(--accent); }
.nn-widget-chart { padding: 0 20px 20px; }
.nn-widget-chart-lbl { font-size: 10px; color: var(--ink-3); margin-bottom: 10px; letter-spacing: .3px; }
.nn-widget-bars { display: flex; align-items: flex-end; gap: 5px; height: 56px; }
.nn-widget-bar-col { flex: 1; border-radius: 2px 2px 0 0; background: var(--accent); opacity: .15; transition: opacity .2s; }
.nn-widget-bar-col.hi { opacity: 1; }
.nn-widget-bar-col:hover { opacity: .7; }
.nn-widget-footer {
  padding: 12px 20px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}
.nn-widget-footer-stat { font-size: 11px; color: var(--ink-3); }
.nn-widget-footer-stat b { color: var(--ink); font-weight: 600; }

/* ── Marquee ── */
.nn-mq { background: var(--dark); overflow: hidden; }
.nn-mq-row { padding: 13px 0; overflow: hidden; }
.nn-mq-row + .nn-mq-row { border-top: 1px solid rgba(255,255,255,.04); padding-top: 12px; }
.nn-mq-track {
  display: flex; width: max-content;
  animation: mq 22s linear infinite;
}
.nn-mq-track.rev { animation-direction: reverse; animation-duration: 28s; }
@keyframes mq { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.nn-mq-item {
  padding: 0 36px; font-size: 11px; letter-spacing: 2px;
  text-transform: uppercase; font-weight: 500;
  color: rgba(255,255,255,.22); white-space: nowrap;
  display: flex; align-items: center; gap: 36px;
}
.nn-mq-item .hi { color: rgba(255,255,255,.65); }
.nn-mq-sep { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,.12); flex-shrink: 0; }

/* ── Channels table ── */
.nn-channels { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.nn-ch-hd {
  padding: 80px 52px 56px; display: flex;
  justify-content: space-between; align-items: flex-end; gap: 40px;
}
.nn-sec-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(36px, 4.5vw, 58px); font-weight: 700;
  letter-spacing: -1px; line-height: 1.05; text-transform: uppercase;
}
.nn-sec-title em { color: var(--accent); font-style: normal; }
.nn-ch-hd-r {
  font-size: 14px; font-weight: 300; color: var(--ink-2);
  max-width: 320px; line-height: 1.8; flex-shrink: 0;
}
.nn-ch-row { border-top: 1px solid var(--border); transition: background .45s; }
.nn-ch-row-top {
  display: grid; grid-template-columns: 60px 200px 1fr auto;
  align-items: center; padding: 26px 52px; gap: 24px;
}
.nn-ch-num {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--ink-3); font-weight: 400; letter-spacing: .5px;
}
.nn-ch-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(22px, 2.5vw, 32px); font-weight: 700;
  text-transform: uppercase; letter-spacing: -.5px; transition: color .4s;
}
.nn-ch-brief {
  font-size: 13px; font-weight: 300; color: var(--ink-3); line-height: 1.6;
}
.nn-ch-tag {
  font-size: 10.5px; font-weight: 600; letter-spacing: 1px;
  text-transform: uppercase; padding: 4px 10px; border-radius: 2px;
}
.nn-ch-tag.live { background: var(--accent-bg); color: var(--accent-2); }
.nn-ch-tag.beta { background: #FEF3C7; color: #92400E; }

/* Static layout, highlighted on active to prevent layout shifts during scroll */
.nn-ch-body {
  display: block;
  opacity: 0.8;
  transition: opacity .3s;
}
.nn-ch-row.active .nn-ch-body { opacity: 1; }
.nn-ch-body-inner { overflow: hidden; }
.nn-ch-body-content {
  display: grid; grid-template-columns: 260px 1fr 1fr;
  gap: 24px; padding: 12px 52px 36px;
}
.nn-ch-body-desc {
  font-size: 14.5px; font-weight: 300; line-height: 1.9; color: var(--ink-2);
}
.nn-ch-caps { list-style: none; display: flex; flex-direction: column; gap: 9px; }
.nn-ch-cap {
  font-size: 13px; color: var(--ink-2); font-weight: 400;
  display: flex; align-items: center; gap: 10px;
}
.nn-ch-cap::before { content: ''; width: 14px; height: 1px; background: var(--accent); flex-shrink: 0; }

.nn-ch-row {
  border-top: 1px solid var(--border);
  transition: background .3s, border-top-color .3s;
}
.nn-ch-row.active { background: var(--accent-bg); border-top-color: var(--accent); }
.nn-ch-row.active .nn-ch-name { color: var(--accent-2); }

/* ── Timeline ── */
.nn-timeline {
  padding: 120px 52px; background: var(--surface);
  border-top: 1px solid var(--border);
}
.nn-tl-hd { margin-bottom: 96px; }
.nn-tl-inner { max-width: 780px; margin: 0 auto; position: relative; }
.nn-tl-svg-wrap {
  position: absolute; left: 50%; top: 110px; bottom: 110px;
  transform: translateX(-50%); pointer-events: none; width: 2px;
}
.nn-tl-steps { display: flex; flex-direction: column; }
.nn-tl-step {
  display: grid; grid-template-columns: 1fr 60px 1fr;
  min-height: 220px; align-items: center;
}
.nn-tl-content { padding: 24px 20px; }
.nn-tl-center { display: flex; align-items: center; justify-content: center; }
.nn-tl-dot {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid var(--border); background: var(--surface);
  transition: border-color .4s, background .4s, box-shadow .4s;
  position: relative; z-index: 2;
}
.nn-tl-dot.lit {
  border-color: var(--accent); background: var(--accent);
  box-shadow: 0 0 0 6px var(--accent-bg);
}
.nn-tl-step-num {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  font-weight: 400; letter-spacing: 1px; color: var(--ink-3); margin-bottom: 10px;
}
.nn-tl-step-title {
  font-family: 'Barlow Condensed', sans-serif; font-size: 26px;
  font-weight: 700; letter-spacing: -.3px; text-transform: uppercase; margin-bottom: 12px;
}
.nn-tl-step-desc {
  font-size: 14px; font-weight: 300; color: var(--ink-2); line-height: 1.85;
}

/* ── Code section ── */
.nn-code-section { background: var(--dark); padding: 100px 52px; }
.nn-code-hd { margin-bottom: 48px; }
.nn-code-overline {
  display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
  font-size: 11px; font-weight: 500; letter-spacing: 2.5px;
  text-transform: uppercase; color: rgba(255,255,255,.3);
}
.nn-code-overline-bar { width: 28px; height: 1px; background: var(--accent); display: block; }
.nn-code-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(36px, 4vw, 52px); font-weight: 700;
  letter-spacing: -1px; text-transform: uppercase; color: #fff;
}
.nn-code-title em { color: var(--accent); font-style: normal; }
.nn-code-wrap {
  background: var(--dark-2); border: 1px solid rgba(255,255,255,.08);
  border-radius: 6px; overflow: hidden;
}
.nn-code-bar {
  display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,.06);
}
.nn-code-tab {
  padding: 12px 20px; font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 400; color: rgba(255,255,255,.3);
  cursor: pointer; border-bottom: 2px solid transparent;
  transition: color .2s, border-color .2s; background: none; border-top: none;
  border-left: none; border-right: none; font-family: inherit;
}
.nn-code-tab:hover { color: rgba(255,255,255,.6); }
.nn-code-tab.on { color: var(--accent); border-bottom-color: var(--accent); }
.nn-code-body { padding: 32px 36px; min-height: 300px; }
.nn-code-pre {
  font-family: 'JetBrains Mono', monospace; font-size: 13.5px;
  line-height: 2.1; color: rgba(255,255,255,.7); white-space: pre;
}
.tok-k { color: #C792EA; }
.tok-s { color: #C3E88D; }
.tok-c { color: #4A5568; font-style: italic; }
.tok-f { color: #82AAFF; }
.tok-p { color: rgba(255,255,255,.35); }
.tok-a { color: var(--accent); }

/* ── Bento ── */
.nn-bento-section { padding: 100px 52px; border-top: 1px solid var(--border); }
.nn-bento-hd { margin-bottom: 56px; }
.nn-bento-grid {
  display: grid; grid-template-columns: repeat(12,1fr);
  border: 1px solid var(--border);
}
.nn-bento-card {
  border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 40px 36px; position: relative; overflow: hidden;
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.8s cubic-bezier(.16,1,0.3,1), transform 0.8s cubic-bezier(.16,1,0.3,1), background .3s;
}
.nn-bento-card:hover { background: var(--accent-bg); }
.nn-bento-card.vis { opacity: 1; transform: translateY(0); }
.nn-bc-a { grid-column: span 5; }
.nn-bc-b { grid-column: span 7; border-right: none; }
.nn-bc-c { grid-column: span 4; border-bottom: none; }
.nn-bc-d { grid-column: span 4; border-bottom: none; }
.nn-bc-e { grid-column: span 4; border-right: none; border-bottom: none; }
.nn-bento-idx {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  font-weight: 400; letter-spacing: 1px; color: var(--ink-3); margin-bottom: 36px;
}
.nn-bento-title {
  font-family: 'Barlow Condensed', sans-serif; font-size: 25px; font-weight: 700;
  letter-spacing: -.3px; text-transform: uppercase; margin-bottom: 12px; line-height: 1.1;
}
.nn-bento-title em { color: var(--accent); font-style: normal; }
.nn-bento-desc { font-size: 13.5px; font-weight: 300; color: var(--ink-2); line-height: 1.8; }
.nn-bento-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 28px; }
.nn-bento-tag {
  padding: 4px 10px; border: 1px solid var(--border); border-radius: 2px;
  font-size: 11px; font-weight: 400; color: var(--ink-2); letter-spacing: .2px;
}

/* ── Stats ── */
.nn-stats { background: var(--dark); padding: 100px 52px; }
.nn-stats-grid {
  display: grid; grid-template-columns: repeat(3,1fr);
  border-top: 1px solid rgba(255,255,255,.08);
  border-left: 1px solid rgba(255,255,255,.08);
}
.nn-stat {
  padding: 60px 52px;
  border-right: 1px solid rgba(255,255,255,.08);
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.nn-stat-val {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(60px, 7vw, 96px); font-weight: 800;
  letter-spacing: -2px; color: #fff; line-height: .9;
  display: block; margin-bottom: 18px; text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}
.nn-stat-val em { color: var(--accent); font-style: normal; }
.nn-stat-lbl { font-size: 14px; font-weight: 300; color: rgba(255,255,255,.4); line-height: 1.7; }

/* ── CTA ── */
.nn-cta { 
  background: var(--bg); 
  color: var(--ink); 
  padding: 140px 52px; 
  border-top: 1px solid var(--border); 
}
.nn-cta-inner {
  display: grid; grid-template-columns: 1fr 300px;
  gap: 80px; align-items: end;
}
.nn-cta h2 {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(60px, 8vw, 108px); font-weight: 800;
  letter-spacing: -2px; line-height: .92; text-transform: uppercase;
  color: var(--ink);
}
.nn-cta h2 em { color: var(--accent); font-style: normal; }
.nn-cta-sub {
  font-size: 15px; font-weight: 300; color: var(--ink-2);
  line-height: 1.85; margin-bottom: 32px;
}
.nn-cta-btns { display: flex; flex-direction: column; gap: 10px; }
.btn-cta-a {
  padding: 14px 22px; border-radius: 3px; background: var(--accent); border: none;
  color: #fff; font-size: 14px; font-weight: 500; font-family: inherit;
  transition: all .22s; display: flex; justify-content: space-between;
  align-items: center; cursor: pointer;
}
.btn-cta-a:hover { background: var(--accent-2); transform: translateX(4px); }
.btn-cta-b {
  padding: 14px 22px; border-radius: 3px; border: 1px solid var(--border);
  background: transparent; color: var(--ink); font-size: 14px; font-weight: 400;
  font-family: inherit; transition: border-color .2s; display: flex;
  justify-content: space-between; align-items: center; cursor: pointer;
}
.btn-cta-b:hover { border-color: var(--ink-2); }

/* ── Footer ── */
.nn-footer { background: var(--dark); padding: 40px 52px; }
.nn-footer-top {
  display: grid; grid-template-columns: 2fr 1fr; gap: 40px;
  margin-bottom: 30px; padding-bottom: 30px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.nn-fl-logo {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  font-size: 18px; letter-spacing: 1.5px; text-transform: uppercase;
  color: #fff; margin-bottom: 12px;
}
.nn-fl-logo b { color: var(--accent); }
.nn-fl-about { font-size: 13px; color: rgba(255,255,255,.3); line-height: 1.85; font-weight: 300; max-width: 260px; }
.nn-fl-hd { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,.25); margin-bottom: 20px; }
.nn-fl-links { list-style: none; display: flex; flex-direction: column; gap: 11px; }
.nn-fl-links a { text-decoration: none; font-size: 13px; color: rgba(255,255,255,.4); font-weight: 300; transition: color .18s; }
.nn-fl-links a:hover { color: #fff; }
.nn-footer-bot { display: flex; justify-content: space-between; align-items: center; }
.nn-footer-copy { font-size: 12px; color: rgba(255,255,255,.2); font-weight: 300; }
.nn-footer-certs { display: flex; gap: 10px; }
.nn-footer-cert { padding: 4px 10px; border: 1px solid rgba(255,255,255,.08); border-radius: 2px; font-size: 11px; color: rgba(255,255,255,.3); letter-spacing: .5px; }

/* ── Responsive ── */
@media (max-width: 960px) {
  .nn-nav { padding: 0 24px; }
  .nn-nav-links { display: none; }
  .nn-hero { grid-template-columns: 1fr; padding: 80px 24px 60px; }
  .nn-hero-r { display: none; }
  .nn-hero-deco { display: none; }
  .nn-ch-hd { padding: 60px 24px 40px; flex-direction: column; align-items: flex-start; }
  .nn-ch-row-top { padding: 20px 24px; grid-template-columns: 50px 1fr auto; }
  .nn-ch-brief { display: none; }
  .nn-ch-body-content { padding: 0 24px 28px; grid-template-columns: 1fr; }
  .nn-timeline { padding: 80px 24px; }
  .nn-code-section { padding: 80px 24px; }
  .nn-bento-section { padding: 80px 24px; }
  .nn-bento-grid { grid-template-columns: 1fr; }
  .nn-bc-a,.nn-bc-b,.nn-bc-c,.nn-bc-d,.nn-bc-e { grid-column: 1; border-right: none; }
  .nn-stats { padding: 80px 24px; }
  .nn-stats-grid { grid-template-columns: 1fr; }
  .nn-stat { border-right: none; padding: 40px 0; }
  .nn-cta { padding: 80px 24px; background: var(--bg); color: var(--ink); }
  .nn-cta-inner { grid-template-columns: 1fr; gap: 40px; }
  .nn-footer { padding: 30px 24px; }
  .nn-footer-top { grid-template-columns: 1fr; gap: 20px; }
}
`;

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const CHANNELS = [
  {
    num: "01", name: "Email", tag: "Live",
    brief: "Transactional & marketing emails",
    desc: "Route transactional and marketing emails through configurable SMTP providers. FreeMarker-powered templates let you inject dynamic user data, branding, and content at send time.",
    caps: ["SMTP provider abstraction", "FreeMarker templating engine", "Per-client logo & branding injection", "Full delivery audit trail"],
  },
  {
    num: "02", name: "SMS", tag: "Live",
    brief: "Text messages via Twilio",
    desc: "Send SMS notifications through Twilio. The engine queues, dispatches, and tracks each message with retry support and per-request delivery logs.",
    caps: ["Twilio gateway integration", "Per-message delivery receipts", "Retry with exponential backoff", "Full audit trail per message"],
  },
  {
    num: "03", name: "Push", tag: "Live",
    brief: "Mobile push via FCM",
    desc: "Deliver push notifications to Android and web targets via Firebase Cloud Messaging. Templates are compiled server-side and dispatched through the same unified queue.",
    caps: ["FCM gateway integration", "Dynamic payload compilation", "Queue-based delivery workers", "Retry and dead-letter handling"],
  },
  {
    num: "04", name: "Workplace", tag: "Beta",
    brief: "Slack, Teams & Discord — coming soon",
    desc: "Workplace channel integrations (Slack, Microsoft Teams, Discord) are on the roadmap. The routing and template engine is already built — provider adapters ship next.",
    caps: ["Routing engine ready", "Template system compatible", "Provider adapters in progress", "Early access on request"],
  },
];

const STEPS = [
  {
    num: "01", title: "Integrate", side: "left",
    desc: "Trigger notifications from any application or framework using our simple, secure HTTP REST API. Authenticate with your client's X-API-KEY and trigger your workflows in under five minutes."
  },
  {
    num: "02", title: "Route & Template", side: "right",
    desc: "Define templates with FreeMarker interpolation in the dashboard. The engine automatically maps incoming event requests to active template versions for Email, SMS, or Push channels."
  },
  {
    num: "03", title: "Deliver & Audit", side: "left",
    desc: "SignalFlow manages retry schedules with dynamic exponential backoff and tracks delivery status. Real-time audit logs give you a 100% visible trace from API submit to recipient delivery."
  },
];

const BENTO = [
  {
    cls: "nn-bc-a", idx: "01", title: <>Event <em>Routing</em></>,
    desc: "Seamless mapping of application transaction events to designated communication channels (Email, SMS, FCM Push) automatically resolved at dispatch time.",
    tags: ["Event matching", "Automated mapping", "User preference filters"]
  },
  {
    cls: "nn-bc-b", idx: "02", title: <>Provider <em>Abstraction</em></>,
    desc: "Switch email, SMS, or push configuration parameters easily. Credentials, SMTP host details, and provider endpoints are isolated completely in SignalFlow backend settings. Your application API integrations stay identical.",
    tags: ["Isolated configuration", "Channel abstraction", "Multi-provider support"]
  },
  {
    cls: "nn-bc-c", idx: "03", title: <>Delivery <em>Guarantees</em></>,
    desc: "Robust delivery flow featuring Redis-backed priority job queuing, automatic progressive backoff retries on failure, and absolute status tracking in our system logs.",
    tags: ["Redis queue priority", "Exponential retry backoff", "Live audit status"]
  },
  {
    cls: "nn-bc-d", idx: "04", title: <>Unified <em>Analytics</em></>,
    desc: "Observe delivery success metrics, average processing latency, and detailed status logs (Sent, Pending, Retrying, Suppressed, Dead) per client and template.",
    tags: ["Success rates", "Average processing latency", "Real-time audit log"]
  },
  {
    cls: "nn-bc-e", idx: "05", title: <>Open & <em>Extensible</em></>,
    desc: "Built on a robust Java Spring Boot and MySQL foundation. Fully self-hostable, open-source, and developer-friendly.",
    tags: ["Spring Boot", "Redis Queue", "Self-Hosted"]
  },
];

const STATS_DATA = [
  { prefix: "", raw: 3, suffix: " Channels", display: "3 Channels", label: "Email, SMS, and FCM Push\nfully production-ready" },
  { prefix: "<", raw: 50, suffix: "ms", display: "<50ms", label: "Median internal queue\nprocessing latency" },
  { prefix: "", raw: 100, suffix: "%", display: "100%", label: "Data ownership and\ncomplete self-hosted privacy" },
];

const TICKER_A = ["Email", "SMS", "Push", "SMTP", "FCM", "Twilio", "Postmark", "SendGrid", "Redis", "Docker", "Java"];
const TICKER_B = ["Route", "Retry", "Track", "Deliver", "Log", "Template", "Audit", "Throttle", "Verify"];

/* ─── Code token snippets dictionary ─── */
const CODE_SNIPPETS = {
  0: [ // cURL
    [{t:"c",v:"# Hit the unified notification gateway directly"}],
    [{t:"k",v:"curl "},{t:"p",v:"-X "},{t:"k",v:"POST "},{t:"s",v:"'http://localhost:8080/api/v1/notify' \\"}],
    [{t:"p",v:"  -H "},{t:"s",v:"'Content-Type: application/json' \\"}],
    [{t:"p",v:"  -H "},{t:"s",v:"'X-API-KEY: your-client-api-key' \\"}],
    [{t:"p",v:"  -d "},{t:"s",v:"'{"}],
    [{t:"a",v:"    \"userId\""},{t:"p",v:": "},{t:"s",v:"\"user_101\""},{t:"p",v:","}],
    [{t:"a",v:"    \"event\""},{t:"p",v:": "},{t:"s",v:"\"order_confirmed\""},{t:"p",v:","}],
    [{t:"a",v:"    \"data\""},{t:"p",v:": {"}],
    [{t:"a",v:"      \"name\""},{t:"p",v:": "},{t:"s",v:"\"Alex\""},{t:"p",v:","}],
    [{t:"a",v:"      \"orderId\""},{t:"p",v:": "},{t:"s",v:"\"ORD-8742\""}],
    [{t:"p",v:"    }"}],
    [{t:"s",v:"  }'"}]
  ],
  1: [ // JavaScript
    [{t:"c",v:"// Call NotifyEngine with native fetch"}],
    [{t:"k",v:"await "},{t:"f",v:"fetch"},{t:"p",v:"("},{t:"s",v:"'http://localhost:8080/api/v1/notify'"},{t:"p",v:", {"}],
    [{t:"a",v:"  method"},{t:"p",v:": "},{t:"s",v:"'POST'"},{t:"p",v:","}],
    [{t:"a",v:"  headers"},{t:"p",v:": {"}],
    [{t:"s",v:"    'Content-Type'"},{t:"p",v:": "},{t:"s",v:"'application/json'"},{t:"p",v:","}],
    [{t:"s",v:"    'X-API-KEY'"},{t:"p",v:": "},{t:"s",v:"'your-client-api-key'"}],
    [{t:"p",v:"  },"}],
    [{t:"a",v:"  body"},{t:"p",v:": "},{t:"f",v:"JSON.stringify"},{t:"p",v:"({"}],
    [{t:"a",v:"    userId"},{t:"p",v:": "},{t:"s",v:"'user_101'"},{t:"p",v:","}],
    [{t:"a",v:"    event"},{t:"p",v:": "},{t:"s",v:"'order_confirmed'"},{t:"p",v:","}],
    [{t:"a",v:"    data"},{t:"p",v:": { "},{t:"a",v:"name"},{t:"p",v:": "},{t:"s",v:"'Alex'"},{t:"p",v:", "},{t:"a",v:"orderId"},{t:"p",v:": "},{t:"s",v:"'ORD-8742'"},{t:"p",v:" }"}],
    [{t:"p",v:"  })"}],
    [{t:"p",v:"});"}]
  ],
  2: [ // Python
    [{t:"c",v:"# Execute async notification triggers using requests"}],
    [{t:"k",v:"import "},{t:"p",v:"requests"}],
    [],
    [{t:"p",v:"response = requests."},{t:"f",v:"post"},{t:"p",v:"("}],
    [{t:"s",v:"    \"http://localhost:8080/api/v1/notify\""},{t:"p",v:","}],
    [{t:"a",v:"    headers"},{t:"p",v:"={"}],
    [{t:"s",v:"        \"Content-Type\""},{t:"p",v:": "},{t:"s",v:"\"application/json\""},{t:"p",v:","}],
    [{t:"s",v:"        \"X-API-KEY\""},{t:"p",v:": "},{t:"s",v:"\"your-client-api-key\""}],
    [{t:"p",v:"    },"}],
    [{t:"a",v:"    json"},{t:"p",v:"={"}],
    [{t:"s",v:"        \"userId\""},{t:"p",v:": "},{t:"s",v:"\"user_101\""},{t:"p",v:","}],
    [{t:"s",v:"        \"event\""},{t:"p",v:": "},{t:"s",v:"\"order_confirmed\""},{t:"p",v:","}],
    [{t:"s",v:"        \"data\""},{t:"p",v:": {"}],
    [{t:"s",v:"            \"name\""},{t:"p",v:": "},{t:"s",v:"\"Alex\""},{t:"p",v:","}],
    [{t:"s",v:"            \"orderId\""},{t:"p",v:": "},{t:"s",v:"\"ORD-8742\""}],
    [{t:"p",v:"        }"}],
    [{t:"p",v:"    }"}],
    [{t:"p",v:")"}]
  ],
  3: [ // Go
    [{t:"c",v:"// Go HTTP integration snippet"}],
    [{t:"k",v:"package "},{t:"p",v:"main"}],
    [],
    [{t:"k",v:"import "},{t:"p",v:"("}],
    [{t:"s",v:"\t\"bytes\""}],
    [{t:"s",v:"\t\"net/http\""}],
    [{t:"p",v:")"}],
    [],
    [{t:"k",v:"func "},{t:"f",v:"main"},{t:"p",v:"() {"}],
    [{t:"p",v:"\tpayload := []byte(`{"},{t:"s",v:"\"userId\": \"user_101\", \"event\": \"order_confirmed\", \"data\": {\"name\": \"Alex\"}"},{t:"p",v:"}`)"}],
    [{t:"p",v:"\treq, _ := http."},{t:"f",v:"NewRequest"},{t:"p",v:"("},{t:"s",v:"\"POST\""},{t:"p",v:", "},{t:"s",v:"\"http://localhost:8080/api/v1/notify\""},{t:"p",v:", bytes."},{t:"f",v:"NewBuffer"},{t:"p",v:"(payload))"}],
    [{t:"p",v:"\treq.Header."},{t:"f",v:"Set"},{t:"p",v:"("},{t:"s",v:"\"Content-Type\""},{t:"p",v:", "},{t:"s",v:"\"application/json\""},{t:"p",v:")"}],
    [{t:"p",v:"\treq.Header."},{t:"f",v:"Set"},{t:"p",v:"("},{t:"s",v:"\"X-API-KEY\""},{t:"p",v:", "},{t:"s",v:"\"your-client-api-key\""},{t:"p",v:")"}],
    [{t:"p",v:"\tclient := &http.Client{}"}],
    [{t:"p",v:"\tclient."},{t:"f",v:"Do"},{t:"p",v:"(req)"}],
    [{t:"p",v:"}"}]
  ]
};

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const barRef = useRef(null);
  const navRef = useRef(null);
  const hero1Ref = useRef(null);
  const hero2Ref = useRef(null);
  const chItemRefs = useRef([]);
  const tlSecRef = useRef(null);
  const tlLineRef = useRef(null);
  const tlDotsRef = useRef([]);
  const codeSecRef = useRef(null);
  const bentoRefs = useRef([]);
  const statsSecRef = useRef(null);
  const statValRefs = useRef([]);

  const [activeChannel, setActiveChannel] = useState(null);
  const [codeVisible, setCodeVisible] = useState(false);
  const [statsGo, setStatsGo] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  /* ── Inject CSS ── */
  useEffect(() => {
    const ID = "nn-css";
    if (!document.getElementById(ID)) {
      const el = document.createElement("style");
      el.id = ID; el.textContent = CSS;
      document.head.appendChild(el);
    }
    return () => document.getElementById("nn-css")?.remove();
  }, []);

  /* ── Master scroll handler ── */
  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      /* 1 — progress bar */
      if (barRef.current) barRef.current.style.width = `${(sy / max) * 100}%`;

      /* 2 — nav solid */
      navRef.current?.classList.toggle("solid", sy > 10);

      /* 3 — headline split parallax */
      if (hero1Ref.current) hero1Ref.current.style.transform = `translateX(${-sy * 0.07}px)`;
      if (hero2Ref.current) hero2Ref.current.style.transform = `translateX(${sy * 0.07}px)`;

      /* 4 — timeline SVG line draw */
      if (tlSecRef.current && tlLineRef.current) {
        const rect = tlSecRef.current.getBoundingClientRect();
        const p = Math.max(0, Math.min(1,
          (window.innerHeight - rect.top) / (tlSecRef.current.offsetHeight * 0.85)));
        const len = 600;
        tlLineRef.current.style.strokeDasharray = `${len}`;
        tlLineRef.current.style.strokeDashoffset = `${len * (1 - p)}`;

        tlDotsRef.current.forEach((dot, i) => {
          if (!dot) return;
          dot.classList.toggle("lit", p > (i + 0.8) / (STEPS.length + 1));
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Channel active row (IO) ── */
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setActiveChannel(+e.target.dataset.ch);
      });
    }, { rootMargin: "-38% 0px -38% 0px" });
    chItemRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ── Bento clip-path wipe (IO) ── */
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("vis"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    bentoRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.transitionDelay = `${i * 0.1}s`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  /* ── Code section visibility (IO) ── */
  useEffect(() => {
    if (!codeSecRef.current || codeVisible) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setCodeVisible(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(codeSecRef.current);
    return () => io.disconnect();
  }, [codeVisible]);

  /* ── Stats counter, easeOutExpo (IO) ── */
  useEffect(() => {
    if (!statsSecRef.current || statsGo) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setStatsGo(true);
      io.disconnect();
      const easeOutExpo = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
      STATS_DATA.forEach((s, i) => {
        const el = statValRefs.current[i];
        if (!el) return;
        const DUR = 1800;
        const t0 = performance.now();
        const tick = now => {
          const t = Math.min((now - t0) / DUR, 1);
          const q = easeOutExpo(t);
          const v = s.raw % 1 !== 0
            ? (s.raw * q).toFixed(1)
            : Math.round(s.raw * q);
          el.textContent = `${s.prefix}${v}${s.suffix}`;
          if (t < 1) requestAnimationFrame(tick);
        };
        setTimeout(() => requestAnimationFrame(tick), i * 130);
      });
    }, { threshold: 0.3 });
    io.observe(statsSecRef.current);
    return () => io.disconnect();
  }, [statsGo]);

  /* ── RENDER ── */
  return (
    <>
      <div className="nn-bar" ref={barRef} />

      {/* ════ NAV ════ */}
      <nav className="nn-nav" ref={navRef}>
        <div className="nn-logo" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>Signal<b>Flow</b></div>
        <ul className="nn-nav-links">
          {["Channels", "Architecture", "Features", "Pricing", "Docs"].map(l => (
            <li key={l}>
              {l === "Docs" ? (
                <a href="/docs">{l}</a>
              ) : (
                <a href={`#${l.toLowerCase()}`}>{l}</a>
              )}
            </li>
          ))}
        </ul>
        <div className="nn-nav-end">
          <button className="btn-ghost" onClick={() => window.location.href = '/login'}>Sign in</button>
          <button className="btn-fill" onClick={() => window.location.href = '/login'}>Get started</button>
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <section className="nn-hero" id="hero">
        <div className="nn-hero-deco" aria-hidden>N</div>

        <div className="nn-hero-l">
          <div className="nn-overline">
            <span className="nn-overline-bar" />
            Notification Infrastructure API
          </div>
          <h1>
            <span className="nn-h1-l" ref={hero1Ref}>SEND EVERY</span>
            <span className="nn-h1-l" ref={hero2Ref}>
              <span className="nn-h1-em">NOTIFICATION.</span>
            </span>
          </h1>
          <p className="nn-hero-sub">
            One API to route, deliver, and observe notifications across email,
            SMS, and push channels — with fully asynchronous Redis job queues
            and robust delivery observability.
          </p>
          <div className="nn-hero-btns">
            <button className="btn-hero-a" onClick={() => window.location.href = '/login'}>Start building →</button>
            <button className="btn-hero-b" onClick={() => window.location.href = '/login'}>Sign in</button>
          </div>
        </div>

        {/* Right: live metrics widget */}
        <div className="nn-hero-r">
          <div className="nn-widget">
            <div className="nn-widget-hd">
              <span className="nn-widget-title">Delivery Overview</span>
              <span className="nn-widget-live">
                <span className="nn-widget-live-dot" />
                LIVE
              </span>
            </div>
            <div className="nn-widget-metrics">
              {[
                { lbl: "Delivered today", val: "12,847", suffix: "+2.4%", fill: "91%" },
                { lbl: "Success rate", val: "98.7%", suffix: "↑ 0.3%", fill: "98.7%" },
                { lbl: "Avg latency", val: "47ms", suffix: "stable", fill: "62%" },
              ].map(({ lbl, val, suffix, fill }) => (
                <div className="nn-widget-metric" key={lbl}>
                  <div className="nn-widget-metric-row">
                    <span className="nn-widget-metric-lbl">{lbl}</span>
                    <span className="nn-widget-metric-val">{val}<span>{suffix}</span></span>
                  </div>
                  <div className="nn-widget-bar-bg">
                    <div className="nn-widget-bar-fill" style={{ width: fill }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="nn-widget-chart">
              <div className="nn-widget-chart-lbl">Last 7 days · notifications sent</div>
              <div className="nn-widget-bars">
                {[45, 62, 38, 71, 55, 83, 100].map((h, i) => (
                  <div
                    key={i}
                    className={`nn-widget-bar-col${i === 6 ? ' hi' : ''}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="nn-widget-footer">
              <span className="nn-widget-footer-stat">Channels: <b>Email · SMS · Push</b></span>
              <span className="nn-widget-footer-stat">Engine: <b>Java / Redis</b></span>
            </div>
          </div>
        </div>
      </section>

      {/* ════ MARQUEE ════ */}
      <div className="nn-mq">
        <div className="nn-mq-row">
          <div className="nn-mq-track">
            {[...TICKER_A, ...TICKER_A].map((t, i) => (
              <span className="nn-mq-item" key={i}>
                <span className="hi">{t}</span><span className="nn-mq-sep" />
              </span>
            ))}
          </div>
        </div>
        <div className="nn-mq-row">
          <div className="nn-mq-track rev">
            {[...TICKER_B, ...TICKER_B].map((t, i) => (
              <span className="nn-mq-item" key={i}>
                {t}<span className="nn-mq-sep" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ════ CHANNELS TABLE ════ */}
      <section className="nn-channels" id="channels">
        <div className="nn-ch-hd">
          <div>
            <div className="nn-overline" style={{ marginBottom: 16 }}>
              <span className="nn-overline-bar" />Channels
            </div>
            <h2 className="nn-sec-title">Every channel,<br /><em>one integration.</em></h2>
          </div>
          <p className="nn-ch-hd-r">
            Connect all your notification channels through a unified API.
            Scroll to see what each one supports.
          </p>
        </div>

        {CHANNELS.map((ch, i) => (
          <div
            key={i}
            className={`nn-ch-row ${activeChannel === i ? "active" : ""}`}
            data-ch={i}
            ref={el => (chItemRefs.current[i] = el)}
          >
            <div className="nn-ch-row-top">
              <span className="nn-ch-num">{ch.num}</span>
              <span className="nn-ch-name">{ch.name}</span>
              <span className="nn-ch-brief">{ch.brief}</span>
              <span className={`nn-ch-tag ${ch.tag.toLowerCase()}`}>{ch.tag}</span>
            </div>
            <div className="nn-ch-body">
              <div className="nn-ch-body-inner">
                <div className="nn-ch-body-content">
                  <div />
                  <p className="nn-ch-body-desc">{ch.desc}</p>
                  <ul className="nn-ch-caps">
                    {ch.caps.map(c => <li className="nn-ch-cap" key={c}>{c}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ════ TIMELINE ════ */}
      <section className="nn-timeline" id="architecture" ref={tlSecRef}>
        <div className="nn-tl-hd">
          <div className="nn-overline" style={{ marginBottom: 16 }}>
            <span className="nn-overline-bar" />How it works
          </div>
          <h2 className="nn-sec-title" style={{ maxWidth: 480 }}>
            API call to<br /><em>delivered.</em>
          </h2>
        </div>

        <div className="nn-tl-inner">
          {/* SVG vertical line — drawn by scroll */}
          <div className="nn-tl-svg-wrap">
            <svg width="2" height="100%" style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>
              <line
                ref={tlLineRef}
                x1="1" y1="0" x2="1" y2="100%"
                stroke="var(--accent)" strokeWidth="2"
                strokeDasharray="600" strokeDashoffset="600"
                style={{ transition: "stroke-dashoffset .1s linear" }}
              />
            </svg>
          </div>

          <div className="nn-tl-steps">
            {STEPS.map((s, i) => (
              <div className="nn-tl-step" key={i}>
                {/* Left content slot */}
                {s.side === "left"
                  ? <div className="nn-tl-content" style={{ textAlign: "right" }}>
                    <div className="nn-tl-step-num">{s.num}</div>
                    <div className="nn-tl-step-title">{s.title}</div>
                    <div className="nn-tl-step-desc">{s.desc}</div>
                  </div>
                  : <div />}

                {/* Center dot */}
                <div className="nn-tl-center">
                  <div className="nn-tl-dot" ref={el => (tlDotsRef.current[i] = el)} />
                </div>

                {/* Right content slot */}
                {s.side === "right"
                  ? <div className="nn-tl-content" style={{ textAlign: "left" }}>
                    <div className="nn-tl-step-num">{s.num}</div>
                    <div className="nn-tl-step-title">{s.title}</div>
                    <div className="nn-tl-step-desc">{s.desc}</div>
                  </div>
                  : <div />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CODE SECTION ════ */}
      <section className="nn-code-section" id="features" ref={codeSecRef}>
        <div className="nn-code-hd">
          <div className="nn-code-overline">
            <span className="nn-code-overline-bar" />Integration
          </div>
          <h2 className="nn-code-title">Ship in <em>minutes,</em><br />not weeks.</h2>
        </div>

        <div className="nn-code-wrap">
          <div className="nn-code-bar">
            {["cURL", "JavaScript", "Python", "Go"].map((tab, i) => (
              <button
                key={tab}
                className={`nn-code-tab ${activeTab === i ? "on" : ""}`}
                onClick={() => setActiveTab(i)}
              >{tab}</button>
            ))}
          </div>
          <div className="nn-code-body">
            <pre className="nn-code-pre">
              {!codeVisible
                ? <span style={{ color: "rgba(255,255,255,.12)" }}>{"// waiting..."}</span>
                : CODE_SNIPPETS[activeTab].map((line, li) => (
                  <span key={li}>
                    {line.map((tok, ti) => {
                      const cls = { k: "tok-k", s: "tok-s", c: "tok-c", f: "tok-f", p: "tok-p", a: "tok-a" }[tok.t] || "";
                      return <span key={ti} className={cls}>{tok.v}</span>;
                    })}
                    {"\n"}
                  </span>
                ))
              }
            </pre>
          </div>
        </div>
      </section>

      {/* ════ BENTO FEATURES ════ */}
      <section className="nn-bento-section">
        <div className="nn-bento-hd">
          <div className="nn-overline" style={{ marginBottom: 16 }}>
            <span className="nn-overline-bar" />Capabilities
          </div>
          <h2 className="nn-sec-title">
            Everything you need<br />to <em>ship notifications.</em>
          </h2>
        </div>

        <div className="nn-bento-grid">
          {BENTO.map((b, i) => (
            <div
              key={i}
              className={`nn-bento-card ${b.cls}`}
              ref={el => (bentoRefs.current[i] = el)}
            >
              <div className="nn-bento-idx">{b.idx}</div>
              <div className="nn-bento-title">{b.title}</div>
              <p className="nn-bento-desc">{b.desc}</p>
              <div className="nn-bento-tags">
                {b.tags.map(t => <span className="nn-bento-tag" key={t}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ STATS ════ */}
      <section className="nn-stats" ref={statsSecRef}>
        <div className="nn-stats-grid">
          {STATS_DATA.map((s, i) => (
            <div className="nn-stat" key={i}>
              <span
                className="nn-stat-val"
                ref={el => (statValRefs.current[i] = el)}
              >
                {s.display}
              </span>
              <div className="nn-stat-lbl" style={{ whiteSpace: "pre-line" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section className="nn-cta">
        <div className="nn-cta-inner">
          <h2>
            Notifications<br />done <em>right.</em>
          </h2>
          <div>
            <p className="nn-cta-sub">
              Connect your first channel in minutes using the REST API.
              Self-hosted, no vendor lock-in, fully yours.
            </p>
            <div className="nn-cta-btns">
              <button className="btn-cta-a" onClick={() => window.location.href = '/login'}>Get started free <span>→</span></button>
              <button className="btn-cta-b" onClick={() => window.location.href = '/login'}>Sign in <span style={{ opacity: .4 }}>↗</span></button>
            </div>
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="nn-footer">
        <div className="nn-footer-top">
          <div>
            <div className="nn-fl-logo">Signal<b>Flow</b></div>
            <p className="nn-fl-about">
              A high-performance notification infrastructure project.
              Fully self-hosted, MIT licensed, and powered by Spring Boot and Redis.
            </p>
          </div>
          {[
            {
              hd: "Developer Info",
              links: [
                { label: "GitHub Repository", href: "https://github.com/Abhishek720777/SignalFlow" },
                { label: "Developer Profile", href: "https://github.com/Abhishek720777" }
              ]
            }
          ].map(({ hd, links }) => (
            <div key={hd}>
              <div className="nn-fl-hd">{hd}</div>
              <ul className="nn-fl-links">
                {links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="nn-footer-bot">
          <span className="nn-footer-copy">© 2026 SignalFlow · Developed by Abhishek</span>
          <div className="nn-footer-certs">
            {["SELF-HOSTED", "MIT LICENSE", "REST API"].map(c => (
              <span className="nn-footer-cert" key={c}>{c}</span>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
