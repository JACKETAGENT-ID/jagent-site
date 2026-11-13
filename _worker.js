// JAGENT — jacket art pool. Each tokenId is assigned one design from a fixed
// pool of studio jacket photos, deterministically from the tokenId alone
// (mulberry32 hash). The assignment happens "at mint": tokenURI ->
// /metadata/<id> (served by the Pages _worker.js) returns JSON whose image is
// the pool file for that tokenId. The pool files are static assets in the
// site zip (/img/pool-<k>.jpg).
// FREEZE RULE: the pool (size and order) must not change after the sale
// starts, or already-minted tokens would change their image.
const POOL = [
  { model: '飞行夹克', colorway: '午夜黑', file: 'pool-0.jpg' },
  { model: '棒球夹克', colorway: '皇家海军蓝', file: 'pool-1.jpg' },
  { model: '赛车夹克', colorway: '深红', file: 'pool-2.jpg' },
  { model: '牛仔夹克', colorway: '牛仔蓝', file: 'pool-3.jpg' }
];

// Each token also gets a color TINT (SVG hue-rotate filter over the pool
// image) and its own number: 4 designs x 12 tints, every tokenId different.
// `accent` colors the "#<id>" number in the image; `deg` is the hue rotation.
const TINTS = [
  { name: '原版', deg: 0, accent: '#e8c15a' },
  { name: '余烬', deg: 30, accent: '#f08a3c' },
  { name: '日光', deg: 60, accent: '#f2d13c' },
  { name: '青柠', deg: 90, accent: '#b7e33c' },
  { name: '翠绿', deg: 120, accent: '#3ce37a' },
  { name: '翡翠', deg: 150, accent: '#3ce3b0' },
  { name: '泻湖', deg: 180, accent: '#3cd0e3' },
  { name: '蔚蓝', deg: 210, accent: '#3c8ce3' },
  { name: '靛蓝', deg: 240, accent: '#5a5ae8' },
  { name: '紫罗兰', deg: 270, accent: '#a05ae8' },
  { name: '品红', deg: 300, accent: '#e33cd0' },
  { name: '玫瑰', deg: 330, accent: '#e33c6e' }
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
    description: 'JAGENT NFT，面向 BNB Smart Chain 上的 Binance Agent ID 持有人。第一阶段 NFT 铸造——持有人仅获得本 NFT。JAGENT 代币（第二阶段）将于日后按 NFT 持有人快照分配：免费铸造 NFT 每张携带 15,000,000 JAGENT；付费铸造 NFT 按批次计（第 1 批每张 50,000,000，每批递减 2,500,000，至第 15 批每张 15,000,000）。夹克款式与色调在铸造时由 tokenId 确定性分配（4 款设计 x 12 种色调），每张 token 均带自己的编号。',
    image: `${base}/img/${id}.svg`,
    external_url: base,
    attributes: [
      { trait_type: '型号', value: d.model },
      { trait_type: '配色', value: d.colorway },
      { trait_type: '色调', value: d.tint.name }
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
<g transform="translate(803 636)" fill="#000000" opacity="0.28"><polygon points="0,-44 44,0 0,44 -44,0"/><polygon points="0,-92 26,-66 0,-40 -26,-66"/><polygon points="0,40 26,66 0,92 -26,66"/><polygon points="-92,0 -66,-26 -40,0 -66,26"/><polygon points="40,0 66,-26 92,0 66,26"/><polygon points="44,-58 58,-44 44,-30 30,-44"/><polygon points="44,30 58,44 44,58 30,44"/><polygon points="-44,30 -30,44 -44,58 -58,44"/><polygon points="-44,-58 -30,-44 -44,-30 -58,-44"/></g>
<g transform="translate(800 632) scale(1.45)" fill="#F0B90B"><polygon points="0,-44 44,0 0,44 -44,0"/><polygon points="0,-92 26,-66 0,-40 -26,-66"/><polygon points="0,40 26,66 0,92 -26,66"/><polygon points="-92,0 -66,-26 -40,0 -66,26"/><polygon points="40,0 66,-26 92,0 66,26"/><polygon points="44,-58 58,-44 44,-30 30,-44"/><polygon points="44,30 58,44 44,58 30,44"/><polygon points="-44,30 -30,44 -44,58 -58,44"/><polygon points="-44,-58 -30,-44 -44,-30 -58,-44"/></g>
<rect x="0" y="1230" width="1600" height="370" fill="url(#band)"/>
<text x="72" y="1470" font-family="Arial, Helvetica, sans-serif" font-size="118" font-weight="900" letter-spacing="10" fill="#ffffff">JAGENT</text>
<text x="76" y="1536" font-family="Arial, Helvetica, sans-serif" font-size="40" letter-spacing="7" fill="#cfd3d8">BNB CHAIN · AGENT ID</text>
<text x="1528" y="1470" font-family="Arial, Helvetica, sans-serif" font-size="118" font-weight="900" fill="${d.tint.accent}" text-anchor="end">#${id}</text>
</svg>`;
}

const BASE = 'https://jacketagent.pages.dev';
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
