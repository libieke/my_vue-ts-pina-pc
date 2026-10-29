import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let babelParser;
let loadError;

function getParser() {
  if (babelParser !== undefined) return babelParser;
  try {
    babelParser = require('@babel/parser');
  } catch (error) {
    babelParser = null;
    loadError = error;
  }
  return babelParser;
}

const EXTRA_PLUGINS = ['decorators-legacy', 'importAttributes', 'explicitResourceManagement'];

export function jsComments(code, language = 'js') {
  const parser = getParser();
  if (!parser) {
    return { comments: [], error: `无法加载 @babel/parser：${loadError?.message || '未知原因'}` };
  }

  const base = [];
  if (language === 'ts' || language === 'tsx') base.push('typescript');
  if (language === 'jsx' || language === 'tsx') base.push('jsx');

  const variants = [
    [...base, ...EXTRA_PLUGINS],
    [...base, 'decorators-legacy'],
    [...base],
  ];

  const tried = new Set();
  let lastError = null;

  for (const plugins of variants) {
    const key = plugins.join('|');
    if (tried.has(key)) continue;
    tried.add(key);

    try {
      const ast = parser.parse(code, {
        sourceType: 'unambiguous',
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
        allowNewTargetOutsideFunction: true,
        allowSuperOutsideMethod: true,
        allowUndeclaredExports: true,
        errorRecovery: true,
        plugins,
      });

      const comments = (ast.comments || []).map((comment) => ({
        start: comment.start,
        end: comment.end,
        kind: comment.type === 'CommentLine' ? 'line' : 'block',
      }));

      return { comments, recoverable: Boolean(ast.errors && ast.errors.length) };
    } catch (error) {
      lastError = error;
    }
  }

  return { comments: [], error: lastError ? lastError.message : '无法解析该文件' };
}
