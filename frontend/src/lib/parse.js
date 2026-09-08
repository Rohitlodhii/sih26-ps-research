// Parses the SIH problem-statement markdown files into structured objects.

const TECH_RULES = [
  { tag: 'AI/ML', re: /\b(ai\/ml|machine learning|deep learning|neural|predictive analytics|classification model|anomaly detection|computer vision)\b/i },
  { tag: 'Computer Vision', re: /\b(computer vision|image processing|object detection|segmentation|ocr|thermal imaging|lidar|point cloud|camera)\b/i },
  { tag: 'NLP / LLM', re: /\b(nlp|natural language|llm|chatbot|conversational|rag\b|translation|voice|speech|asr\b|multilingual)\b/i },
  { tag: 'Blockchain', re: /\b(blockchain|distributed ledger|smart contract)\b/i },
  { tag: 'GIS / Geo', re: /\b(gis|geospatial|geo-tagged|geotag|satellite|remote sensing|mapping|dem\b|gnss|gps\b|dgps)\b/i },
  { tag: 'IoT / Sensors', re: /\b(iot|sensors?\b|esp32|arduino|raspberry|wireless mesh|lora|telemetry)\b/i },
  { tag: 'Robotics / Drones', re: /\b(robot|rover|quadruped|drone|uav|autonomous vehicle|auv\b)\b/i },
  { tag: 'Data Engineering', re: /\b(big data|scraping|etl|data pipeline|netcdf|dashboards?\b|analytics platform|time-series|forecasting)\b/i },
  { tag: 'Full-Stack / Portal', re: /\b(portal|platform.*(manag|workflow)|lms\b|erp\b|marketplace|booking|dashboard|web-based platform|management system)\b/i },
  { tag: 'Mobile App', re: /\b(mobile app|android|apk\b|ios\b|mobile application|kiosk)\b/i },
  { tag: 'AR/VR', re: /\b(\bar\b|augmented reality|virtual reality)\b/i },
  { tag: 'Simulation / Digital Twin', re: /\b(simulation|digital twin|simulink|ansys|modeling and simulation)\b/i },
  { tag: 'Mechanical / Embedded HW', re: /\b(actuation|firmware|plc\b|pcb|mechatronic|cad\b|solar-powered|motor|thermal management)\b/i },
  { tag: 'Security / Defence', re: /\b(defence|defense|military|radar\b|electronic warfare|explosives|artillery|anti-drone)\b/i },
];

export function parseMarkdown(raw) {
  const lines = raw.split('\n').map((l) => l.trim());

  const title = (lines[0] || '').replace(/^#\s+/, '');

  const org = /^-\s+\*\*Organization:\*\*(.+)$/m.exec(raw)?.[1]?.trim();
  const catTheme = /^-\s+\*\*Category:\*\*(.+)$/m.exec(raw)?.[1]?.trim(); // "Software | **Theme:** X"
  const category = catTheme?.split('|')[0]?.trim();
  const theme = /\*\*Theme:\*\*(.+)$/.exec(catTheme)?.[1]?.trim();
  const difficulty = parseFloat(/\*\*Difficulty Score:\*\*\s*([\d.]+)/.exec(raw)?.[1] ?? '0');

  // Sections: "## What the PS is about", "## What to build", "## Key challenges", "## Why this difficulty"
  const sections = {};
  let current = null;
  for (const line of raw.split('\n')) {
    const h = /^##\s+(.+)/.exec(line);
    if (h) { current = h[1].trim(); sections[current] = []; continue; }
    if (current) sections[current].push(line);
  }
  const sec = (name) =>
    (sections[name] || []).join('\n').trim();

  const psId = /^SIH(\d+)/.exec(title)?.[1] || '';
  const bodyText = raw.toLowerCase();
  const tech = TECH_RULES.filter((r) => r.re.test(bodyText)).map((r) => r.tag);

  return {
    id: psId,
    file: title,
    title: title.replace(/^SIH\d+\s*—\s*/, ''),
    org: org || 'Unknown',
    category: category || 'Unknown',
    theme: theme || 'General',
    difficulty,
    about: sec('What the PS is about'),
    build: sec('What to build'),
    challenges: sec('Key challenges'),
    why: sec('Why this difficulty'),
    tech,
    raw,
  };
}

const files = import.meta.glob('../ps/*.md', { query: '?raw', import: 'default', eager: true });

export const problemStatements = Object.entries(files)
  .map(([, raw]) => parseMarkdown(raw))
  .sort((a, b) => a.id.localeCompare(b.id));

export const allTechTags = [...new Set(problemStatements.flatMap((p) => p.tech))].sort();
export const allThemes = [...new Set(problemStatements.map((p) => p.theme))].sort();
