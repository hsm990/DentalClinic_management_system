import { store } from "@/app/store";

export async function downloadDocument(documentId: string) {
  const token = store.getState().auth.accessToken;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const res = await fetch(`${baseUrl}/documents/${documentId}/download-url`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not get download link");

  const { url } = await res.json();
  window.open(url, "_blank");
}
