"use client";

import { createContext, useContext } from "react";

export interface JsonTreeControls {
  expandToken: number;
  collapseToken: number;
  searchQuery: string;
  onImageClick: (url: string, label: string) => void;
}

export const JsonTreeContext = createContext<JsonTreeControls>({
  expandToken: 0,
  collapseToken: 0,
  searchQuery: "",
  onImageClick: () => {},
});

export function useJsonTreeControls() {
  return useContext(JsonTreeContext);
}
