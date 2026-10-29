
function lineCommentEnd(text, start) {
  let end = text.indexOf('\n', start);
  if (end === -1) end = text.length;
  if (end > start && text[end - 1] === '\r') end -= 1;
  return end;
}

export function yamlComments(text) {
  const comments = [];
  const total = text.length;
  let lineStart = 0;
  let blockIndent = -1;

  while (lineStart <= total) {
    let lineEnd = text.indexOf('\n', lineStart);
    if (lineEnd === -1) lineEnd = total;

    let contentEnd = lineEnd;
    if (contentEnd > lineStart && text[contentEnd - 1] === '\r') contentEnd -= 1;

    const line = text.slice(lineStart, contentEnd);
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();

    if (blockIndent >= 0) {
      if (trimmed === '' || indent > blockIndent) {
        lineStart = lineEnd + 1;
        continue;
      }
      blockIndent = -1;
    }

    let i = 0;
    let quote = null;
    let commentAt = -1;

    while (i < line.length) {
      const ch = line[i];

      if (quote) {
        if (quote === '"' && ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === quote) {
          if (quote === "'" && line[i + 1] === "'") {
            i += 2;
            continue;
          }
          quote = null;
        }
        i += 1;
        continue;
      }

      if (ch === '"' || ch === "'") {
        quote = ch;
        i += 1;
        continue;
      }

      if (ch === '#' && (i === 0 || line[i - 1] === ' ' || line[i - 1] === '\t')) {
        commentAt = i;
        break;
      }

      i += 1;
    }

    if (commentAt >= 0) {
      comments.push({ start: lineStart + commentAt, end: contentEnd, kind: 'line' });
    }

    if (/[|>][+-]?\d*\s*$/.test(trimmed) && /(:|-)\s*[|>]/.test(trimmed)) {
      blockIndent = indent;
    }

    lineStart = lineEnd + 1;
  }

  return comments;
}

export function hashComments(text, options = {}) {
  const commentChar = options.commentChar || '#';
  const anywhere = options.anywhere === true;
  const tripleQuotes = options.tripleQuotes === true;
  const lineStartChar = options.lineStartChar || null;

  const comments = [];
  const total = text.length;
  let i = 0;
  let quote = null;
  let triple = null;

  while (i < total) {
    if (triple) {
      if (text.startsWith(triple, i)) {
        triple = null;
        i += 3;
        continue;
      }
      i += 1;
      continue;
    }

    if (quote) {
      if (quote === '"' && text[i] === '\\') {
        i += 2;
        continue;
      }
      if (text[i] === quote) quote = null;
      i += 1;
      continue;
    }

    if (tripleQuotes && (text.startsWith('"""', i) || text.startsWith("'''", i))) {
      triple = text.slice(i, i + 3);
      i += 3;
      continue;
    }

    const ch = text[i];

    if (ch === '"' || ch === "'") {
      quote = ch;
      i += 1;
      continue;
    }

    const prev = i === 0 ? '\n' : text[i - 1];
    const atLineStart = prev === '\n';
    const afterSpace = prev === ' ' || prev === '\t';

    if (ch === commentChar && (anywhere || atLineStart || afterSpace)) {
      comments.push({ start: i, end: lineCommentEnd(text, i), kind: 'line' });
      const newline = text.indexOf('\n', i);
      if (newline === -1) break;
      i = newline;
      continue;
    }

    if (lineStartChar && ch === lineStartChar && atLineStart) {
      comments.push({ start: i, end: lineCommentEnd(text, i), kind: 'line' });
      const newline = text.indexOf('\n', i);
      if (newline === -1) break;
      i = newline;
      continue;
    }

    i += 1;
  }

  return comments;
}

export function cStyleComments(text, options = {}) {
  const hash = options.hash === true;
  const rawStrings = options.rawStrings === true;

  const comments = [];
  const total = text.length;
  let i = 0;
  let quote = null;

  while (i < total) {
    const ch = text[i];

    if (quote) {
      if (quote === '`') {
        if (ch === '`') quote = null;
        i += 1;
        continue;
      }
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }

    if (ch === '/' && text[i + 1] === '/') {
      comments.push({ start: i, end: lineCommentEnd(text, i), kind: 'line' });
      const newline = text.indexOf('\n', i);
      if (newline === -1) break;
      i = newline;
      continue;
    }

    if (ch === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2);
      const end = close === -1 ? total : close + 2;
      comments.push({ start: i, end, kind: 'block' });
      i = end;
      continue;
    }

    if (hash && ch === '#') {
      comments.push({ start: i, end: lineCommentEnd(text, i), kind: 'line' });
      const newline = text.indexOf('\n', i);
      if (newline === -1) break;
      i = newline;
      continue;
    }

    if (ch === '"' || ch === "'" || (rawStrings && ch === '`')) {
      quote = ch;
      i += 1;
      continue;
    }

    i += 1;
  }

  return comments;
}

export function sqlComments(text) {
  const comments = [];
  const total = text.length;
  let i = 0;
  let quote = null;

  while (i < total) {
    const ch = text[i];

    if (quote) {
      if (ch === quote) {
        if (text[i + 1] === quote) {
          i += 2;
          continue;
        }
        quote = null;
      }
      i += 1;
      continue;
    }

    if (ch === '-' && text[i + 1] === '-') {
      comments.push({ start: i, end: lineCommentEnd(text, i), kind: 'line' });
      const newline = text.indexOf('\n', i);
      if (newline === -1) break;
      i = newline;
      continue;
    }

    if (ch === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2);
      const end = close === -1 ? total : close + 2;
      comments.push({ start: i, end, kind: 'block' });
      i = end;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      i += 1;
      continue;
    }

    i += 1;
  }

  return comments;
}
