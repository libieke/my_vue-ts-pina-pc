import { loadConfig, detectLanguage, mayContainComments } from './config.mjs';
import { shouldKeepComment } from './keep.mjs';
import { stripRanges } from './apply.mjs';
import { jsComments } from './parsers/js.mjs';
import { cssComments, htmlComments } from './parsers/markup.mjs';
import { cStyleComments, hashComments, sqlComments, yamlComments } from './parsers/text.mjs';
import { vueComments } from './parsers/vue.mjs';

/** 用于跳过整份文件的逃逸标记，写在文件任意位置（一般放顶部）即可 */
const IGNORE_FILE_MARKER = 'decomment-ignore-file';

/** 语言 -> 注释收集器 */
function collectComments(code, language) {
  switch (language) {
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return jsComments(code, language);
    case 'vue':
      return vueComments(code);
    case 'css':
      return { comments: cssComments(code) };
    case 'scss':
    case 'less':
    case 'stylus':
      return { comments: cssComments(code, { lineComments: true }) };
    case 'html':
      return { comments: htmlComments(code) };
    case 'xml':
      return { comments: htmlComments(code, { blocks: false }) };
    case 'json':
      return { comments: cssComments(code, { lineComments: true }) };
    case 'yaml':
      return { comments: yamlComments(code) };
    case 'toml':
      return { comments: hashComments(code) };
    case 'ini':
      return { comments: hashComments(code, { lineStartChar: ';' }) };
    case 'shell':
      return { comments: hashComments(code) };
    case 'python':
      return { comments: hashComments(code, { anywhere: true, tripleQuotes: true }) };
    case 'php':
      return { comments: cStyleComments(code, { hash: true }) };
    case 'go':
      return { comments: cStyleComments(code, { rawStrings: true }) };
    case 'sql':
      return { comments: sqlComments(code) };
    case 'c':
      return { comments: cStyleComments(code) };
    default:
      return null;
  }
}

/**
 * 抽离文本中的注释。
 *
 * 任何一步出现异常都会返回原始内容（changed=false），
 * 保证「宁可不去注释，也不能弄坏代码」。
 *
 * @param {string} text
 * @param {{ filePath?: string, config?: object, language?: string }} options
 */
export function stripText(text, options = {}) {
  const config = options.config || loadConfig(options.cwd || process.cwd());
  const filePath = options.filePath || '';

  const result = {
    code: text,
    changed: false,
    stats: { removed: 0, kept: 0 },
    language: null,
    skipped: null,
    error: null,
  };

  if (typeof text !== 'string' || text.length === 0) {
    return { ...result, skipped: 'empty' };
  }

  if (!config.enabled) {
    return { ...result, skipped: 'disabled' };
  }

  if (text.slice(0, 5000).includes(IGNORE_FILE_MARKER)) {
    return { ...result, skipped: 'ignore-file-marker' };
  }

  if (text.length > config.maxFileSize) {
    return { ...result, skipped: 'too-large' };
  }

  // 保留 BOM，避免改动文件编码特征
  let bom = '';
  let body = text;
  if (body.charCodeAt(0) === 0xfeff) {
    bom = '\uFEFF';
    body = body.slice(1);
  }

  const language = options.language || detectLanguage(filePath, config);
  result.language = language;

  if (!language) {
    return { ...result, skipped: 'unsupported-language' };
  }

  if (!mayContainComments(language, body)) {
    return { ...result, skipped: 'no-comment-marker' };
  }

  let collected;
  try {
    collected = collectComments(body, language);
  } catch (error) {
    return { ...result, error: error.message };
  }

  if (!collected || collected.error) {
    return { ...result, error: collected?.error || '解析失败' };
  }

  const removable = [];
  let kept = 0;

  for (const comment of collected.comments) {
    const start = Math.max(0, comment.start);
    const end = Math.min(body.length, comment.end);
    if (end <= start) continue;

    const raw = body.slice(start, end);
    if (shouldKeepComment(raw, config)) {
      kept += 1;
      continue;
    }
    removable.push({ start, end });
  }

  if (removable.length === 0) {
    return { ...result, stats: { removed: 0, kept }, skipped: 'nothing-to-remove' };
  }

  const stripped = stripRanges(body, removable);

  return {
    ...result,
    code: bom + stripped,
    changed: stripped !== body,
    stats: { removed: removable.length, kept },
  };
}

/**
 * 处理 Buffer：二进制、非 UTF-8 内容一律原样返回，绝不改写。
 */
export function analyzeBuffer(buffer, filePath, options = {}) {
  const input = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const base = {
    input,
    output: input,
    changed: false,
    stats: { removed: 0, kept: 0 },
    language: null,
    skipped: 'binary',
    error: null,
  };

  if (input.length === 0) return { ...base, skipped: 'empty' };
  if (input.includes(0)) return { ...base, skipped: 'binary' };

  const text = input.toString('utf8');
  if (!Buffer.from(text, 'utf8').equals(input)) return { ...base, skipped: 'binary' };

  const result = stripText(text, { ...options, filePath });
  const output = result.changed ? Buffer.from(result.code, 'utf8') : input;

  return { ...base, ...result, input, output };
}

/** 便捷方法：返回处理后的 Buffer（未变化时返回原 Buffer 引用） */
export function stripBuffer(buffer, filePath, options = {}) {
  return analyzeBuffer(buffer, filePath, options).output;
}

export { loadConfig };
