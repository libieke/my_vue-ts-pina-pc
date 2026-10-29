
const SPACE = /[\s\uFEFF]/;

function renderLine(code, start, end, removed) {
  let out = '';

  for (let i = start; i < end; i += 1) {
    if (!removed[i]) {
      out += code[i];
      continue;
    }

    let next = i;
    while (next < end && removed[next]) next += 1;

    const prevChar = out.length > 0 ? out[out.length - 1] : '';

    while (next < end && SPACE.test(code[next])) next += 1;

    const nextChar = next < end ? code[next] : '';

    if (prevChar && nextChar && !SPACE.test(prevChar) && !SPACE.test(nextChar)) {
      out += ' ';
    }

    i = next - 1;
  }

  return out.replace(/[ \t]+$/, '');
}

export function stripRanges(code, ranges) {
  if (!Array.isArray(ranges) || ranges.length === 0) return code;

  const total = code.length;
  const removed = new Uint8Array(total);

  for (const range of ranges) {
    const start = Math.max(0, Math.min(total, Number(range.start) || 0));
    const end = Math.max(0, Math.min(total, Number(range.end) || 0));
    for (let i = start; i < end; i += 1) removed[i] = 1;
  }

  const eol = code.includes('\r\n') ? '\r\n' : '\n';
  const lines = [];
  let cursor = 0;

  while (cursor <= total) {
    const newline = code.indexOf('\n', cursor);
    const rawEnd = newline === -1 ? total : newline;

    let end = rawEnd;
    if (end > cursor && code.charCodeAt(end - 1) === 13) end -= 1;

    let hasCode = false;
    let hasRemoved = false;

    for (let i = cursor; i < end; i += 1) {
      if (removed[i]) hasRemoved = true;
      else if (!SPACE.test(code[i])) hasCode = true;
    }

    if (hasCode) {
      lines.push(hasRemoved ? renderLine(code, cursor, end, removed) : code.slice(cursor, end));
    } else if (!hasRemoved) {
      lines.push(code.slice(cursor, end));
    }

    cursor = newline === -1 ? total + 1 : newline + 1;
  }

  return lines.join(eol);
}
