import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { alumni, employment, jobs, users } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Total Alumni"
        data={{
          ...alumni,
          value:
            typeof alumni.value === "number"
              ? compactFormat(alumni.value)
              : alumni.value,
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Employment Rate"
        data={{
          ...employment,
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Active Jobs"
        data={{
          ...jobs,
          value:
            typeof jobs.value === "number" ? compactFormat(jobs.value) : jobs.value,
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Total Users"
        data={{
          ...users,
          value: compactFormat(users.value),
        }}
        Icon={icons.Users}
      />
    </div>
  );
}
