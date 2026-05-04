"use client";

import { useEffect, useState } from "react";

export function SignInFlash({
  message,
  tone,
}: {
  message: string;
  tone: "success" | "error";
}) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("message");
    url.searchParams.delete("registered");

    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [message]);

  if (!visible || !message) {
    return null;
  }

  return (
    <div
      className={
        tone === "success"
          ? "mb-6 flex items-start justify-between gap-3 rounded-[22px] border border-green/20 bg-green/[0.08] px-4 py-3 text-sm font-medium text-green"
          : "mb-6 flex items-start justify-between gap-3 rounded-[22px] border border-red/20 bg-red/[0.08] px-4 py-3 text-sm font-medium text-red"
      }
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 rounded-full px-1 text-lg leading-none opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5"
        aria-label="Dismiss message"
      >
        &times;
      </button>
    </div>
  );
}
