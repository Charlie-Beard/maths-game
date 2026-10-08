import { rng } from './paper';

/**
 * Generates a tileable paper-grain texture once at startup (no image file
 * to download) and exposes it as the --grain-url CSS variable.
 *
 * It also makes --grain-alpha-url, the version the stage-wide .grain
 * overlay uses: a see-through warm-dark speckle. Laying it over the stage
 * darkens it just as multiplying by the grey grain at 0.32 would (black at
 * alpha 0.32 × (1 − grey) is the same sum), but without mix-blend-mode,
 * which on Safari re-blends the whole stage whenever anything under it moves.
 */
export function installGrain(root: HTMLElement = document.documentElement): void {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  if (!g) return;
  const img = g.createImageData(size, size);
  const r = rng(1234);

  // Mid-grey noise, slightly clumped, plus a few long fibres.
  const base = new Float32Array(size * size);
  for (let i = 0; i < base.length; i++) base[i] = r();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const n =
        base[i] * 0.5 +
        base[((y + 1) % size) * size + x] * 0.2 +
        base[y * size + ((x + 1) % size)] * 0.2 +
        base[((y + size - 1) % size) * size + ((x + 1) % size)] * 0.1;
      const v = 214 + n * 41;
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v - 2;
      img.data[i * 4 + 2] = v - 7;
      img.data[i * 4 + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);

  g.globalAlpha = 0.07;
  g.strokeStyle = '#5a4630';
  g.lineWidth = 0.8;
  for (let k = 0; k < 90; k++) {
    let x = r() * size;
    let y = r() * size;
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 6; s++) {
      x += (r() - 0.5) * 14;
      y += (r() - 0.5) * 14;
      g.lineTo(x, y);
    }
    g.stroke();
  }

  root.style.setProperty('--grain-url', `url(${canvas.toDataURL('image/png')})`);

  const d = g.getImageData(0, 0, size, size);
  for (let i = 0; i < d.data.length; i += 4) {
    const grey = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 3;
    // A warm near-black: paper loses a little more blue than red.
    d.data[i] = 24;
    d.data[i + 1] = 16;
    d.data[i + 2] = 0;
    d.data[i + 3] = Math.round(0.32 * (255 - grey));
  }
  g.putImageData(d, 0, 0);
  root.style.setProperty('--grain-alpha-url', `url(${canvas.toDataURL('image/png')})`);
}
