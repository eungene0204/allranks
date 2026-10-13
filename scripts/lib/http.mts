const UA = "allranks-data-pipeline/0.1";

export async function getText(url: string, retries = 3): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error(`GET ${url} failed after ${retries} attempts: ${(lastErr as Error).message}`);
}

export async function getJson<T = unknown>(url: string): Promise<T> {
  return JSON.parse(await getText(url)) as T;
}
