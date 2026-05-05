"use client";

import { GtsResponseListItem } from "./api";

export const previewGtsResponsesExport = (query = "") =>
  fetch(`/api/admin/gts/responses/preview${query ? `?${query}` : ""}`).then(
    async (res) => {
      if (!res.ok) {
        return null;
      }
      const data: {
        items: GtsResponseListItem[];
        totalCount: number;
        previewCount: number;
      } = await res.json();
      return data;
    },
  );
