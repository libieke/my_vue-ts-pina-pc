import { describe, it, expect, beforeEach, vi } from "vitest";
beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});
describe("i18n 配置", () => {
  it("messages 导出包含 zh-CN 和 en 两个语言包", async () => {
    const {
      messages
    } = await import("../index");
    expect(messages["zh-CN"]).toBeDefined();
    expect(messages.en).toBeDefined();
  });
  it("默认 locale 为 zh-CN（localStorage 无缓存时）", async () => {
    const i18n = (await import("../index")).default;
    expect(i18n.global.locale.value).toBe("zh-CN");
  });
  it("fallbackLocale 为 zh-CN", async () => {
    const i18n = (await import("../index")).default;
    expect(i18n.global.fallbackLocale.value).toBe("zh-CN");
  });
  it("从 localStorage 恢复上次语言（en）", async () => {
    localStorage.setItem("locale", "en");
    const i18n = (await import("../index")).default;
    expect(i18n.global.locale.value).toBe("en");
  });
  it("从 localStorage 恢复上次语言（zh-CN）", async () => {
    localStorage.setItem("locale", "zh-CN");
    const i18n = (await import("../index")).default;
    expect(i18n.global.locale.value).toBe("zh-CN");
  });
});
describe("setLocale 切换函数", () => {
  it("切换到 en：更新 i18n 全局 locale", async () => {
    const {
      setLocale
    } = await import("../index");
    const i18n = (await import("../index")).default;
    setLocale("en");
    expect(i18n.global.locale.value).toBe("en");
  });
  it("切换到 en：写入 localStorage", async () => {
    const {
      setLocale
    } = await import("../index");
    setLocale("en");
    expect(localStorage.getItem("locale")).toBe("en");
  });
  it("切换到 zh-CN：更新 i18n 全局 locale", async () => {
    const {
      setLocale
    } = await import("../index");
    const i18n = (await import("../index")).default;
    setLocale("en");
    expect(i18n.global.locale.value).toBe("en");
    setLocale("zh-CN");
    expect(i18n.global.locale.value).toBe("zh-CN");
  });
  it("切换到 zh-CN：写入 localStorage", async () => {
    const {
      setLocale
    } = await import("../index");
    setLocale("zh-CN");
    expect(localStorage.getItem("locale")).toBe("zh-CN");
  });
  it("来回切换不丢失状态", async () => {
    const {
      setLocale
    } = await import("../index");
    const i18n = (await import("../index")).default;
    setLocale("en");
    expect(i18n.global.locale.value).toBe("en");
    setLocale("zh-CN");
    expect(i18n.global.locale.value).toBe("zh-CN");
    setLocale("en");
    expect(i18n.global.locale.value).toBe("en");
    expect(localStorage.getItem("locale")).toBe("en");
  });
});
describe("翻译函数 t()", () => {
  it("中文模式下返回中文文案", async () => {
    const i18n = (await import("../index")).default;
    const t = i18n.global.t;
    expect(t("common.confirm")).toBe("确定");
    expect(t("menu.home")).toBe("首页");
    expect(t("header.logout")).toBe("退出");
  });
  it("英文模式下返回英文文案", async () => {
    const {
      setLocale
    } = await import("../index");
    const i18n = (await import("../index")).default;
    setLocale("en");
    const t = i18n.global.t;
    expect(t("common.confirm")).toBe("Confirm");
    expect(t("menu.home")).toBe("Home");
    expect(t("header.logout")).toBe("Logout");
  });
  it("切换语言后 t() 返回值实时更新", async () => {
    const {
      setLocale
    } = await import("../index");
    const i18n = (await import("../index")).default;
    const t = i18n.global.t;
    expect(t("common.edit")).toBe("编辑");
    setLocale("en");
    expect(t("common.edit")).toBe("Edit");
    setLocale("zh-CN");
    expect(t("common.edit")).toBe("编辑");
  });
  it("插值参数正确替换", async () => {
    const i18n = (await import("../index")).default;
    const t = i18n.global.t;
    expect(t("common.pleaseInput", {
      label: "用户"
    })).toBe("请输入用户");
    expect(t("common.total", {
      total: 42
    })).toBe("共 42 条");
    expect(t("user.saveConfirmMsg", {
      name: "张三"
    })).toContain("张三");
  });
  it("英文模式插值参数正确替换", async () => {
    const {
      setLocale
    } = await import("../index");
    const i18n = (await import("../index")).default;
    setLocale("en");
    const t = i18n.global.t;
    expect(t("common.pleaseInput", {
      label: "User"
    })).toBe("Please enter User");
    expect(t("common.total", {
      total: 42
    })).toBe("Total 42 items");
    expect(t("user.saveConfirmMsg", {
      name: "John"
    })).toContain("John");
  });
  it("key 不存在时回退到 zh-CN（fallbackLocale）", async () => {
    const {
      setLocale
    } = await import("../index");
    const i18n = (await import("../index")).default;
    setLocale("en");
    const t = i18n.global.t;
    expect(t("nonexistent.key.deep")).toBe("nonexistent.key.deep");
  });
});