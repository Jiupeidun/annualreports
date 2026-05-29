import { appAssetPath } from "../reports";

export function currentReportHref(): string {
  const stamp = new Date();
  const version = [
    stamp.getFullYear(),
    String(stamp.getMonth() + 1).padStart(2, "0"),
    String(stamp.getDate()).padStart(2, "0")
  ].join("");

  return `${appAssetPath("2026_Annual_Report.pdf")}?v=${version}`;
}
