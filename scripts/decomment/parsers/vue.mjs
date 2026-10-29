import { createRequire } from 'node:module';

import { cssComments, htmlComments } from './markup.mjs';
import { jsComments } from './js.mjs';

const require = createRequire(import.meta.url);

let compilerSfc;
let loadError;

function getCompilerSfc() {
  if (compilerSfc !== undefined) return compilerSfc;
  try {
    compilerSfc = require('@vue/compiler-sfc');
  } catch (error) {
    compilerSfc = null;
    loadError = error;
  }
  return compilerSfc;
}

function blockOffset(code, block) {
  if (!block || !block.content) return -1;

  const offset = block.loc && block.loc.start ? block.loc.start.offset : -1;
  if (offset >= 0 && code.startsWith(block.content, offset)) return offset;

  if (offset >= 0) {
    const found = code.indexOf(block.content, Math.max(0, offset - 2));
    if (found !== -1) return found;
  }

  return -1;
}

function scriptLanguage(lang) {
  const value = String(lang || '').toLowerCase();
  if (value === 'ts' || value === 'mts' || value === 'cts') return 'ts';
  if (value === 'tsx') return 'tsx';
  if (value === 'jsx') return 'jsx';
  return 'js';
}

function shift(comments, offset, target) {
  for (const comment of comments) {
    target.push({
      start: comment.start + offset,
      end: comment.end + offset,
      kind: comment.kind,
    });
  }
}

export function vueComments(code) {
  const sfc = getCompilerSfc();
  if (!sfc) {
    return { comments: [], error: `无法加载 @vue/compiler-sfc：${loadError?.message || '未知原因'}` };
  }

  let descriptor;
  try {
    ({ descriptor } = sfc.parse(code, { filename: 'component.vue' }));
  } catch (error) {
    return { comments: [], error: error.message };
  }

  if (!descriptor) return { comments: [], error: '无法解析 SFC' };

  const comments = [];
  const occupied = [];

  if (descriptor.template) {
    const offset = blockOffset(code, descriptor.template);
    if (offset >= 0) {
      shift(htmlComments(descriptor.template.content, { blocks: false, interpolations: true }), offset, comments);
      occupied.push([offset, offset + descriptor.template.content.length]);
    }
  }

  for (const block of [descriptor.script, descriptor.scriptSetup]) {
    if (!block) continue;
    const offset = blockOffset(code, block);
    if (offset < 0) continue;

    const result = jsComments(block.content, scriptLanguage(block.lang));
    if (result.error) {
      return { comments, error: result.error };
    }
    shift(result.comments, offset, comments);
    occupied.push([offset, offset + block.content.length]);
  }

  for (const block of descriptor.styles || []) {
    const offset = blockOffset(code, block);
    if (offset < 0) continue;

    const lang = String(block.lang || 'css').toLowerCase();
    const lineComments = lang !== 'css';
    shift(cssComments(block.content, { lineComments }), offset, comments);
    occupied.push([offset, offset + block.content.length]);
  }

  for (const block of descriptor.customBlocks || []) {
    const lang = String(block.lang || '').toLowerCase();
    const offset = blockOffset(code, block);
    if (offset < 0) continue;

    if (lang === 'json' || lang === 'jsonc' || lang === 'json5') {
      shift(cssComments(block.content, { lineComments: true }), offset, comments);
    }
    occupied.push([offset, offset + block.content.length]);
  }

  for (const comment of htmlComments(code, { blocks: false })) {
    const inside = occupied.some(([start, end]) => comment.start >= start && comment.end <= end);
    if (!inside) comments.push(comment);
  }

  return { comments };
}
