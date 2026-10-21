import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
Object.assign(globalThis, Vue, VueRouter);
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })) as unknown as typeof window.matchMedia;
}
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
const globalRef = globalThis as Record<string, unknown>;
if (!globalRef.ResizeObserver) {
  globalRef.ResizeObserver = ResizeObserverMock;
}
if (!globalRef.IntersectionObserver) {
  globalRef.IntersectionObserver = IntersectionObserverMock;
}
if (typeof window.scrollTo !== 'function') {
  window.scrollTo = () => {};
}