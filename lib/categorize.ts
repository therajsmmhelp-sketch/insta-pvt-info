import type { JsonObject, JsonValue } from "@/types/instagram";

/**
 * These are keyword *heuristics*, not a fixed field list — any key whose
 * name matches one of these substrings gets bucketed accordingly. Fields
 * that don't match anything still show up under "Other Fields", so no data
 * is ever hidden. This means new/unknown fields the API adds in the future
 * are automatically picked up without any code changes.
 */
const PROFILE_HINTS = [
  "user",
  "name",
  "bio",
  "avatar",
  "picture",
  "profile_pic",
  "pronoun",
  "link",
  "url",
  "verified",
  "private",
  "gender",
  "category",
  "location",
  "country",
  "language",
  "external",
  "threads",
  "id",
  "pk",
];

const MEDIA_HINTS = [
  "media",
  "post",
  "photo",
  "video",
  "reel",
  "story",
  "stories",
  "highlight",
  "carousel",
  "timeline",
  "clip",
  "image",
  "thumbnail",
];

const BUSINESS_HINTS = [
  "business",
  "contact",
  "phone",
  "email",
  "address",
  "whatsapp",
  "professional",
  "creator",
  "category_name",
  "public_email",
  "public_phone",
];

function keyMatchesAny(key: string, hints: string[]): boolean {
  const lower = key.toLowerCase();
  return hints.some((hint) => lower.includes(hint));
}

export interface CategorizedFields {
  profile: JsonObject;
  media: JsonObject;
  business: JsonObject;
  other: JsonObject;
}

export function categorizeTopLevelFields(data: JsonValue | null): CategorizedFields {
  const result: CategorizedFields = { profile: {}, media: {}, business: {}, other: {} };
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return result;
  }

  for (const [key, value] of Object.entries(data as JsonObject)) {
    // Business hints checked first since "business" fields are the most specific.
    if (keyMatchesAny(key, BUSINESS_HINTS)) {
      result.business[key] = value;
    } else if (keyMatchesAny(key, MEDIA_HINTS)) {
      result.media[key] = value;
    } else if (keyMatchesAny(key, PROFILE_HINTS)) {
      result.profile[key] = value;
    } else {
      result.other[key] = value;
    }
  }

  return result;
}
