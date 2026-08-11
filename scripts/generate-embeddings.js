#!/usr/bin/env node
/**
 * Pre-generate embeddings for the corpus at build time.
 * Corpus = 10 curated flagship programs + quality-filtered resources from the
 * deep crawl (public/data/crawl/resources.json): specificity >= 4, not news,
 * not bare references. Deduped by normalized name (curated entries win).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const curated = [
  {
    id: 'nvc',
    name: 'New Venture Challenge',
    description: 'Annual student entrepreneurship competition with $325K+ in prizes. Open to all CU students with early-stage startup ideas.',
    category: 'Funding & Prizes',
    sectors: ['AI', 'Biotech', 'Hardware', 'Climate', 'FinTech'],
    stage: ['Idea', 'Validation', 'Prototype'],
    website: 'https://www.colorado.edu/nvc/'
  },
  {
    id: 'deming',
    name: 'Deming Center for Entrepreneurship',
    description: 'One-stop resource hub for student entrepreneurs. Offers mentorship, workshops, and business plan feedback.',
    category: 'Entrepreneurship Hub',
    sectors: ['All'],
    stage: ['Idea', 'Validation', 'Prototype', 'Launching'],
    website: 'https://www.colorado.edu/business/deming'
  },
  {
    id: 'catalyze',
    name: 'Catalyze CU',
    description: 'Intensive 10-week summer accelerator program. Provides mentorship, curriculum, and seed funding ($15K-$50K) for teams.',
    category: 'Accelerator',
    sectors: ['AI', 'Climate', 'Hardware'],
    stage: ['Validation', 'Prototype', 'Launching']
  },
  {
    id: 'forge',
    name: 'Idea Forge',
    description: 'Maker space and prototyping lab. Access to 3D printers, laser cutters, electronics, and wood shop equipment.',
    category: 'Space & Resources',
    sectors: ['Hardware', 'Climate'],
    stage: ['Idea', 'Prototype'],
    website: 'https://www.colorado.edu/ideaforge/'
  },
  {
    id: 'atlas',
    name: 'ATLAS Institute',
    description: 'Design-centric innovation hub. Cross-disciplinary environment for tech + design projects. Offers courses and partnerships.',
    category: 'Design & Innovation',
    sectors: ['AI', 'Hardware', 'EdTech'],
    stage: ['Prototype', 'Launching'],
    website: 'https://www.colorado.edu/atlas/'
  },
  {
    id: 'vp',
    name: 'Venture Partners at CU',
    description: 'The commercialization arm of CU Boulder translating research discoveries into startups. Licensing, IP, and venture support.',
    category: 'IP & Commercialization',
    sectors: ['AI', 'Biotech', 'FinTech'],
    stage: ['Validation', 'Launching', 'Scaling'],
    website: 'https://www.colorado.edu/venturepartners/'
  },
  {
    id: 'tbdc',
    name: 'Technology Business Development Center',
    description: 'Connects CU innovations with industry. Supports licensing, commercialization, and IP development.',
    category: 'IP & Commercialization',
    sectors: ['Biotech', 'Hardware', 'AI'],
    stage: ['Prototype', 'Launching']
  },
  {
    id: 'business-plan',
    name: 'Business Plan Competition',
    description: 'Biannual competition for detailed business plans. Cash prizes, investor pitch opportunities, and media exposure.',
    category: 'Funding & Prizes',
    sectors: ['All'],
    stage: ['Validation', 'Prototype']
  },
  {
    id: 'cisab',
    name: 'CU Silicon Valley',
    description: 'Residential program in Silicon Valley. Immersive experience connecting CU entrepreneurs with SV investors and mentors.',
    category: 'Immersion Program',
    sectors: ['AI', 'FinTech'],
    stage: ['Prototype', 'Launching']
  },
  {
    id: 'grad-accelerator',
    name: 'Graduate Student Accelerator',
    description: 'Tailored program for graduate researchers and grad student founders. Emphasizes research commercialization.',
    category: 'Accelerator',
    sectors: ['Biotech', 'Hardware'],
    stage: ['Idea', 'Validation', 'Prototype']
  }
];

const TYPE_TO_CATEGORY = {
  funding: 'Funding & Prizes',
  competition: 'Funding & Prizes',
  program: 'Accelerator',
  center: 'Entrepreneurship Hub',
  course: 'Entrepreneurial Training',
  event: 'Events & Workshops',
  space: 'Space & Resources',
  community: 'Community & Networking',
  service: 'Mentorship & Advising'
};

const STAGE_MAP = { explore: 'Idea', validate: 'Validation', build: 'Prototype', launch: 'Launching' };

function loadCrawledCorpus() {
  const crawlPath = path.join(__dirname, '../public/data/crawl/resources.json');
  if (!fs.existsSync(crawlPath)) {
    console.log('ℹ No crawl data found; using curated corpus only');
    return [];
  }
  const resources = JSON.parse(fs.readFileSync(crawlPath, 'utf8'));
  const news = /\/(20\d\d)(\/|$)|\/newsletter|\/news\//;
  const curatedNames = new Set(curated.map(c => c.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()));

  return resources
    .filter(r => !news.test(r.url) && r.specificity >= 4 && r.type !== 'reference')
    .filter(r => {
      const norm = r.title.toLowerCase().replace(/\s*\|.*$/, '').replace(/[^a-z0-9]+/g, ' ').trim();
      return !curatedNames.has(norm);
    })
    .map(r => ({
      id: r.id,
      name: r.title.replace(/\s*\|.*$/, '').trim(),
      description: r.description || '',
      category: TYPE_TO_CATEGORY[r.type] || 'Other',
      sectors: r.sectors?.length ? r.sectors : ['All'],
      stage: r.stage?.length ? [...new Set(r.stage.map(s => STAGE_MAP[s] || s))] : ['Idea', 'Validation', 'Prototype', 'Launching'],
      website: r.url,
      contact: r.contacts?.[0] || '',
      extra: [
        r.funding?.length ? `Funding: ${r.funding.slice(0, 3).join(', ')}.` : '',
        r.deadlines?.length ? `${r.deadlines[0]}.` : '',
        r.audience?.length ? `For: ${r.audience.join(', ')}.` : '',
        `Org: ${r.org}.`
      ].filter(Boolean).join(' ')
    }));
}

try {
  const crawled = loadCrawledCorpus();
  const corpus = [...curated, ...crawled];
  console.log(`⏳ Corpus: ${curated.length} curated + ${crawled.length} crawled = ${corpus.length} documents`);

  console.log('⏳ Loading embeddings model...');
  const { pipeline } = await import('@xenova/transformers');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('✓ Model loaded');

  const documents = [];
  let done = 0;

  for (const program of corpus) {
    const text = `${program.name}. ${program.description}${program.sectors ? ` Sectors: ${program.sectors.join(', ')}.` : ''}${program.stage ? ` Stages: ${program.stage.join(', ')}.` : ''}${program.extra ? ` ${program.extra}` : ''}`;

    try {
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      // round to 5dp: ~40% smaller bundle, negligible cosine-similarity impact
      const embedding = Array.from(output.data).map(v => Math.round(v * 1e5) / 1e5);

      documents.push({
        id: program.id,
        text,
        embedding,
        type: 'program',
        metadata: {
          name: program.name,
          category: program.category || 'Other',
          sectors: program.sectors?.join(',') || 'All',
          stage: program.stage?.join(',') || 'All',
          description: program.description,
          website: program.website || '',
          contact: program.contact || ''
        }
      });

      if (++done % 100 === 0) console.log(`  … ${done}/${corpus.length}`);
    } catch (err) {
      console.warn(`⚠ Failed embedding for ${program.name}:`, err.message);
    }
  }

  const outputPath = path.join(__dirname, '../src/data/corpus-embeddings.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(documents));
  const mb = (fs.statSync(outputPath).size / 1e6).toFixed(1);
  console.log(`\n✓ ${documents.length} embeddings saved to ${outputPath} (${mb}MB)`);
} catch (error) {
  console.error('❌ Error generating embeddings:', error);
  process.exit(1);
}
