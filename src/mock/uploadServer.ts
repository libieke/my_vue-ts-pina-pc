import {
  dbPut,
  dbGet,
  dbKeys,
  dbGetChunksInOrder,
  dbDeleteFile,
  STORE_CHUNKS,
  STORE_FILES,
} from "./uploadDb";
import type {
  CheckResult,
  MergeResult,
} from "@/components/BigFileUploader/types";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export async function mockCheck(body: {
  fileHash: string;
  fileName: string;
  totalChunks: number;
}): Promise<CheckResult> {
  await delay();
  const { fileHash, totalChunks } = body;

  const fileMeta = await dbGet<{ url: string }>(STORE_FILES, fileHash);
  if (fileMeta?.url) {
    return { uploaded: true, uploadedChunks: [], url: fileMeta.url };
  }

  const keys = await dbKeys(STORE_CHUNKS);
  const prefix = fileHash + "_";
  const uploadedChunks: number[] = [];
  for (const k of keys) {
    if (k.startsWith(prefix)) {
      uploadedChunks.push(Number(k.slice(prefix.length)));
    }
  }

  const valid = uploadedChunks.filter((i) => i >= 0 && i < totalChunks);
  return { uploaded: false, uploadedChunks: valid };
}

export async function mockUploadChunk(form: FormData): Promise<{ ok: true }> {
  await delay(100);
  const blob = form.get("file") as Blob;
  const chunkIndex = Number(form.get("chunkIndex"));
  const fileHash = String(form.get("fileHash"));

  if (!blob || Number.isNaN(chunkIndex) || !fileHash) {
    throw new Error("分片参数缺失");
  }

  await dbPut(STORE_CHUNKS, `${fileHash}_${chunkIndex}`, blob);
  return { ok: true };
}

export async function mockMerge(body: {
  fileHash: string;
  fileName: string;
  totalChunks: number;
}): Promise<MergeResult> {
  await delay(300);
  const { fileHash, fileName, totalChunks } = body;

  const existed = await dbGet<{ url: string }>(STORE_FILES, fileHash);
  if (existed?.url) return { url: existed.url };

  const chunks = await dbGetChunksInOrder(fileHash, totalChunks);
  const fullBlob = new Blob(chunks);

  const url = URL.createObjectURL(fullBlob);

  await dbPut(STORE_FILES, fileHash, {
    url,
    fileName,
    size: fullBlob.size,
    createdAt: Date.now(),
  });

  return { url };
}

export async function mockRemove(body: {
  fileHash: string;
}): Promise<{ ok: true }> {
  await delay(100);
  await dbDeleteFile(body.fileHash);
  return { ok: true };
}
