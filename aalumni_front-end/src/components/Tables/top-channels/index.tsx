import { compactFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getTopChannels } from "../fetch";

export async function TopChannels({ className }: { className?: string }) {
  const data = await getTopChannels();

  return (
    <section
      className={cn(
        "rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-7.5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
            Employment Status
          </h2>
          <p className="mt-1 text-sm font-medium text-dark-5 dark:text-dark-6">
            Based on submitted tracer survey answers.
          </p>
        </div>
        <span className="rounded-full bg-blue-light-5 px-3 py-1 text-xs font-bold uppercase text-blue-dark">
          {compactFormat(data.reduce((sum, item) => sum + item.responses, 0))} responses
        </span>
      </div>

      <div className="mt-6 grid gap-3">
        {data.map((item, index) => (
          <div
            key={`${item.status}-${index}`}
            className="rounded-md border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-dark dark:text-white">
                  {item.status}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-dark-5 dark:text-dark-6">
                  {item.source}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-dark dark:text-white">
                  {compactFormat(item.responses)}
                </p>
                <p className="text-xs font-semibold text-dark-5 dark:text-dark-6">
                  {item.conversion}% share
                </p>
              </div>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white dark:bg-gray-dark">
              <div
                className="h-full rounded-full bg-blue-dark"
                style={{ width: `${Math.min(100, Math.max(0, item.conversion))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
