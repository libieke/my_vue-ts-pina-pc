
const OPENERS = /^(\/\*+|\/\/+|<!--|<!\[CDATA\[|#+|--+|;+|\(\*)/;
const CLOSERS = /(\*+\/|-->|\]\]>|#+|--+|;+|\*\))$/;

export function commentBody(raw) {
  let body = String(raw).trim();
  body = body.replace(OPENERS, '');
  body = body.replace(CLOSERS, '');
  return body.trim();
}

export function shouldKeepComment(raw, config) {
  const text = String(raw);

  if (/^(\/\*+|\/\/+|<!--|#+|;|--)\s*!/.test(text)) return true;

  if (/^\s*<!--\s*\[(if|endif)/i.test(text)) return true;

  const body = commentBody(text);
  if (!body) return false;

  const normalized = body.toLowerCase();
  const keep = Array.isArray(config?.keep) ? config.keep : [];

  return keep.some((prefix) => {
    const needle = String(prefix).toLowerCase();
    return needle.length > 0 && normalized.startsWith(needle);
  });
}
