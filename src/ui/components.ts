/** Reusable paper UI widgets built from the art kit. */
import { C } from '../art/palette';
import { hashString, rect, tear, toPath } from '../art/paper';
import { parchment, waxSeal, type IconName } from '../art/ui';
import { h, place } from './dom';

export function sealButton(
  icon: IconName,
  o: { x: number; y: number; size?: number; color?: string; label?: string; aria: string; name?: string },
): HTMLButtonElement {
  const size = o.size ?? 120;
  const btn = h('button', {
    class: 'seal-btn',
    'aria-label': o.aria,
    html: waxSeal(icon, o.color ?? C.red, size, o.name ?? `${icon}-${o.x}-${o.y}`),
  }) as HTMLButtonElement;
  if (o.label) btn.append(h('span', { class: 'label' }, o.label));
  place(btn, o.x, o.y, size, size);
  return btn;
}

/** A torn parchment banner with a title. */
export function banner(text: string, o: { x: number; y: number; w: number; h?: number; size?: number; fill?: string }): HTMLElement {
  const hh = o.h ?? 92;
  const el = h('div', { class: 'banner', html: parchment(o.w, hh, 'banner-' + text, o.fill ?? C.cream, 0.8) });
  el.append(h('div', { class: 'banner-text', style: `font-size:${o.size ?? 40}px` }, text));
  place(el, o.x, o.y, o.w, hh);
  return el;
}

/** A torn-paper speech bubble with a tail pointing left. */
export function speech(text: string, o: { x: number; y: number; w: number; h: number; tail?: 'left' | 'down' }): HTMLElement {
  const seed = hashString(text);
  const body = rect(30, 10, o.w - 40, o.h - 20, 24);
  const d = toPath(tear(body, seed, { wobble: 2, jag: 1 }));
  const tail = o.tail === 'down' ? `M${o.w * 0.3} ${o.h - 14} L${o.w * 0.24} ${o.h + 26} L${o.w * 0.42} ${o.h - 14}Z` : `M34 ${o.h * 0.55} L0 ${o.h * 0.72} L34 ${o.h * 0.75}Z`;
  const el = h('div', {
    class: 'speech',
    html: `<svg viewBox="0 0 ${o.w} ${o.h + 30}" width="${o.w}" height="${o.h + 30}" aria-hidden="true">
      <path d="${d}" fill="rgba(20,12,4,0.3)" transform="translate(3 6)"/>
      <path d="${tail}" fill="${C.white}"/>
      <path d="${d}" fill="${C.white}"/>
    </svg>`,
  });
  el.append(h('div', { class: 'speech-text', style: `left:52px;top:22px;width:${o.w - 84}px;height:${o.h - 44}px` }, text));
  place(el, o.x, o.y, o.w, o.h + 30);
  return el;
}

/** A Folk card: portrait in an ornate frame with a name plate. */
export function folkCard(portrait: string, name: string, o: { w: number; locked?: boolean; seed?: number }): HTMLElement {
  const w = o.w;
  const hgt = Math.round(w * 1.4);
  const seed = o.seed ?? hashString(name);
  const outer = toPath(tear(rect(4, 4, w - 8, hgt - 8, 14), seed, { wobble: 1.4, jag: 0.6 }));
  const inner = toPath(tear(rect(w * 0.08, w * 0.08, w * 0.84, hgt * 0.72, 10), seed + 1, { wobble: 1, jag: 0.4 }));
  const el = h('div', { class: `frog-card${o.locked ? ' locked' : ''}`, style: `width:${w}px;height:${hgt}px` });
  el.innerHTML = `<svg class="frame" viewBox="0 0 ${w} ${hgt}" aria-hidden="true">
      <path d="${outer}" fill="rgba(20,12,4,0.35)" transform="translate(3 7)"/>
      <path d="${outer}" fill="${o.locked ? C.slate : C.gold}"/>
      <path d="${inner}" fill="${o.locked ? C.night : C.nightLight}"/>
    </svg>
    <div class="frog-portrait" style="left:${w * 0.1}px;top:${w * 0.09}px;width:${w * 0.8}px;height:${hgt * 0.7}px">${o.locked ? '<span class="q">?</span>' : portrait}</div>
    <div class="frog-name" style="top:${hgt * 0.79}px;font-size:${Math.max(14, w * 0.11)}px">${o.locked ? '' : name}</div>`;
  return el;
}


