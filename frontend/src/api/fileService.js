import { apiFetch } from "./apiClient";

export function uploadFile(content) {
  const data = apiFetch(`/file/upload-file`, {
    method: 'POST',
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: content,
  });
  return data;
}
