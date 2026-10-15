const COUNTER_ENDPOINT = 'https://abacus.jasoncameron.dev';
const COUNTER_NAMESPACE = 'libieke-my-vue-ts-pina-pc';
const COUNTER_KEY = 'home-visits';
const counterUrl = () => `${COUNTER_ENDPOINT}/hit/${COUNTER_NAMESPACE}/${COUNTER_KEY}`;
export function useVisitCounter() {
  const count = ref<number | null>(null);
  const loaded = ref(false);
  const error = ref(false);
  const load = async () => {
    try {
      const res = await fetch(counterUrl(), {
        cache: 'no-store'
      });
      if (!res.ok) throw new Error(`counter http ${res.status}`);
      const data = (await res.json()) as {
        value?: number;
        count?: number;
      };
      const next = Number(data.value ?? data.count);
      if (!Number.isFinite(next)) throw new Error('counter payload invalid');
      count.value = next;
      loaded.value = true;
      error.value = false;
    } catch (err) {
      error.value = true;
      console.warn('访问计数获取失败：', err);
    }
  };
  onMounted(load);
  return {
    count,
    loaded,
    error,
    reload: load
  };
}