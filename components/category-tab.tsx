"use client";

import { Inbox } from "lucide-react";
import type { JsonObject } from "@/types/instagram";
import { JsonTree } from "./json-tree";

interface CategoryTabProps {
  data: JsonObject;
  emptyLabel: string;
  rootLabel: string;
}

export function CategoryTab({ data, emptyLabel, rootLabel }: CategoryTabProps) {
  const hasFields = Object.keys(data).length > 0;

  if (!hasFields) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 text-slate-500">
        <Inbox className="w-10 h-10 mb-3 opacity-50" />
        <p>{emptyLabel}</p>
      </div>
    );
  }

  return <JsonTree data={data} rootLabel={rootLabel} filename={`${rootLabel}.json`} />;
}
