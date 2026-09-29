import orgatimePreview from '../assets/projects/orgatime.png';
import vaultIcon from '../assets/projects/kirsh-vault.png';
import type {
  ContactLink,
  Project,
  SiteProfile,
  UsesGroup,
} from '../types/site';

export const profile: SiteProfile = {
  name: 'Viktor Nemets',
  handle: 'Kirshway',
  title: 'Frontend & Full-stack developer',
  intro:
    'I build interfaces and web apps. This is my little corner of the internet — projects, tools, and a few moments along the way.',
  currentFocus:
    'Going deeper into backend development and improving how I build, deploy, and maintain my projects.',
  contacts: [
    { label: 'Telegram', href: 'https://t.me/kirshway', icon: 'telegram' },
    {
      label: 'Email',
      href: 'mailto:nemecvictor.kirsh@gmail.com',
      icon: 'email',
    },
  ],
  nav: [
    { label: 'Projects', href: '#projects' },
    { label: 'Uses', href: '#uses' },
    { label: 'CV', href: '#cv' },
    { label: 'Contact', href: '#contact' },
  ],
};

export const projects: Project[] = [
  {
    name: 'OrgaTime',
    description:
      'A full-stack weekly planner I built and deployed. A little more space for everything you want to do.',
    href: 'https://github.com/KirshWay/orgatime',
    website: 'https://orgatime.kirshway.ru/about',
    tags: ['typescript', 'react', 'nest.js', 'postgresql'],
    preview: {
      kind: 'screenshot',
      src: orgatimePreview,
      alt: 'OrgaTime weekly planner with daily tasks and a Someday list',
    },
  },
  {
    name: 'Kirsh Vault',
    description:
      'A personal library for books, films, and other collections. Works offline.',
    href: 'https://github.com/KirshWay/kirsh_vault',
    tags: ['next.js', 'pwa', 'tailwind'],
    preview: { kind: 'icon', src: vaultIcon, alt: '' },
  },
];

export const usesGroups: UsesGroup[] = [
  {
    label: 'Building',
    items: [
      { label: 'TypeScript', icon: 'typescript' },
      { label: 'React / Next.js', icon: 'react' },
      { label: 'Node.js / NestJS', icon: 'node' },
      { label: 'Vue / Nuxt', icon: 'vue' },
      { label: 'Python / FastAPI', icon: 'python' },
    ],
  },
  {
    label: 'Working with AI',
    items: [
      { label: 'Codex', icon: 'codex' },
      { label: 'OpenCode', icon: 'opencode' },
      { label: 'Claude Code', icon: 'claude-code' },
      { label: 'Custom agent skills', icon: 'ai-agent' },
      { label: 'MCP integrations', icon: 'mcp' },
    ],
  },
];

export const socials: ContactLink[] = [
  {
    label: 'GitHub',
    description: 'Code & more projects',
    href: 'https://github.com/KirshWay',
    icon: 'github',
  },
  {
    label: 'LinkedIn',
    description: 'Work & experience',
    href: 'https://linkedin.com/in/viktor-nemets',
    icon: 'linkedin',
  },
];
export const resume = {
  role: 'Senior Frontend Engineer',
  company: 'Intelsy',
  href: `${import.meta.env.BASE_URL}files/Viktor_Nemets_Senior_Software_Engineer_CV.pdf`,
};
