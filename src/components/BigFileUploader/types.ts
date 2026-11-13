
export interface CheckResult {
  uploaded: boolean;
  uploadedChunks: number[];
  url?: string;
}

export interface MergeResult {
  url: string;
}

export type UploadStatus =
  | "idle"
  | "hashing"
  | "checking"
  | "uploading"
  | "paused"
  | "merging"
  | "success"
  | "error";

export interface UploaderOptions {
  chunkSize?: number;
  concurrency?: number;
  retryCount?: number;
  uploadUrl: string;
  checkUrl: string;
  mergeUrl: string;
  removeUrl: string;
  headers?: Record<string, string>;
  request?: (url: string, init: RequestInit) => Promise<Response>;
}
