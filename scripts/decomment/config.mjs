import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';

export const CONFIG_FILE = 'decomment.config.json';

export const DEFAULT_KEEP = [
  '@license',
  '@preserve',
  '@copyright',
  '@cc_on',
  'eslint-',
  '@ts-',
  '@vue-',
  '@vitest-',
  '@jest-',
  '@jsx',
  'webpackChunkName',
  'webpackIgnore',
  'vite-ignore',
  'sourceMappingURL',
  'sourceURL',
  'prettier-ignore',
  'prettier-',
  'istanbul ignore',
  'c8 ignore',
  'v8 ignore',
  'nyc ignore',
  'type: ignore',
  'noqa',
  'pylint:',
  'fmt:',
  'coding:',
  '-*-',
  '@decomment-',
];

export const LANGUAGE_BY_EXTENSION = {
  '.js': 'js',
  '.mjs': 'js',
  '.cjs': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.mts': 'ts',
  '.cts': 'ts',
  '.tsx': 'tsx',
  '.vue': 'vue',

  '.css': 'css',
  '.wxss': 'css',
  '.scss': 'scss',
  '.sass': 'scss',
  '.less': 'less',
  '.styl': 'stylus',

  '.html': 'html',
  '.htm': 'html',
  '.xhtml': 'html',
  '.xml': 'xml',
  '.svg': 'xml',
  '.wxml': 'xml',

  '.json': 'json',
  '.jsonc': 'json',
  '.json5': 'json',
  '.webmanifest': 'json',

  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.toml': 'toml',
  '.ini': 'ini',
  '.cfg': 'ini',
  '.conf': 'ini',
  '.properties': 'ini',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.py': 'python',
  '.sql': 'sql',
  '.go': 'go',
  '.java': 'c',
  '.kt': 'c',
  '.kts': 'c',
  '.swift': 'c',
  '.c': 'c',
  '.h': 'c',
  '.cc': 'c',
  '.cpp': 'c',
  '.hpp': 'c',
  '.cs': 'c',
  '.rs': 'c',
  '.dart': 'c',
  '.scala': 'c',
  '.php': 'php',
  '.gradle': 'c',
};

export const IGNORED_BASENAMES = new Set([
  'package-lock.json',
  'npm-shrinkwrap.json',
  'pnpm-lock.yaml',
  'yarn.lock',
]);

export const IGNORED_DIRECTORIES = ['node_modules', 'dist', 'build', 'coverage', 'me-test', '.git'];

export const DEFAULT_CONFIG = {
  enabled: true,
  keep: DEFAULT_KEEP,
  maxFileSize: 1024 * 1024,
  extensions: {},
};

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function findConfigFile(start) {
  let dir = start;

  for (let depth = 0; depth < 12; depth += 1) {
    const file = join(dir, CONFIG_FILE);
    if (existsSync(file)) return file;
    if (existsSync(join(dir, '.git'))) return null;

    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }

  return null;
}

export function loadConfig(cwd = process.cwd()) {
  const file = findConfigFile(cwd);
  if (!file) return { ...DEFAULT_CONFIG, source: null };

  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    const merged = { ...DEFAULT_CONFIG, ...parsed };
    if (!Array.isArray(merged.keep)) merged.keep = DEFAULT_KEEP;
    if (!isPlainObject(merged.extensions)) merged.extensions = {};
    merged.source = file;
    return merged;
  } catch (error) {
    return { ...DEFAULT_CONFIG, source: null, configError: error.message };
  }
}

export function isIgnoredPath(filePath) {
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, '/');
  const segments = normalized.split('/');
  return segments.some((segment) => IGNORED_DIRECTORIES.includes(segment));
}

export function detectLanguage(filePath, config = DEFAULT_CONFIG) {
  if (!filePath) return null;
  if (isIgnoredPath(filePath)) return null;

  const base = basename(filePath).toLowerCase();
  if (IGNORED_BASENAMES.has(base)) return null;

  const ext = extname(base);
  if (!ext) return null;
  if (config.extensions && typeof config.extensions[ext] === 'string') {
    return config.extensions[ext];
  }
  return LANGUAGE_BY_EXTENSION[ext] || null;
}

export function mayContainComments(language, text) {
  switch (language) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'json':
    case 'css':
    case 'c':
      return text.includes('/');
    case 'scss':
    case 'less':
    case 'stylus':
    case 'vue':
      return text.includes('/') || text.includes('<!--');
    case 'html':
    case 'xml':
      return text.includes('<!--');
    case 'yaml':
    case 'toml':
    case 'ini':
    case 'shell':
    case 'python':
      return text.includes('#') || text.includes(';');
    case 'sql':
      return text.includes('--') || text.includes('/*');
    default:
      return true;
  }
}
