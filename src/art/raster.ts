/**
 * Turning finished paper art into pictures.
 *
 * Inline SVG keeps every torn piece as a live node: the browser holds a
 * path per piece, re-checks them on layout, and repaints them as a page
 * scrolls. An `<img>` of the same SVG is drawn once into a bitmap, and after
 * that scrolling and fading just move that bitmap. For art that never
 * changes (the tree behind the map, a shelf of keepsakes) that is the same
 * picture for a fraction of the work, which is what an iPad wants.
 *
 * Two limits, and both are handled here:
 *  - An SVG used as an image cannot load web fonts, so anything with <text>
 *    in it stays inline (Andika would turn into a serif).
 *  - An image is clipped to its viewBox, while paper art may overhang its
 *    box a little (`overflow: visible`). `pad` widens the viewBox to keep
 *    that overhang; the CSS in scenes-perf.css pulls the image back by the
 *    same amount so nothing moves.
 */

/** True when the art can safely become a picture (no text, which needs the page's fonts). */
export function canRasterise(svgStr: string): boolean {
  return !svgStr.includes('<text') && !svgStr.includes('<foreignObject');
}

/** The SVG with a margin all round inside its viewBox, so overhanging pieces are not clipped. */
function padded(svgStr: string, pad: number): string {
  if (pad <= 0) return svgStr;
  return svgStr.replace(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/, (_m, x, y, w, hh) => {
    const px = Number(w) * pad;
    const py = Number(hh) * pad;
    return `viewBox="${Number(x) - px} ${Number(y) - py} ${Number(w) + px * 2} ${Number(hh) + py * 2}"`;
  });
}

/** Pictures made so far, by art and padding: a keepsake shown twice is drawn once. */
const urls = new Map<string, string>();

function urlFor(svgStr: string, pad: number): string {
  const key = `${pad}|${svgStr}`;
  let url = urls.get(key);
  if (!url) {
    url = URL.createObjectURL(new Blob([padded(svgStr, pad)], { type: 'image/svg+xml' }));
    urls.set(key, url);
  }
  return url;
}

/**
 * An `<img>` of the art, or the art itself when it has text. The result is
 * an HTML string, a drop-in for the SVG string it came from. With `pad` it
 * gets the class `raster-pad`, which sizes it 120% and pulls it back.
 */
export function rasterHtml(svgStr: string, pad = 0): string {
  if (!canRasterise(svgStr)) return svgStr;
  return `<img class="raster${pad > 0 ? ' raster-pad' : ''}" src="${urlFor(svgStr, pad)}" alt="" draggable="false">`;
}

/** Waits until every picture under `el` is ready, so a scene never shows a blank first frame. */
export async function picturesReady(el: ParentNode): Promise<void> {
  const imgs = [...el.querySelectorAll<HTMLImageElement>('img.raster')];
  await Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
}
