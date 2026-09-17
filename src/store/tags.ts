import { defineStore } from "pinia";

export interface TagView {
  path: string;
  title: string;
  name?: string;
}

const STORAGE_KEY = "tags-visited-views";

// 这里的思路是：
// 1. 页面刷新时，先从 localStorage 里恢复标签数据
// 2. 每次标签增删时，统一写回 localStorage
// 3. 这样标签栏不会因为 F5 / 刷新而被重置
const loadVisitedViews = (): TagView[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return [];
    const parsed = JSON.parse(cached) as TagView[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveVisitedViews = (views: TagView[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch {
    // 兜底：如果 storage 被禁用或写入失败，不阻断业务逻辑
  }
};

const useTagsStore = defineStore("tags", {
  state: () => ({
    visitedViews: loadVisitedViews() as TagView[],
  }),
  getters: {},
  actions: {
    syncStorage() {
      // 统一入口：所有标签状态更新后，最后都同步到浏览器存储
      saveVisitedViews(this.visitedViews);
    },
    addView(view: TagView) {
      // 去重：如果已存在相同 path 的标签，不重复添加
      if (this.visitedViews.some((v) => v.path === view.path)) return;
      const tag = {
        path: view.path,
        title: view.title || "未命名",
        name: view.name,
      };
      // 首页固定在第一个位置
      if (view.path === "/home") {
        this.visitedViews.unshift(tag);
      } else {
        this.visitedViews.push(tag);
      }
      this.syncStorage();
    },
    delView(path: string) {
      const index = this.visitedViews.findIndex((v) => v.path === path);
      if (index > -1) {
        this.visitedViews.splice(index, 1);
        this.syncStorage();
      }
    },
    delOtherViews(path: string) {
      this.visitedViews = this.visitedViews.filter(
        (v) => v.path === path || v.path === "/home"
      );
      this.syncStorage();
    },
    delAllViews() {
      this.visitedViews = this.visitedViews.filter((v) => v.path === "/home");
      this.syncStorage();
    },
  },
});

export default useTagsStore;
