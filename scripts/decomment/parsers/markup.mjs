import { jsComments } from './js.mjs';

function skipString(text, index) {
  const quote = text[index];
  let i = index + 1;
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2;
      continue;
    }
    if (text[i] === quote) return i + 1;
    i += 1;
  }
  return text.length;
}

function isUrlAt(text, i) {
  const a = text[i];
  const b = text[i + 1];
  const c = text[i + 2];
  return (
    (a === 'u' || a === 'U') &&
    (b === 'r' || b === 'R') &&
    (c === 'l' || c === 'L') &&
    text[i + 3] === '('
  );
}

function skipUrl(text, index) {
  let i = index;
  while (i < text.length) {
    const ch = text[i];
    if (ch === ')') return i + 1;
    if (ch === '"' || ch === "'") {
      i = skipString(text, i);
      continue;
    }
    i += 1;
  }
  return text.length;
}

export function cssComments(text, options = {}) {
  const lineComments = options.lineComments === true;
  const comments = [];
  let i = 0;
  const total = text.length;

  while (i < total) {
    const ch = text[i];

    if (ch === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2);
      const end = close === -1 ? total : close + 2;
      comments.push({ start: i, end, kind: 'block' });
      i = end;
      continue;
    }

    if (lineComments && ch === '/' && text[i + 1] === '/') {
      const close = text.indexOf('\n', i + 2);
      let end = close === -1 ? total : close;
      if (end > i && text[end - 1] === '\r') end -= 1;
      comments.push({ start: i, end, kind: 'line' });
      i = close === -1 ? total : close;
      continue;
    }

    if (ch === '"' || ch === "'") {
      i = skipString(text, i);
      continue;
    }

    if (isUrlAt(text, i)) {
      i = skipUrl(text, i + 4);
      continue;
    }

    i += 1;
  }

  return comments;
}

function tagNameAt(text, index) {
  let i = index + 1;
  if (text[i] === '/') i += 1;
  let name = '';
  while (i < text.length && /[a-zA-Z0-9:-]/.test(text[i])) {
    name += text[i];
    i += 1;
  }
  return { name: name.toLowerCase(), end: i };
}

function skipTag(text, index) {
  let i = index + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      i = skipString(text, i);
      continue;
    }
    if (ch === '>') return i + 1;
    i += 1;
  }
  return text.length;
}

function consumeEmbeddedBlock(text, index, comments) {
  const { name } = tagNameAt(text, index);
  if (name !== 'script' && name !== 'style') return -1;

  const openEnd = skipTag(text, index);
  const openTag = text.slice(index, openEnd);
  if (/\/>\s*$/.test(openTag)) return openEnd;

  const closeIndex = text.toLowerCase().indexOf(`</${name}`, openEnd);
  if (closeIndex === -1) return -1;

  const contentStart = openEnd;
  const content = text.slice(contentStart, closeIndex);
  const closeEnd = text.indexOf('>', closeIndex);
  const next = closeEnd === -1 ? text.length : closeEnd + 1;

  if (content.trim()) {
    if (name === 'script') {
      const langMatch = /lang\s*=\s*["']?([\w-]+)/i.exec(openTag);
      const lang = langMatch ? langMatch[1].toLowerCase() : 'js';
      const result = jsComments(content, lang);
      for (const comment of result.comments) {
        comments.push({ start: comment.start + contentStart, end: comment.end + contentStart, kind: comment.kind });
      }
    } else {
      const scss = /lang\s*=\s*["']?(scss|less|sass|styl)/i.test(openTag);
      for (const comment of cssComments(content, { lineComments: scss })) {
        comments.push({ start: comment.start + contentStart, end: comment.end + contentStart, kind: comment.kind });
      }
    }
  }

  return next;
}

export function htmlComments(text, options = {}) {
  const blocks = options.blocks !== false;
  const interpolations = options.interpolations === true;

  const comments = [];
  let i = 0;
  const total = text.length;

  while (i < total) {
    if (interpolations && text[i] === '{' && text[i + 1] === '{') {
      const close = text.indexOf('}}', i + 2);
      i = close === -1 ? total : close + 2;
      continue;
    }

    if (text[i] === '<') {
      if (text.startsWith('<!--', i)) {
        const close = text.indexOf('-->', i + 4);
        const end = close === -1 ? total : close + 3;
        comments.push({ start: i, end, kind: 'html' });
        i = end;
        continue;
      }

      if (blocks) {
        const handled = consumeEmbeddedBlock(text, i, comments);
        if (handled !== -1) {
          i = handled;
          continue;
        }
      }

      const next = text[i + 1];
      if (next && (/[a-zA-Z]/.test(next) || next === '/' || next === '!' || next === '?')) {
        i = skipTag(text, i);
        continue;
      }
    }

    i += 1;
  }

  return comments;
}
