const skillsGrid = document.getElementById('skills-grid');
const skillsCount = document.getElementById('skills-count');
const topLevel = document.getElementById('top-level');

const SKILL_FILES = [
  '../skills/backend-developer.md',
  '../skills/data-engineer.md',
  '../skills/devops-engineer.md',
  '../skills/frontend-developer.md',
  '../skills/full-stack-developer.md',
  '../skills/nextjs-vercel.md',
  '../skills/qa-engineer.md',
  '../skills/security-engineer.md',
  '../skills/site-reliability-engineer.md',
  '../skills/software-architect.md',
];

function getFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : '';
}

function getLineValue(frontmatter, key) {
  const line = frontmatter
    .split('\n')
    .find((raw) => raw.trim().startsWith(`${key}:`));

  if (!line) return '';
  return line.split(':').slice(1).join(':').trim();
}

function getTags(frontmatter) {
  const lines = frontmatter.split('\n');
  const tags = [];
  let inTags = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('tags:')) {
      inTags = true;
      continue;
    }

    if (inTags && !trimmed.startsWith('-')) {
      break;
    }

    if (inTags && trimmed.startsWith('-')) {
      tags.push(trimmed.replace('- ', '').replace(/^\w+:\s*/, '').trim());
    }
  }

  return tags.filter(Boolean);
}

function slugFromPath(filePath) {
  const name = filePath.split('/').pop() || '';
  return name.replace('.md', '');
}

function createCard(skill) {
  const card = document.createElement('article');
  card.className = 'skill-card';

  const tags = skill.tags
    .slice(0, 6)
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join('');

  card.innerHTML = `
    <div class="skill-head">
      <h3>${skill.name}</h3>
      <span class="skill-version">v${skill.version}</span>
    </div>
    <p>${skill.description}</p>
    <div class="tags">${tags}</div>
  `;

  return card;
}

async function loadSkill(filePath) {
  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(`Impossible de lire ${filePath}`);
  }

  const markdown = await response.text();
  const frontmatter = getFrontmatter(markdown);
  const tags = getTags(frontmatter);

  return {
    slug: slugFromPath(filePath),
    name: getLineValue(frontmatter, 'name') || slugFromPath(filePath),
    version: getLineValue(frontmatter, 'version') || '1.0.0',
    description: getLineValue(frontmatter, 'description') || 'No description available.',
    tags,
    level: tags.find((tag) => ['expert', 'advanced', 'intermediate', 'beginner'].includes(tag.toLowerCase())) || '',
  };
}

function computeTopLevel(skills) {
  const map = new Map();

  for (const skill of skills) {
    const level = (skill.level || 'N/A').toLowerCase();
    map.set(level, (map.get(level) || 0) + 1);
  }

  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return 'N/A';

  const [level] = sorted[0];
  return level === 'n/a' ? 'N/A' : level.charAt(0).toUpperCase() + level.slice(1);
}

async function bootstrap() {
  try {
    const skills = await Promise.all(SKILL_FILES.map(loadSkill));
    skills.sort((a, b) => a.name.localeCompare(b.name));

    skillsGrid.innerHTML = '';
    skills.forEach((skill) => skillsGrid.appendChild(createCard(skill)));

    skillsCount.textContent = String(skills.length);
    topLevel.textContent = computeTopLevel(skills);
  } catch (error) {
    console.error(error);
    skillsGrid.innerHTML = '<article class="skill-card error">Erreur de chargement des skills. Lancez un serveur local depuis le dossier PFA.</article>';
    skillsCount.textContent = '--';
    topLevel.textContent = '--';
  }
}

bootstrap();
