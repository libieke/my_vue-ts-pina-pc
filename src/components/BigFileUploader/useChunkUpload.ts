import { ref, computed } from "vue";
import SparkMD5 from "spark-md5";
import type {
  UploaderOptions,
  UploadStatus,
  CheckResult,
  MergeResult,
} from "./types";

async function sampleHash(file: File): Promise<string> {
  const SAMPLE = 2 * 1024 * 1024;
  const size = file.size;
  if (size <= SAMPLE * 3) {
    const buf = await file.arrayBuffer();
    return SparkMD5.ArrayBuffer.hash(buf) + "-" + size;
  }
  const slices = [
    file.slice(0, SAMPLE),
    file.slice(Math.floor(size / 2), Math.floor(size / 2) + SAMPLE),
    file.slice(size - SAMPLE, size),
  ];
  const spark = new SparkMD5.ArrayBuffer();
  for (const s of slices) {
    spark.append(await s.arrayBuffer());
  }
  return spark.end() + "-" + size + "-" + file.lastModified;
}

function sliceFile(file: File, chunkSize: number): Blob[] {
  const chunks: Blob[] = [];
  let start = 0;
  while (start < file.size) {
    chunks.push(file.slice(start, start + chunkSize));
    start += chunkSize;
  }
  return chunks;
}

export function useChunkUpload(options: UploaderOptions) {
  const {
    chunkSize = 5 * 1024 * 1024,
    concurrency = 4,
    retryCount = 3,
    uploadUrl,
    checkUrl,
    mergeUrl,
    removeUrl,
    headers = {},
    request = fetch,
  } = options;

  const status = ref<UploadStatus>("idle");
  const progress = ref(0);
  const uploadedCount = ref(0);
  const totalChunks = ref(0);
  const errorMsg = ref("");
  const fileHash = ref("");
  const resultUrl = ref("");

  let file: File | null = null;
  let chunks: Blob[] = [];
  let paused = false;
  let aborted = false;

  const isPaused = computed(() => status.value === "paused");

  async function uploadOneChunk(
    index: number,
    blob: Blob,
    hash: string,
  ): Promise<void> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      if (aborted) throw new Error("aborted");
      try {
        const form = new FormData();
        form.append("file", blob);
        form.append("chunkIndex", String(index));
        form.append("fileHash", hash);
        form.append("totalChunks", String(chunks.length));
        form.append("fileName", file!.name);

        const res = await request(uploadUrl, {
          method: "POST",
          headers,
          body: form,
        });
        if (!res.ok) throw new Error(`chunk ${index} HTTP ${res.status}`);
        return;
      } catch (e) {
        lastErr = e;
        if (attempt < retryCount) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }
    throw lastErr;
  }

  async function runPool(queue: number[], hash: string): Promise<void> {
    let cursor = 0;
    let running = 0;

    return new Promise((resolve, reject) => {
      const next = () => {
        if (aborted) return reject(new Error("aborted"));
        if (paused) return;
        if (cursor >= queue.length && running === 0) return resolve();

        while (running < concurrency && cursor < queue.length) {
          const idx = queue[cursor++];
          running++;
          uploadOneChunk(idx, chunks[idx], hash)
            .then(() => {
              uploadedCount.value++;
              progress.value = Math.floor(
                (uploadedCount.value / totalChunks.value) * 100,
              );
            })
            .catch(reject)
            .finally(() => {
              running--;
              next();
            });
        }
      };
      next();
    });
  }

  async function start(f: File) {
    file = f;
    paused = false;
    aborted = false;
    errorMsg.value = "";
    resultUrl.value = "";
    uploadedCount.value = 0;
    progress.value = 0;

    try {
      status.value = "hashing";
      fileHash.value = await sampleHash(f);

      status.value = "checking";
      chunks = sliceFile(f, chunkSize);
      totalChunks.value = chunks.length;

      const checkRes = await request(checkUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          fileHash: fileHash.value,
          fileName: f.name,
          totalChunks: chunks.length,
        }),
      });
      if (!checkRes.ok) throw new Error("check failed");
      const checkData: CheckResult = await checkRes.json();

      if (checkData.uploaded && checkData.url) {
        resultUrl.value = checkData.url;
        progress.value = 100;
        uploadedCount.value = totalChunks.value;
        status.value = "success";
        return;
      }

      const uploadedSet = new Set(checkData.uploadedChunks || []);
      uploadedCount.value = uploadedSet.size;
      progress.value = Math.floor(
        (uploadedCount.value / totalChunks.value) * 100,
      );

      const queue: number[] = [];
      for (let i = 0; i < chunks.length; i++) {
        if (!uploadedSet.has(i)) queue.push(i);
      }

      if (queue.length > 0) {
        status.value = "uploading";
        await runPool(queue, fileHash.value);
      }

      status.value = "merging";
      const mergeRes = await request(mergeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          fileHash: fileHash.value,
          fileName: f.name,
          totalChunks: chunks.length,
        }),
      });
      if (!mergeRes.ok) throw new Error("merge failed");
      const mergeData: MergeResult = await mergeRes.json();

      resultUrl.value = mergeData.url;
      progress.value = 100;
      status.value = "success";
    } catch (e: any) {
      if (aborted) return;
      errorMsg.value = e?.message || "上传失败";
      status.value = "error";
    }
  }

  function pause() {
    if (status.value !== "uploading") return;
    paused = true;
    status.value = "paused";
  }

  async function resume() {
    if (status.value !== "paused" || !file) return;
    paused = false;
    status.value = "uploading";

    const checkRes = await request(checkUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        fileHash: fileHash.value,
        fileName: file.name,
        totalChunks: chunks.length,
      }),
    });
    const checkData: CheckResult = await checkRes.json();
    const uploadedSet = new Set(checkData.uploadedChunks || []);
    uploadedCount.value = uploadedSet.size;
    progress.value = Math.floor((uploadedSet.size / totalChunks.value) * 100);

    const queue: number[] = [];
    for (let i = 0; i < chunks.length; i++) {
      if (!uploadedSet.has(i)) queue.push(i);
    }

    try {
      await runPool(queue, fileHash.value);
      status.value = "merging";
      const mergeRes = await request(mergeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          fileHash: fileHash.value,
          fileName: file!.name,
          totalChunks: chunks.length,
        }),
      });
      const mergeData: MergeResult = await mergeRes.json();
      resultUrl.value = mergeData.url;
      progress.value = 100;
      status.value = "success";
    } catch (e: any) {
      if (aborted) return;
      errorMsg.value = e?.message || "上传失败";
      status.value = "error";
    }
  }

  async function cancel() {
    aborted = true;
    paused = false;

    if (fileHash.value && file) {
      try {
        await request(removeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ fileHash: fileHash.value }),
        });
      } catch (e) {
        console.warn("清理残留分片失败", e);
      }
    }

    status.value = "idle";
    progress.value = 0;
    uploadedCount.value = 0;
    totalChunks.value = 0;
    fileHash.value = "";
    resultUrl.value = "";
    errorMsg.value = "";
    file = null;
    chunks = [];
  }

  return {
    status,
    progress,
    uploadedCount,
    totalChunks,
    errorMsg,
    fileHash,
    resultUrl,
    isPaused,
    start,
    pause,
    resume,
    cancel,
  };
}
