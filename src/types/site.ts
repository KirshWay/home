import type { ImageMetadata } from 'astro';

export type ContactLink = {
  label: string;
  description?: string;
  href: string;
  icon?: 'email' | 'github' | 'telegram' | 'linkedin';
};

export type SiteProfile = {
  name: string;
  handle: string;
  title: string;
  intro: string;
  currentFocus: string;
  contacts: ContactLink[];
  nav: ContactLink[];
};

export type Project = {
  website?: string;
  name: string;
  description: string;
  href: string;
  tags: string[];
  preview: {
    kind: 'screenshot' | 'icon';
    src: ImageMetadata;
    alt: string;
  };
};

export type UsesGroup = {
  label: string;
  items: UsesItem[];
};

export type UsesItem = {
  label: string;
  icon?:
    | 'typescript'
    | 'react'
    | 'node'
    | 'vue'
    | 'python'
    | 'codex'
    | 'opencode'
    | 'claude-code'
    | 'ai-agent'
    | 'mcp';
};
