import Image from "next/image";
import { alumni } from "@/assets/logos";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 shrink-0 overflow-hidden rounded-full">
        <Image
          src={alumni}
          alt="NORSU Alumni Logo"
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <div className="truncate text-lg font-bold leading-5 text-dark dark:text-white">
          NORSU Alumni
        </div>
        <div className="truncate text-xs font-medium text-dark-5 dark:text-dark-6">
          Tracker Admin
        </div>
      </div>
    </div>
  );
}
