// JAGENT — jacket art pool. Each tokenId is assigned one design from a fixed
// pool of studio jacket photos, deterministically from the tokenId alone
// (mulberry32 hash). The assignment happens "at mint": tokenURI ->
// /metadata/<id> (served by the Pages _worker.js) returns JSON whose image is
// the pool file for that tokenId. The pool files are static assets in the
// site zip (/img/pool-<k>.jpg).
// FREEZE RULE: the pool (size and order) must not change after the sale
// starts, or already-minted tokens would change their image.
const POOL = [
  { model: 'Bomber', colorway: 'Midnight Black', file: 'pool-0.jpg' },
  { model: 'Varsity', colorway: 'Royal Navy', file: 'pool-1.jpg' },
  { model: 'Racing', colorway: 'Crimson Red', file: 'pool-2.jpg' },
  { model: 'Denim', colorway: 'Denim Blue', file: 'pool-3.jpg' }
];

// Each token also gets a color TINT (SVG hue-rotate filter over the pool
// image) and its own number: 4 designs x 12 tints, every tokenId different.
// `accent` colors the "#<id>" number in the image; `deg` is the hue rotation.
const TINTS = [
  { name: 'Original', deg: 0, accent: '#e8c15a' },
  { name: 'Ember', deg: 30, accent: '#f08a3c' },
  { name: 'Solar', deg: 60, accent: '#f2d13c' },
  { name: 'Lime', deg: 90, accent: '#b7e33c' },
  { name: 'Verdant', deg: 120, accent: '#3ce37a' },
  { name: 'Jade', deg: 150, accent: '#3ce3b0' },
  { name: 'Lagoon', deg: 180, accent: '#3cd0e3' },
  { name: 'Azure', deg: 210, accent: '#3c8ce3' },
  { name: 'Indigo', deg: 240, accent: '#5a5ae8' },
  { name: 'Violet', deg: 270, accent: '#a05ae8' },
  { name: 'Magenta', deg: 300, accent: '#e33cd0' },
  { name: 'Rose', deg: 330, accent: '#e33c6e' }
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function designFor(id) {
  const rnd = mulberry32((id * 2654435761) >>> 0);
  const d = POOL[Math.floor(rnd() * POOL.length)];
  const tint = TINTS[Math.floor(rnd() * TINTS.length)];
  return { ...d, tint };
}

function metadataFor(id, base) {
  const d = designFor(id);
  return {
    name: `JAGENT #${id}`,
    description: 'JAGENT NFT for Binance Agent ID holders on BNB Smart Chain. Phase 1 NFT mint — the holder receives this NFT only. The JAGENT token (Phase 2) will be distributed later by snapshot of NFT holders: free-minted NFTs carry 15,000,000 JAGENT each; paid-minted NFTs carry by batch (batch 1: 50,000,000 each, decreasing 2,500,000 per batch to 15,000,000 in batch 15). Jacket design and color tint are assigned deterministically from the tokenId at mint time (4 designs x 12 tints), and every token carries its own number.',
    image: `${base}/img/${id}.svg`,
    external_url: base,
    attributes: [
      { trait_type: 'Model', value: d.model },
      { trait_type: 'Colorway', value: d.colorway },
      { trait_type: 'Tint', value: d.tint.name }
    ]
  };
}

// Per-token image: the pool photo with the collection name and the token
// number composited on top, as one SVG served by the worker at /img/<id>.svg.
function overlaySvgFor(id, base) {
  const d = designFor(id);
  const filter = d.tint.deg === 0 ? '' : ` filter="url(#tint)"`;
  const filterDef = d.tint.deg === 0 ? '' : `<filter id="tint" color-interpolation-filters="sRGB"><feColorMatrix type="hueRotate" values="${d.tint.deg}"/></filter>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1600">
<defs>${filterDef}<linearGradient id="band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.82"/></linearGradient></defs>
<image href="${base}/img/${d.file}" x="0" y="0" width="1600" height="1600"${filter}/>
<rect x="0" y="1230" width="1600" height="370" fill="url(#band)"/>
<text x="72" y="1470" font-family="Arial, Helvetica, sans-serif" font-size="118" font-weight="900" letter-spacing="10" fill="#ffffff">JAGENT</text>
<text x="76" y="1536" font-family="Arial, Helvetica, sans-serif" font-size="40" letter-spacing="7" fill="#cfd3d8">BNB CHAIN · AGENT ID</text>
<text x="1528" y="1470" font-family="Arial, Helvetica, sans-serif" font-size="118" font-weight="900" fill="${d.tint.accent}" text-anchor="end">#${id}</text>
</svg>`;
}

const BASE = 'https://jagent.pages.dev';
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let m = url.pathname.match(/^\/metadata\/(\d+)$/);
    if (m) { const id = parseInt(m[1], 10); return new Response(JSON.stringify(metadataFor(id, BASE)), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=31536000, immutable' } }); }
    m = url.pathname.match(/^\/img\/(\d+)\.svg$/);
    if (m) { const id = parseInt(m[1], 10); return new Response(overlaySvgFor(id, BASE), { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=31536000, immutable' } }); }
    return env.ASSETS.fetch(request);
  }
};
