"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CampaignRowActionsProps = {
  campaignId: number;
  campaignName: string;
  status: string;
  completedCount: number;
};

type ActionState = {
  error: string;
  message: string;
};

export function CampaignRowActions({
  campaignId,
  campaignName,
  status,
  completedCount,
}: CampaignRowActionsProps) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<"close" | "delete" | null>(null);
  const [state, setState] = useState<ActionState>({ error: "", message: "" });

  const normalizedStatus = status.toLowerCase();
  const canClose = normalizedStatus !== "cancelled";
  const canDelete = completedCount === 0;

  async function handleClose() {
    if (!canClose) {
      return;
    }

    if (!window.confirm(`Close campaign \"${campaignName}\"? Remaining open invitations will expire.`)) {
      return;
    }

    setBusyAction("close");
    setState({ error: "", message: "" });

    try {
      const response = await fetch(`/api/admin/gts/campaigns/${campaignId}/close`, {
        method: "PATCH",
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setState({ error: body.message || "Unable to close campaign.", message: "" });
        return;
      }

      setState({ error: "", message: body.message || "Campaign closed." });
      router.refresh();
    } catch {
      setState({ error: "Unable to close campaign.", message: "" });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDelete() {
    if (!canDelete) {
      return;
    }

    if (!window.confirm(`Delete campaign \"${campaignName}\"? This cannot be undone.`)) {
      return;
    }

    setBusyAction("delete");
    setState({ error: "", message: "" });

    try {
      const response = await fetch(`/api/admin/gts/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setState({ error: body.message || "Unable to delete campaign.", message: "" });
        return;
      }

      setState({ error: "", message: body.message || "Campaign deleted." });
      router.refresh();
    } catch {
      setState({ error: "Unable to delete campaign.", message: "" });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="mt-2 flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleClose}
          disabled={!canClose || busyAction !== null}
          className="inline-flex items-center rounded-full border border-amber-300 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busyAction === "close" ? "Closing..." : "Close"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={!canDelete || busyAction !== null}
          className="inline-flex items-center rounded-full border border-rose-300 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busyAction === "delete" ? "Deleting..." : "Delete"}
        </button>
      </div>

      {state.error ? (
        <p className="max-w-[220px] text-xs font-medium text-rose-600">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="max-w-[220px] text-xs font-medium text-emerald-600">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
