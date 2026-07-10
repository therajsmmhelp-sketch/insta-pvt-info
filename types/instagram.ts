/**
 * The upstream API can return absolutely any shape of JSON, and the whole
 * point of this app is to render it generically without hardcoding field
 * names. So we intentionally type the raw payload as a recursive JSON value
 * rather than a fixed interface.
 */
export type JsonPrimitive = string | number | boolean | null;

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface JsonArray extends Array<JsonValue> {}

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/** Metadata our own /api/user route attaches to every response. */
export interface RequestMeta {
  requestUrl: string;
  responseTimeMs: number;
  status: number;
  statusText: string;
  sizeBytes: number;
  timestamp: string;
  cached: boolean;
}

/** Shape returned by our internal /api/user route. */
export interface ApiUserResponse {
  success: boolean;
  data: JsonValue | null;
  meta: RequestMeta;
  error?: string;
}

/** A single entry in the local search history. */
export interface SearchHistoryItem {
  username: string;
  timestamp: number;
  success: boolean;
  avatarUrl?: string | null;
  fullName?: string | null;
}

/** Common well-known field name candidates used to populate the Overview tab.
 * These are just *hints* for prioritized display — the recursive renderer
 * still displays every field regardless of whether it appears here. */
export const OVERVIEW_FIELD_HINTS: Record<string, string[]> = {
  username: ["username", "user_name", "handle"],
  fullName: ["full_name", "fullname", "name"],
  biography: ["biography", "bio", "description"],
  followers: ["follower_count", "followers", "followers_count", "edge_followed_by"],
  following: ["following_count", "following", "followees_count", "edge_follow"],
  posts: ["media_count", "posts_count", "post_count", "edge_owner_to_timeline_media"],
  profilePic: ["profile_pic_url", "profile_picture", "avatar", "picture"],
  profilePicHD: ["profile_pic_url_hd", "hd_profile_pic_url_info", "avatar_hd"],
  verified: ["is_verified", "verified"],
  private: ["is_private", "private"],
  business: ["is_business", "is_business_account", "business"],
  professional: ["is_professional_account", "professional"],
  category: ["category", "category_name", "business_category_name"],
  externalUrl: ["external_url", "website", "bio_link"],
  userId: ["id", "user_id", "userId"],
  pk: ["pk", "pk_id"],
  threadsLink: ["threads_link", "bio_links"],
  mutualFollowers: ["mutual_followers_count", "edge_mutual_followed_by"],
  whatsappLinked: ["is_whatsapp_linked", "whatsapp_number"],
  country: ["country", "country_code"],
  email: ["public_email", "email"],
  phone: ["public_phone_number", "contact_phone_number", "phone"],
  creator: ["is_creator", "creator_account"],
  businessAddress: ["business_address_json", "address_street", "business_address"],
};
