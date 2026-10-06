/**
 * "What's the password?" The way in, asked by Moon-Face at the foot of the
 * Faraway Tree. One password (Jasper's) opens the cloud save, and the
 * device remembers it after that, so it is only ever typed once.
 */
import { unlock } from '../audio/engine';
import { sfx } from '../audio/sfx';
import { characterArt } from '../art/characters';
import { C } from '../art/palette';
import { treeDusk } from '../art/scenery';
import { parchment } from '../art/ui';
import { signIn, type Who } from '../cloud/api';
import { breathe, sm, wobble } from '../ui/anim';
import { sealButton, speech } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene, type App } from '../ui/scene';

const TRY_AGAIN = {
  wrong: 'That’s not the password. Try again!',
  busy: 'Too many tries. Wait a minute, then try again.',
  offline: 'Can’t reach the Faraway Tree. Check the internet, then try again.',
};

export class LoginScene extends Scene {
  private card!: HTMLElement;
  private moon!: HTMLElement;
  private bubble!: HTMLElement;
  private input!: HTMLInputElement;
  private message!: HTMLElement;
  private busy = false;
  readonly hidesGear = true;

  constructor(
    app: App,
    private readonly onSignedIn: (who: Who) => void,
  ) {
    super(app, 'login');
  }

  build(): void {
    const r = this.root;
    r.append(h('div', { class: 'backdrop-wrap', html: treeDusk('login-tree') }), h('div', { class: 'dim' }));
    r.append(place(h('div', { class: 'big-title', style: 'font-size:84px' }, 'Up the Faraway Tree'), 0, 34));

    // Moon-Face asks; the card with the box sits beside him. Both are kept
    // in the top part of the stage: the iPad keyboard covers the bottom.
    this.moon = place(h('div', { class: 'login-moon', html: characterArt('moonface') }), 60, 236, 260, 295);
    this.bubble = speech('What’s the password?', { x: 330, y: 166, w: 580, h: 104 });
    this.bubble.classList.add('login-ask');

    this.card = place(h('div', { class: 'login-card', html: parchment(620, 240, 'login-card', C.cream, 1) }), 350, 300, 620, 240);
    const form = h('form', { class: 'login-form', autocomplete: 'off' });
    this.input = h('input', {
      type: 'text',
      name: 'password',
      'aria-label': 'Password',
      autocomplete: 'off',
      autocapitalize: 'none',
      autocorrect: 'off',
      spellcheck: 'false',
      enterkeyhint: 'go',
      maxlength: 40,
    });
    form.append(this.input);
    const go = sealButton('tick', { x: 480, y: 40, size: 104, color: C.greenDark, aria: 'Go in', name: 'login-go' });
    this.message = h('p', { class: 'login-message', role: 'status' });
    this.card.append(form, go, this.message);
    r.append(this.moon, this.bubble, this.card);
    this.onCleanup(breathe(this.moon, 0.03, 3));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      void this.submit();
    });
    this.tap(go, () => void this.submit());
  }

  enter(): void {
    sm(this.card, 0.5, { startAt: { y: 260, rotation: -4 }, y: 0, rotation: 0, ease: 'back.out(1.4)' });
    sm(this.bubble, 0.4, { startAt: { scale: 0, transformOrigin: '0% 70%' }, scale: 1, ease: 'back.out(1.6)' });
  }

  private async submit(): Promise<void> {
    if (this.busy) return;
    if (!this.input.value.trim()) {
      this.input.focus();
      return;
    }
    this.busy = true;
    this.card.classList.add('busy');
    this.message.textContent = '';
    void unlock();
    const res = await signIn(this.input.value);
    this.busy = false;
    this.card.classList.remove('busy');
    if (!this.alive) return;
    if (res.ok) {
      this.input.blur();
      sfx.sparkle();
      await sm(this.card, 0.35, { scale: 1.06, opacity: 0, ease: 'power2.in' });
      this.onSignedIn(res.who);
      return;
    }
    sfx.wrong();
    void wobble(this.card);
    this.message.textContent = TRY_AGAIN[res.reason];
    if (res.reason === 'wrong') this.input.select();
  }
}
