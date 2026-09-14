import { defineStore } from "pinia";

export interface TagView {
  path: string;
  title: string;
  name?: string;
}

const useTagsStore = defineStore("tags", {
  state: () => ({
    visitedViews: [] as TagView[],
  }),
  getters: {},
  actions: {
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
    },
    delView(path: string) {
      const index = this.visitedViews.findIndex((v) => v.path === path);
      if (index > -1) {
        this.visitedViews.splice(index, 1);
      }
    },
    delOtherViews(path: string) {
      this.visitedViews = this.visitedViews.filter(
        (v) => v.path === path || v.path === "/home"
      );
    },
    delAllViews() {
      this.visitedViews = this.visitedViews.filter((v) => v.path === "/home");
    },
  },
});

export default useTagsStore;
