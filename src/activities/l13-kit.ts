/**
 * Shared bits for land 13's picture-card activities (`turn`, `solid`): a
 * torn-paper card that holds a drawing, so the answers are pictures he
 * taps and not words he has to read. Each card is a button with a
 * `data-value` (the answer it gives).
 */
import { C } from '../art/palette';
import { hashString } from '../art/paper';
import { tileCard } from '../art/ui';
import { h, place } from '../ui/dom';

/** A card with a drawing (an SVG string) and, if wanted, a small caption under it. */
export function pictureCard(value: string, aria: string, drawing: string, x: number, y: number, w: number, hgt: number, caption?: string): HTMLElement {
  const card = h('button', { class: 'choice l13-card', 'aria-label': aria, 'data-value': value, html: tileCard(w, hgt, hashString('l13-card' + value + x), C.cream) });
  card.append(h('div', { class: 'l13-pic', style: caption ? 'bottom:44px' : undefined, html: drawing }));
  if (caption) card.append(h('div', { class: 'l13-caption' }, caption));
  return place(card, x, y, w, hgt);
}
