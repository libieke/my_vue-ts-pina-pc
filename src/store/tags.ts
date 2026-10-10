import { defineStore } from "pinia";
export interface TagView {
  path: string;
  title: string;
  name?: string;
}
const STORAGE_KEY = "tags-visited-views";
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
  } catch {}
};
const useTagsStore = defineStore("tags", {
  state: () => ({
    visitedViews: loadVisitedViews() as TagView[]
  }),
  getters: {},
  actions: {
    syncStorage() {
      saveVisitedViews(this.visitedViews);
    },
    addView(view: TagView) {
      if (this.visitedViews.some(v => v.path === view.path)) return;
      const tag = {
        path: view.path,
        title: view.title || "",
        name: view.name
      };
      if (view.path === "/home") {
        this.visitedViews.unshift(tag);
      } else {
        this.visitedViews.push(tag);
      }
      this.syncStorage();
    },
    delView(path: string) {
      const index = this.visitedViews.findIndex(v => v.path === path);
      if (index > -1) {
        this.visitedViews.splice(index, 1);
        this.syncStorage();
      }
    },
    delOtherViews(path: string) {
      this.visitedViews = this.visitedViews.filter(v => v.path === path || v.path === "/home");
      this.syncStorage();
    },
    delAllViews() {
      this.visitedViews = this.visitedViews.filter(v => v.path === "/home");
      this.syncStorage();
    }
  }
});
export default useTagsStore;