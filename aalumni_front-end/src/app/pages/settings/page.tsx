import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { AccountSettingsWorkspace } from "./_components/account-settings-workspace";

export const metadata: Metadata = {
  title: "Settings Page",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Settings" />

      <AccountSettingsWorkspace />
    </div>
  );
};
