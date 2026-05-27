import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  tags?: string[];
  revalidate?: number | false;
}

function buildUrl(path: string, query?: ApiFetchOptions["query"]): string {
  const url = new URL(path.replace(/^\//, ""), `${env.apiBaseUrl.replace(/\/$/, "")}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, query, tags, revalidate, headers, ...rest } = options;

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    next: { tags, revalidate },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ApiError(response.status, text || response.statusText);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
