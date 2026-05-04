import { formatMessageTime } from "@/lib/format-message-time";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getChatsData } from "../fetch";

const AVATAR_COLORS = [
  "bg-primary",
  "bg-blue-light",
  "bg-green",
  "bg-orange-light",
  "bg-purple",
  "bg-red-light",
  "bg-meta-5",
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export async function ChatsCard() {
  const data = await getChatsData();

  return (
    <div className="col-span-12 rounded-[10px] bg-white py-6 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-4">
      <h2 className="mb-5.5 px-7.5 text-body-2xlg font-bold text-dark dark:text-white">
        Recent Admin Activity
      </h2>

      <ul>
        {data.map((chat, key) => (
          <li key={key}>
            <Link
              href="/"
              className="flex items-center gap-4.5 px-7.5 py-3 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-2 dark:focus-visible:bg-dark-2"
            >
              <div className="relative shrink-0">
                <div
                  className={cn(
                    "flex size-14 items-center justify-center rounded-full text-base font-bold text-white",
                    AVATAR_COLORS[key % AVATAR_COLORS.length],
                  )}
                  aria-hidden
                >
                  {getInitials(chat.name)}
                </div>

                <span
                  className={cn(
                    "absolute bottom-0 right-0 size-3.5 rounded-full ring-2 ring-white dark:ring-dark-2",
                    chat.isActive ? "bg-green" : "bg-orange-light",
                  )}
                />
              </div>

              <div className="relative flex-grow">
                <h3 className="font-medium text-dark dark:text-white">
                  {chat.name}
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-medium dark:text-dark-5 xl:max-w-[8rem]",
                      chat.unreadCount && "text-dark-4 dark:text-dark-6",
                    )}
                  >
                    {chat.lastMessage.content}
                  </span>

                  <span className="size-1 rounded-full bg-dark-5 dark:bg-dark-6" />

                  <time
                    className="text-xs"
                    dateTime={chat.lastMessage.timestamp}
                  >
                    {formatMessageTime(chat.lastMessage.timestamp)}
                  </time>
                </div>

                {!!chat.unreadCount && (
                  <div className="pointer-events-none absolute right-0 top-1/2 aspect-square max-w-fit -translate-y-1/2 select-none rounded-full bg-primary px-2 py-0.5 text-sm font-medium text-white">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
