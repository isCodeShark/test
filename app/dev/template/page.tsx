import { notFound } from "next/navigation";
import { Invitation } from "@/components/invitation/Invitation";
import { DEFAULT_CONFIG } from "@/lib/sites/schema";

/** Development-only page for working on the template with the reference data. */
export default function TemplateDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Invitation config={DEFAULT_CONFIG} slug="demo" mode="live" />;
}
