import type { ResourceType } from "@/lib/curriculum";

/**
 * Best-effort helpers for the "just paste a link" add-resource flow: guess a
 * `type` from the URL's actual hostname, and produce a reasonable `title` —
 * a real one fetched from YouTube's oEmbed API for video links, or one
 * derived from the URL's own path otherwise. Everything here is a guess the
 * user can still edit; nothing here should ever throw or hang indefinitely.
 */

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function isHost(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function inferResourceType(url: string): ResourceType {
  const parsed = parseUrl(url);
  if (!parsed) return "article";
  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();

  if (isHost(hostname, "youtube.com") || isHost(hostname, "youtu.be") || isHost(hostname, "vimeo.com")) {
    return "video";
  }
  if (
    isHost(hostname, "arxiv.org") ||
    isHost(hostname, "doi.org") ||
    isHost(hostname, "pubmed.ncbi.nlm.nih.gov") ||
    (isHost(hostname, "ncbi.nlm.nih.gov") && pathname.includes("/pmc"))
  ) {
    return "paper";
  }
  if (
    (hostname.includes("amazon.") && pathname.includes("/dp/")) ||
    (isHost(hostname, "goodreads.com") && pathname.includes("/book"))
  ) {
    return "book";
  }
  return "article";
}

function extractYouTubeUrl(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;
  const hostname = parsed.hostname.toLowerCase();
  if (isHost(hostname, "youtu.be")) return url;
  if (isHost(hostname, "youtube.com")) {
    if (parsed.pathname.startsWith("/watch") || parsed.pathname.startsWith("/embed/")) return url;
  }
  return null;
}

/**
 * Turns a URL's own path into a readable title, e.g.
 * ".../blog/rice-simple-prioritization-for-product-managers/" ->
 * "Rice Simple Prioritization For Product Managers". Falls back to the
 * hostname if there's no usable path segment.
 */
export function titleFromUrl(url: string): string {
  const parsed = parseUrl(url);
  if (!parsed) return url;
  const segments = parsed.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const raw = last
    ? decodeURIComponent(last).replace(/\.(html?|php|aspx?|jsp)$/i, "")
    : parsed.hostname;
  const words = raw
    .replace(/[-_+]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return parsed.hostname;
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

async function fetchWithTimeout(input: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchYouTubeTitle(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      5000
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}

export interface ResourceMeta {
  title: string;
  type: ResourceType;
}

/**
 * Resolves a title + type for a bare URL. Never throws — any failure
 * (network error, timeout, unrecognized host) degrades to the slug-based
 * title so "just paste a link" always produces something usable.
 */
export async function resolveResourceMeta(url: string): Promise<ResourceMeta> {
  const type = inferResourceType(url);
  const youtubeUrl = extractYouTubeUrl(url);
  if (youtubeUrl) {
    const title = await fetchYouTubeTitle(youtubeUrl);
    if (title) return { title, type };
  }
  return { title: titleFromUrl(url), type };
}
