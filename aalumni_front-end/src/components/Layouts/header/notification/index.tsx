"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BellIcon } from "./icons";

type AdminNotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: "info" | "success" | "warning" | "danger" | string;
  targetUrl: string | null;
  entityType: string | null;
  entityId: number | null;
  createdAt: string;
  readAt: string | null;
  actor: {
    id: number;
    name: string;
    email: string;
  } | null;
};

type NotificationsResponse = {
  items: AdminNotificationItem[];
  unreadCount: number;
};

const severityClasses: Record<string, string> = {
  info: "bg-blue-light-5 text-primary dark:bg-primary/15",
  success: "bg-green-light-6 text-green dark:bg-green/15",
  warning: "bg-yellow-light-4 text-yellow-dark dark:bg-yellow-dark/15",
  danger: "bg-red-light-6 text-red-light dark:bg-red-light/15",
};

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "";
  }

  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function notificationUrl(item: AdminNotificationItem) {
  return item.targetUrl || "/audit-logs";
}

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const lastSeenIdRef = useRef(0);

  const mergeNotifications = useCallback((items: AdminNotificationItem[]) => {
    setNotifications((current) => {
      const byId = new Map<number, AdminNotificationItem>();

      [...items, ...current].forEach((item) => {
        byId.set(item.id, item);
        lastSeenIdRef.current = Math.max(lastSeenIdRef.current, item.id);
      });

      return Array.from(byId.values())
        .sort((a, b) => b.id - a.id)
        .slice(0, 20);
    });
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications?limit=20", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json().catch(() => null)) as NotificationsResponse | null;

      if (!data) {
        return;
      }

      mergeNotifications(data.items);
      setUnreadCount(data.unreadCount);
    } finally {
      setIsLoading(false);
    }
  }, [mergeNotifications]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (pollTimer) {
        return;
      }

      pollTimer = setInterval(() => {
        void loadNotifications();
      }, 30000);
    };

    if (typeof EventSource === "undefined") {
      startPolling();
      return () => {
        if (pollTimer) clearInterval(pollTimer);
      };
    }

    eventSource = new EventSource(
      `/api/admin/notifications/stream?since=${lastSeenIdRef.current}`,
    );

    eventSource.addEventListener("notification.created", (event) => {
      let payload: { item: AdminNotificationItem; unreadCount?: number } | null = null;

      try {
        payload = JSON.parse((event as MessageEvent).data) as {
          item: AdminNotificationItem;
          unreadCount?: number;
        };
      } catch {
        return;
      }

      if (!payload) {
        return;
      }

      mergeNotifications([payload.item]);
      if (typeof payload.unreadCount === "number") {
        setUnreadCount(payload.unreadCount);
      }
    });

    eventSource.addEventListener("notification.count", (event) => {
      let payload: { unreadCount?: number } | null = null;

      try {
        payload = JSON.parse((event as MessageEvent).data) as {
          unreadCount?: number;
        };
      } catch {
        return;
      }

      if (!payload) {
        return;
      }

      if (typeof payload.unreadCount === "number") {
        setUnreadCount(payload.unreadCount);
      }
    });

    eventSource.onerror = () => {
      eventSource?.close();
      startPolling();
    };

    return () => {
      eventSource?.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [loadNotifications, mergeNotifications]);

  const markRead = async (item: AdminNotificationItem) => {
    if (item.readAt) {
      return;
    }

    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === item.id ? { ...notification, readAt } : notification,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    const response = await fetch(`/api/admin/notifications/${item.id}/read`, {
      method: "PATCH",
    });

    if (response.ok) {
      const data = (await response.json().catch(() => null)) as {
        item: AdminNotificationItem;
        unreadCount: number;
      } | null;

      if (!data) {
        return;
      }

      mergeNotifications([data.item]);
      setUnreadCount(data.unreadCount);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, readAt })),
    );
    setUnreadCount(0);

    const response = await fetch("/api/admin/notifications/read-all", {
      method: "PATCH",
    });

    if (response.ok) {
      const data = (await response.json().catch(() => null)) as { unreadCount: number } | null;

      if (!data) {
        return;
      }

      setUnreadCount(data.unreadCount);
    }
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-red-light px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-gray-2 dark:ring-dark-3">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="min-[350px]:min-w-[22rem] border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark"
      >
        <div className="mb-2 flex items-center justify-between gap-3 px-2 py-1.5">
          <div>
            <span className="block text-lg font-semibold text-dark dark:text-white">
              Notifications
            </span>
            <span className="text-xs font-medium text-dark-5 dark:text-dark-6">
              {unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
            </span>
          </div>

          <button
            type="button"
            disabled={unreadCount === 0}
            onClick={() => void markAllRead()}
            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-primary outline-none hover:bg-blue-light-5 focus-visible:bg-blue-light-5 disabled:cursor-not-allowed disabled:text-dark-5 disabled:hover:bg-transparent dark:disabled:text-dark-6"
          >
            Mark all as read
          </button>
        </div>

        <ul className="mb-3 max-h-[24rem] space-y-1.5 overflow-y-auto">
          {isLoading && (
            <li className="px-2 py-6 text-center text-sm font-medium text-dark-5 dark:text-dark-6">
              Loading notifications...
            </li>
          )}

          {!isLoading && notifications.length === 0 && (
            <li className="px-2 py-6 text-center text-sm font-medium text-dark-5 dark:text-dark-6">
              No notifications yet.
            </li>
          )}

          {notifications.map((item) => {
            const unread = item.readAt === null;

            return (
              <li key={item.id} role="menuitem">
                <Link
                  href={notificationUrl(item)}
                  onClick={() => {
                    void markRead(item);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-2 py-2.5 outline-none transition-colors hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3",
                    unread && "bg-blue-light-5/60 dark:bg-primary/10",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold uppercase",
                      severityClasses[item.severity] ?? severityClasses.info,
                    )}
                  >
                    {item.severity.slice(0, 1)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <strong className="line-clamp-1 text-sm font-semibold text-dark dark:text-white">
                        {item.title}
                      </strong>
                      {unread && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </span>

                    <span className="line-clamp-2 text-sm font-medium text-dark-5 dark:text-dark-6">
                      {item.message}
                    </span>

                    <span className="mt-1 block text-xs font-medium text-dark-4 dark:text-dark-5">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/audit-logs"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          View audit logs
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
