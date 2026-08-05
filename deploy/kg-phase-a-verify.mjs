// KG-SEO v3 Phase A — post-deploy verification (raw HTTP against production).
// Usage: node deploy/kg-phase-a-verify.mjs
// Checks: (1) status matrix, (2) 301 matrix, (3) @graph validity per page.
import https from 'https';

const HOST = 'alphadigitalagency.id';

function get(path, noFollow = true) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      { host: HOST, path, headers: { 'User-Agent': 'alpha-verify/1.0' } },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            location: res.headers.location || null,
            body: d,
          }),
        );
      },
    );
    req.on('error', reject);
  });
}

const pages = [
  '/',
  '/services/google-ads',
  '/services/ai-agent',
  '/services/booking-engine',
  '/en/services/google-ads',
  '/en/services/ai-agent',
  '/en/services/booking-engine',
  '/blog',
  '/about',
  '/ekosistem',
  '/kelas',
  '/links',
  '/daniel-santoso',
];

const legacy = [
  '/layanan',
  '/en/layanan',
  '/ai-agent',
  '/en/ai-agent',
  '/booking-engine',
  '/en/booking-engine',
  '/layanan/',
];

let failures = 0;

console.log('=== 1. STATUS MATRIX (expect 200) ===');
for (const p of pages) {
  const r = await get(p);
  const tag = r.status === 200 ? 'OK' : 'FAIL';
  if (tag === 'FAIL') failures++;
  console.log(`${tag} ${p} -> ${r.status}`);
}

console.log('\n=== 2. LEGACY 301 MATRIX (expect 301 + Location) ===');
for (const p of legacy) {
  const r = await get(p);
  const expected = {
    '/layanan': '/services/google-ads',
    '/en/layanan': '/en/services/google-ads',
    '/ai-agent': '/services/ai-agent',
    '/en/ai-agent': '/en/services/ai-agent',
    '/booking-engine': '/services/booking-engine',
    '/en/booking-engine': '/en/services/booking-engine',
    '/layanan/': '/services/google-ads',
  }[p];
  const ok = r.status === 301 && r.location === `https://${HOST}${expected}`;
  if (!ok) failures++;
  console.log(`${ok ? 'OK' : 'FAIL'} ${p} -> ${r.status} ${r.location}`);
}

console.log('\n=== 3. @GRAPH VALIDITY (single block, required nodes, dedup) ===');
for (const p of ['/', '/services/google-ads', '/services/ai-agent', '/services/booking-engine', '/blog']) {
  const r = await get(p);
  if (r.status !== 200) {
    console.log(`SKIP ${p} (status ${r.status})`);
    continue;
  }
  const blocks = [...r.body.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (blocks.length !== 1) {
    failures++;
    console.log(`FAIL ${p}: ${blocks.length} ld+json blocks`);
    continue;
  }
  let g;
  try {
    g = JSON.parse(blocks[0])['@graph'];
  } catch (e) {
    failures++;
    console.log(`FAIL ${p}: invalid JSON — ${e.message}`);
    continue;
  }
  const types = g.map((n) => n['@type']);
  const ids = g.filter((n) => n['@id']).map((n) => n['@id']);
  const tstr = JSON.stringify(types);
  const missing = ['Organization', 'LocalBusiness', 'ProfessionalService', 'WebSite', 'WebPage'].filter(
    (rq) => !tstr.includes(rq),
  );
  const dup = [...new Set(ids.filter((i, idx) => ids.indexOf(i) !== idx))];
  const lb = ids.filter((i) => i.endsWith('#localbusiness')).length;
  const ctxLeak = g.filter((n) => n['@context']).length;
  const ok = !missing.length && !dup.length && lb === 1 && !ctxLeak;
  if (!ok) failures++;
  console.log(
    `${ok ? 'OK' : 'FAIL'} ${p}: nodes=${g.length} missing=${missing} dupIds=${dup} localBusiness=${lb} ctxLeak=${ctxLeak}`,
  );
}

// Google Ads Service detail (spec 07 §3 SPEC 1 mandatory attributes)
const ga = await get('/services/google-ads');
const gaGraph = JSON.parse(ga.body.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1])['@graph'];
const svc = gaGraph.find((n) => n['@type'] === 'Service');
const svcOk =
  svc &&
  svc.serviceType === 'Google Ads Management' &&
  svc.hasOfferCatalog?.itemListElement?.length === 2 &&
  svc.areaServed?.sameAs === 'https://www.wikidata.org/wiki/Q3950' &&
  svc.mainEntityOfPage?.['@id'] === 'https://alphadigitalagency.id/services/google-ads/#webpage';
if (!svcOk) failures++;
console.log(`\nGoogle Ads Service node: ${svcOk ? 'OK' : 'FAIL'} — ` + JSON.stringify({
  serviceType: svc?.serviceType,
  offers: svc?.hasOfferCatalog?.itemListElement?.map((o) => o.name),
  areaServed: svc?.areaServed?.sameAs,
  mainEntityOfPage: svc?.mainEntityOfPage,
}));

// LocalBusiness dedup detail on home
const home = await get('/');
const homeGraph = JSON.parse(home.body.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1])['@graph'];
const lbNode = homeGraph.find((n) => n['@id']?.endsWith('#localbusiness'));
const lbOk = lbNode?.address?.streetAddress === 'Jl Pulau Singkep GG Starindo A4' && lbNode?.geo?.latitude === -8.6705;
if (!lbOk) failures++;
console.log(`LocalBusiness merged (street+geo): ${lbOk ? 'OK' : 'FAIL'}`);

console.log('\n' + (failures === 0 ? '=== ALL CHECKS PASSED ===' : `=== ${failures} FAILURE(S) ===`));
process.exit(failures === 0 ? 0 : 1);
