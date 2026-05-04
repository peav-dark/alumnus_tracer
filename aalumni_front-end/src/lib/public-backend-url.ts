export function getPublicBackendUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  return `${baseUrl}${normalizedPath}`;
}