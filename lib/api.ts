import { ApiUserResponse, JsonValue, OVERVIEW_FIELD_HINTS } from "@/types/instagram";

/**
 * Calls our own internal Next.js API route — NEVER the RapidAPI endpoint
 * directly. The API key stays server-side inside /app/api/user/route.ts.
 */
export async function fetchInstagramUser(username: string): Promise<ApiUserResponse> {
  const res = await fetch(`/api/user?username=${encodeURIComponent(username)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const json = (await res.json()) as ApiUserResponse;
  return json;
}

/** Recursively search an object for the first key from `candidates` (case-insensitive). */
function findFirstValue(data: unknown, candidates: string[]): unknown {
  if (data === null || typeof data !== "object") return undefined;

  const lowerCandidates = candidates.map((c) => c.toLowerCase());

  // Breadth-first search so shallow matches win over deeply nested ones.
  const queue: unknown[] = [data];
  const visited = new Set<unknown>();

  while (queue.length > 0) {
    const node = queue.shift();
    if (node === null || typeof node !== "object" || visited.has(node)) continue;
    visited.add(node);

    if (Array.isArray(node)) {
      for (const item of node) queue.push(item);
      continue;
    }

    const entries = Object.entries(node as Record<string, unknown>);
    for (const [key, value] of entries) {
      if (lowerCandidates.includes(key.toLowerCase())) {
        return value;
      }
    }
    for (const [, value] of entries) {
      if (value !== null && typeof value === "object") queue.push(value);
    }
  }
  return undefined;
}

export interface ResolvedOverviewField {
  key: string;
  label: string;
  value: unknown;
}

/** Resolve the "well known" overview fields (if present anywhere in the payload). */
export function resolveOverviewFields(data: JsonValue | null): ResolvedOverviewField[] {
  if (!data) return [];
  const results: ResolvedOverviewField[] = [];

  const labels: Record<string, string> = {
    username: "Username",
    fullName: "Full Name",
    biography: "Biography",
    followers: "Followers",
    following: "Following",
    posts: "Posts",
    profilePic: "Profile Picture",
    profilePicHD: "HD Profile Picture",
    verified: "Verified",
    private: "Private",
    business: "Business Account",
    professional: "Professional Account",
    category: "Category",
    externalUrl: "External URL",
    userId: "User ID",
    pk: "Instagram PK",
    threadsLink: "Threads Link",
    mutualFollowers: "Mutual Followers",
    whatsappLinked: "WhatsApp Linked",
    country: "Country",
    email: "Email",
    phone: "Phone",
    creator: "Creator",
    businessAddress: "Business Address",
  };

  for (const [fieldKey, candidates] of Object.entries(OVERVIEW_FIELD_HINTS)) {
    const value = findFirstValue(data, candidates);
    if (value !== undefined && value !== null && value !== "") {
      results.push({ key: fieldKey, label: labels[fieldKey] ?? fieldKey, value });
    }
  }

  return results;
}
