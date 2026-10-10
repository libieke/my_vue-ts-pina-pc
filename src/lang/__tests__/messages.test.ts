import { describe, it, expect } from "vitest";
import zhCN from "../zh-CN";
import en from "../en";
function collectKeys(obj: Record<string, any>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...collectKeys(value, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}
function collectTypes(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const types: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(types, collectTypes(value, path));
    } else {
      types[path] = Array.isArray(value) ? "array" : typeof value;
    }
  }
  return types;
}
describe("语言包 key 对齐", () => {
  const zhKeys = collectKeys(zhCN);
  const enKeys = collectKeys(en);
  it("中文和英文语言包的 key 数量一致", () => {
    expect(zhKeys.length).toBe(enKeys.length);
  });
  it("中文语言包的每个 key 在英文语言包中都存在", () => {
    const enKeySet = new Set(enKeys);
    const missing = zhKeys.filter(k => !enKeySet.has(k));
    expect(missing).toEqual([]);
  });
  it("英文语言包的每个 key 在中文语言包中都存在", () => {
    const zhKeySet = new Set(zhKeys);
    const missing = enKeys.filter(k => !zhKeySet.has(k));
    expect(missing).toEqual([]);
  });
  it("对应 key 的值类型一致（防止一侧是字符串另一侧是对象）", () => {
    const zhTypes = collectTypes(zhCN);
    const enTypes = collectTypes(en);
    for (const key of Object.keys(zhTypes)) {
      expect(enTypes[key]).toBeDefined();
      expect(enTypes[key]).toBe(zhTypes[key]);
    }
  });
});
describe("语言包内容完整性", () => {
  it("包含 common 基础文案组", () => {
    expect(zhCN.common).toBeDefined();
    expect(en.common).toBeDefined();
    expect(zhCN.common.confirm).toBe("确定");
    expect(en.common.confirm).toBe("Confirm");
  });
  it("包含 menu 菜单文案组（路由 meta.title 依赖）", () => {
    expect(zhCN.menu).toBeDefined();
    expect(en.menu).toBeDefined();
    expect(zhCN.menu.home).toBe("首页");
    expect(en.menu.home).toBe("Home");
    const menuKeys = ["home", "userList", "userSet", "orderManage", "dataAnalysis", "messageNotice", "docCenter", "fileManage"];
    for (const k of menuKeys) {
      expect((zhCN.menu as Record<string, string>)[k]).toBeDefined();
      expect((en.menu as Record<string, string>)[k]).toBeDefined();
    }
  });
  it("包含 user 用户管理文案组（含 {name} 插值）", () => {
    expect(zhCN.user.saveConfirmMsg).toContain("{name}");
    expect(en.user.saveConfirmMsg).toContain("{name}");
    expect(zhCN.user.deleteConfirmMsg).toContain("{name}");
    expect(en.user.deleteConfirmMsg).toContain("{name}");
    expect(zhCN.user.resetConfirmMsg).toContain("{name}");
    expect(en.user.resetConfirmMsg).toContain("{name}");
  });
  it("common.pleaseInput / pleaseSelect 含 {label} 插值", () => {
    expect(zhCN.common.pleaseInput).toContain("{label}");
    expect(en.common.pleaseInput).toContain("{label}");
    expect(zhCN.common.pleaseSelect).toContain("{label}");
    expect(en.common.pleaseSelect).toContain("{label}");
  });
  it("common.total 含 {total} 插值", () => {
    expect(zhCN.common.total).toContain("{total}");
    expect(en.common.total).toContain("{total}");
  });
  it("home 日期格式化含 {year}/{month}/{day}/{week} 插值", () => {
    expect(zhCN.home.dateFormat).toContain("{year}");
    expect(zhCN.home.dateFormat).toContain("{week}");
    expect(en.home.dateFormat).toContain("{year}");
    expect(en.home.dateFormat).toContain("{week}");
  });
  it("home.devInProgress 含 {name} 插值", () => {
    expect(zhCN.home.devInProgress).toContain("{name}");
    expect(en.home.devInProgress).toContain("{name}");
  });
  it("包含 404 页面文案", () => {
    expect(zhCN.notFound).toBeDefined();
    expect(en.notFound).toBeDefined();
    expect(zhCN.notFound.backHome).toBe("返回首页");
    expect(en.notFound.backHome).toBe("Back to Home");
  });
});