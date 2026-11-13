import {
  mockCheck,
  mockUploadChunk,
  mockMerge,
  mockRemove,
} from "./uploadServer";

export const MOCK_UPLOAD_URLS = {
  upload: "/api/file/chunk/upload",
  check: "/api/file/chunk/check",
  merge: "/api/file/merge",
  remove: "/api/file/chunk/remove",
};

export async function mockUploadRequest(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  try {
    if (url === MOCK_UPLOAD_URLS.check) {
      const body = JSON.parse(String(init.body || "{}"));
      const data = await mockCheck(body);
      return jsonResponse(data);
    }
    if (url === MOCK_UPLOAD_URLS.upload) {
      const form = init.body as FormData;
      const data = await mockUploadChunk(form);
      return jsonResponse(data);
    }
    if (url === MOCK_UPLOAD_URLS.merge) {
      const body = JSON.parse(String(init.body || "{}"));
      const data = await mockMerge(body);
      return jsonResponse(data);
    }
    if (url === MOCK_UPLOAD_URLS.remove) {
      const body = JSON.parse(String(init.body || "{}"));
      const data = await mockRemove(body);
      return jsonResponse(data);
    }
    return new Response("Not Found", { status: 404 });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ message: e?.message || "mock error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
