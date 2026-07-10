"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Lock,
  Briefcase,
  Sparkles,
  Globe,
  Hash,
  Fingerprint,
  Link2,
  Users,
  Phone,
  Mail,
  MapPin,
  ImageIcon,
} from "lucide-react";
import type { JsonValue } from "@/types/instagram";
import { resolveOverviewFields } from "@/lib/api";
import { cn, formatCompactNumber, isImageUrl, isUrl } from "@/lib/utils";
import { ImageModal } from "./image-modal";
import { JsonTree } from "./json-tree";

interface OverviewCardProps {
  data: JsonValue;
}

const ICONS: Record<string, React.ElementType> = {
  verified: BadgeCheck,
  private: Lock,
  business: Briefcase,
  professional: Sparkles,
  externalUrl: Globe,
  userId: Hash,
  pk: Fingerprint,
  threadsLink: Link2,
  mutualFollowers: Users,
  phone: Phone,
  email: Mail,
  businessAddress: MapPin,
};

function StatBlock({ label, value }: { label: string; value: unknown }) {
  const numeric = typeof value === "number" ? value : Number(value);
  const display =
    typeof value === "number" || (!isNaN(numeric) && typeof value === "string")
      ? formatCompactNumber(numeric)
      : String(value);
  return (
    <div className="glass-panel rounded-xl p-4 text-center">
      <p className="text-2xl font-bold bg-clip-text text-transparent bg-ig-gradient">
        {display}
      </p>
      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function FieldRow({ fieldKey, label, value }: { fieldKey: string; label: string; value: unknown }) {
  const Icon = ICONS[fieldKey] ?? Sparkles;

  let content: React.ReactNode;
  if (typeof value === "boolean") {
    content = (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
          value
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            : "bg-rose-500/15 text-rose-400 border-rose-500/30"
        )}
      >
        {value ? "YES" : "NO"}
      </span>
    );
  } else if (isUrl(value)) {
    content = (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sky-400 hover:text-sky-300 underline decoration-dotted underline-offset-4 break-all text-sm"
      >
        {value}
      </a>
    );
  } else if (typeof value === "object" && value !== null) {
    content = (
      <span className="text-sm text-slate-400 font-mono">
        {Array.isArray(value) ? `Array(${value.length})` : `${Object.keys(value).length} fields`}
      </span>
    );
  } else {
    content = <span className="text-sm break-all">{String(value)}</span>;
  }

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <Icon className="w-4 h-4 text-fuchsia-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
        {content}
      </div>
    </div>
  );
}

export function OverviewCard({ data }: OverviewCardProps) {
  const [modalImage, setModalImage] = useState<{ url: string; label: string } | null>(
    null
  );
  const [avatarOptimizeFailed, setAvatarOptimizeFailed] = useState(false);
  const fields = resolveOverviewFields(data);

  const findField = (key: string) => fields.find((f) => f.key === key);
  const avatarField = findField("profilePicHD") ?? findField("profilePic");
  const usernameField = findField("username");
  const fullNameField = findField("fullName");
  const bioField = findField("biography");
  const followersField = findField("followers");
  const followingField = findField("following");
  const postsField = findField("posts");
  const verifiedField = findField("verified");
  const privateField = findField("private");

  const primaryKeys = new Set(
    [
      avatarField,
      usernameField,
      fullNameField,
      bioField,
      followersField,
      followingField,
      postsField,
    ]
      .filter(Boolean)
      .map((f) => f!.key)
  );

  const remainingFields = fields.filter((f) => !primaryKeys.has(f.key));

  const avatarUrl =
    typeof avatarField?.value === "string" && isImageUrl(avatarField.value)
      ? avatarField.value
      : null;

  if (fields.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">
          No commonly-known profile fields were detected in this response. Check the
          Raw JSON tab to see everything the API returned.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center sm:items-start gap-5"
      >
        <div className="relative shrink-0">
          {avatarUrl ? (
            <button
              onClick={() => setModalImage({ url: avatarUrl, label: "Profile Picture" })}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-full bg-ig-gradient blur-md opacity-60 group-hover:opacity-90 transition-opacity" />
              {avatarOptimizeFailed ? (
                // Some Instagram CDN hosts reject Next's image-optimizer fetch
                // (hotlink protection). Fall back to a plain <img> so the
                // picture still renders instead of showing a broken image.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={String(usernameField?.value ?? "Profile picture")}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Image
                  src={avatarUrl}
                  alt={String(usernameField?.value ?? "Profile picture")}
                  width={112}
                  height={112}
                  unoptimized={false}
                  onError={() => setAvatarOptimizeFailed(true)}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white/20"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </span>
            </button>
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-ig-gradient flex items-center justify-center text-3xl font-bold text-white">
              {String(usernameField?.value ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h2 className="text-xl font-bold">
              @{String(usernameField?.value ?? "unknown")}
            </h2>
            {verifiedField?.value === true && (
              <BadgeCheck className="w-5 h-5 text-sky-400" />
            )}
            {privateField?.value === true && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
                <Lock className="w-3 h-3" /> Private
              </span>
            )}
          </div>
          {fullNameField && (
            <p className="text-slate-300 font-medium mt-1">{String(fullNameField.value)}</p>
          )}
          {bioField && (
            <p className="text-slate-400 text-sm mt-2 whitespace-pre-wrap max-w-xl">
              {String(bioField.value)}
            </p>
          )}
        </div>
      </motion.div>

      {(followersField || followingField || postsField) && (
        <div className="grid grid-cols-3 gap-3">
          {postsField && <StatBlock label="Posts" value={postsField.value} />}
          {followersField && <StatBlock label="Followers" value={followersField.value} />}
          {followingField && <StatBlock label="Following" value={followingField.value} />}
        </div>
      )}

      {remainingFields.length > 0 && (
        <div className="glass-panel rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-1">
            Additional Public Fields
          </h3>
          <div>
            {remainingFields.map((f) => (
              <FieldRow key={f.key} fieldKey={f.key} label={f.label} value={f.value} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">
          Full Response Tree (Overview)
        </h3>
        <JsonTree data={data} showToolbar={false} rootLabel="overview" />
      </div>

      {modalImage && (
        <ImageModal
          url={modalImage.url}
          label={modalImage.label}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
}
