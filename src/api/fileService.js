import { apiFetch } from "./apiClient";

export function uploadFile(content) {
  console.log('Calling uploadFIle');
  const data = apiFetch(`/file/upload-file`, {
    method: 'POST',
    body: content,
  });
  return data;
}
