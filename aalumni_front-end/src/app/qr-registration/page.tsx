import { QrRegistrationWorkspace } from "@/components/alumni-system/qr-registration-workspace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Registration",
};

export default function QrRegistrationPage() {
  return <QrRegistrationWorkspace />;
}
