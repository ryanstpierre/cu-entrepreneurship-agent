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
  // Round 2 — promoted from discovery-queue (open-ended widening)
  'https://startupcolorado.org/',
  'https://startupcolorado.org/funding-opportunities',
  'https://oedit.colorado.gov/business-funding-incentives',
  'https://www.cuanschutz.edu/cu-innovations',
  'https://boulderstartupweek.com/',
  'https://watson.is/',
  'https://innosphereventures.org/',
  'https://coloradostartups.org/',
  'https://nvc.startuptree.co/',
]

// Primary scope: any colorado.edu host. External hosts must be explicitly
// promoted here (from discovery-queue.json) to be crawled.
export const ALLOW_EXTERNAL = [
  'siliconflatirons.org',
  'www.siliconflatirons.org',
  // Round 2 promotions (ranked by citation count from round 1)
  'startupcolorado.org',
  'www.startupcolorado.org',
  'oedit.colorado.gov',
  'www.cuanschutz.edu',
  'boulderstartupweek.com',
  'www.boulderstartupweek.com',
  'watson.is',
  'www.watson.is',
  'innosphereventures.org',
  'www.innosphereventures.org',
  'coloradostartups.org',
  'www.coloradostartups.org',
  'nvc.startuptree.co',
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
  // discovery-queue noise (redirectors, calendars, doc shares, ticketing)
  'safelinks.protection.outlook.com', 'urldefense.com', 'sharepoint.com',
  'eventbrite.com', 'calendar.google.com', 'docs.google.com', 'x.com/intent',
  'meetup.com', 'luma.com', 'giving.cu.edu', 'events.blackthorn.io',
  'joinhandshake.com', 'addtocalendar', 'outlook.office.com',
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