/** Re-crops a portrait SVG (300 × 340) to its head and shoulders. */
export function crop(svgStr: string, vb = '50 36 200 200'): string {
  return svgStr.replace(/viewBox="[^"]*"/, `viewBox="${vb}"`);
}

/**
 * A round portrait button: a character's head in a gold paper ring, with a
 * label underneath (Practice with Silky, Moon-Face's Treasure Room).
 */
export function portraitButton(
  portrait: string,
  o: { x: number; y: number; size?: number; ring?: string; label?: string; aria: string; vb?: string },
): HTMLButtonElement {
  const size = o.size ?? 104;
  const seed = hashString('ring' + o.aria);
  const r = size / 2 - 4;
  const ring = toPath(tear(rect(4, 4, size - 8, size - 8, r), seed, { wobble: 1.2, jag: 0.5 }));
  const inner = toPath(tear(rect(12, 12, size - 24, size - 24, r - 8), seed + 1, { wobble: 0.8, jag: 0.3 }));
  const btn = h('button', { class: 'portrait-btn', 'aria-label': o.aria }) as HTMLButtonElement;
  btn.innerHTML = `<svg class="ring" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <path d="${ring}" fill="rgba(20,12,4,0.38)" transform="translate(2 5)"/>
      <path d="${ring}" fill="${o.ring ?? C.gold}"/>
      <path d="${inner}" fill="${C.nightLight}"/>
    </svg>
    <div class="face" style="left:12px;top:12px;width:${size - 24}px;height:${size - 24}px">${crop(portrait, o.vb)}</div>`;
  if (o.label) btn.append(h('span', { class: 'label' }, o.label));
  place(btn, o.x, o.y, size, size);
  return btn;
}

/** The back of a Folk card: gold paper with a little tree on it. */
function cardBack(w: number, seed: number): string {
  const hgt = Math.round(w * 1.4);
  const outer = toPath(tear(rect(4, 4, w - 8, hgt - 8, 14), seed, { wobble: 1.4, jag: 0.6 }));
  const inner = toPath(tear(rect(w * 0.1, w * 0.1, w * 0.8, hgt - w * 0.2, 10), seed + 2, { wobble: 1, jag: 0.4 }));
  const cx = w / 2;
  const cy = hgt / 2;
  const s = w / 100;
  return `<svg viewBox="0 0 ${w} ${hgt}" aria-hidden="true">
      <path d="${outer}" fill="rgba(20,12,4,0.35)" transform="translate(3 7)"/>
      <path d="${outer}" fill="${C.gold}"/>
      <path d="${inner}" fill="${C.greenDeep}"/>
      <g transform="translate(${cx} ${cy}) scale(${s})">
        <path d="M-6 30 L-4 0 L4 0 L6 30Z" fill="${C.bark}"/>
        <circle cx="0" cy="-8" r="18" fill="${C.leaf}"/><circle cx="-14" cy="2" r="11" fill="${C.leafDark}"/><circle cx="14" cy="2" r="11" fill="${C.leafDark}"/>
        <circle cx="0" cy="-30" r="9" fill="${C.cloud}"/><circle cx="-10" cy="-28" r="7" fill="${C.cloud}"/><circle cx="10" cy="-28" r="7" fill="${C.cloud}"/>
      </g>
    </svg>`;
}

/**
 * A Folk card that can flip over: `.card-inner` holds the face and the back
 * (turned away). Set `.card-inner`'s rotationY to 180 to show the back.
 */
export function flipCard(portrait: string, name: string, w: number): HTMLElement {
  const hgt = Math.round(w * 1.4);
  const el = h('div', { class: 'card-flip', style: `width:${w}px;height:${hgt}px` });
  const inner = h('div', { class: 'card-inner' });
  const front = h('div', { class: 'card-face' });
  front.append(folkCard(portrait, name, { w }));
  const back = h('div', { class: 'card-face card-back', html: cardBack(w, hashString(name)) });
  inner.append(front, back);
  el.append(inner);
  return el;
}
