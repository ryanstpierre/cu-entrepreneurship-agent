// Seed set + scope rules for the CU entrepreneurship crawl.

export const SEEDS = [
  'https://www.colorado.edu/innovate/',
  'https://www.colorado.edu/innovate/on-campus-resources',
  'https://www.colorado.edu/nvc/',
  'https://www.colorado.edu/venturepartners/',
  'https://www.colorado.edu/business/deming',
  'https://www.colorado.edu/atlas/',
  'https://www.colorado.edu/ideaforge/',
  'https://www.colorado.edu/researchinnovation/',
  'https://www.colorado.edu/law/academics/clinics/entrepreneurial-law-clinic',
  'https://www.colorado.edu/center/ctr/',
  'https://www.colorado.edu/engineering/entrepreneurship',
  'https://siliconflatirons.org/',
]

// Primary scope: any colorado.edu host. External hosts must be explicitly
// promoted here (from discovery-queue.json) to be crawled.
export const ALLOW_EXTERNAL = [
  'siliconflatirons.org',
  'www.siliconflatirons.org',
]

// URL relevance keywords — drive frontier priority and resource detection.
export const RELEVANCE_TERMS = [
  'entrepreneur', 'venture', 'startup', 'start-up', 'innovat', 'incubat',
  'acceler', 'commercializ', 'pitch', 'founder', 'funding', 'grant', 'seed',
  'prototype', 'makerspace', 'ideaforge', 'idea-forge', 'nvc', 'deming',
  'catalyze', 'embark', 'ascent', 'mentor', 'patent', 'license', 'licensing',
  'ip-', 'intellectual-property', 'tech-transfer', 'techtransfer', 'spinout',
  'spin-off', 'lab-venture', 'business-plan', 'competition', 'demo-day',
  'hackathon', 'small-business', 'sbir', 'sttr',
]

// Never crawl these path fragments (login, calendars-by-day, media dumps…).
export const URL_BLOCKLIST = [
  '/user/login', '/cas', 'login.', '/search?', '/search/', 'format=ical',
  'share=', 'mailto:', 'javascript:', '.jpg', '.jpeg', '.png', '.gif', '.svg',
  '.mp4', '.mp3', '.zip', '.pptx', '.docx', '.xlsx', '/feed', '/rss',
  'twitter.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'youtube.com',
  '/events/20', 'page=', '/print/', '/node/', '/taxonomy/',
]

export const LIMITS = {
  maxPagesPerBatch: 250,       // fetches per crawler invocation
  maxPagesPerHost: 1200,
  maxDepth: 8,
  concurrency: 5,
  politeDelayMs: 250,          // per-worker delay between requests
  fetchTimeoutMs: 15000,
  maxSitemapUrls: 400,         // relevance-filtered sitemap ingestion cap
}
