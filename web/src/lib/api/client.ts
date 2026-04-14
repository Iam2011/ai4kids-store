const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ai4kids-api.onrender.com/api";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
  revalidate?: number;
};

const buildUrl = (path: string, params?: RequestOptions["params"]) => {
  const url = new URL(`${DEFAULT_API_URL}${path}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.params), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    next:
      options.revalidate !== undefined
        ? {
            revalidate: options.revalidate,
          }
        : undefined,
  });

  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({ message: "Request failed." })) as { message?: string };
    throw new Error(payload.message || "Request failed.");
  }

  return response.json() as Promise<T>;
}

export async function apiFetchBlob(path: string, options: RequestOptions = {}) {
  const response = await fetch(buildUrl(path, options.params), options);

  if (!response.ok) {
    throw new Error("Unable to download file.");
  }

  return response.blob();
}
