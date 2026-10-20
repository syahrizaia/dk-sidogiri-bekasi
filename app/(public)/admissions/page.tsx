import React from "react";
import { getAdmissionSettingsAction } from "@/lib/actions/admissions";
import { defaultAdmissionSettings } from "@/lib/admissions-config";
import { PublicAdmissionsForm } from "./components/PublicAdmissionsForm";

export const dynamic = "force-dynamic";

export default async function PublicAdmissionsPage() {
  const res = await getAdmissionSettingsAction();
  const settings = res.success && res.data ? res.data : defaultAdmissionSettings;

  return <PublicAdmissionsForm initialSettings={settings} />;
}
