import fs from "fs";
import path from "path";

const cwd = process.cwd();
const brandsDir = path.join(cwd, "public", "brands");
const outFile = path.join(cwd, "src", "data", "brandCampaigns.ts");

fs.mkdirSync(brandsDir, { recursive: true });
fs.mkdirSync(path.dirname(outFile), { recursive: true });

const files = fs
  .readdirSync(brandsDir)
  .filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f) && !f.startsWith("."))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

const items = files.map((file, idx) => {
  const numMatch = file.match(/^(\d+)/);
  const num = numMatch
    ? String(parseInt(numMatch[1], 10)).padStart(2, "0")
    : String(idx + 1).padStart(2, "0");
  const cleanName =
    file
      .replace(/\.[^.]+$/, "")
      .replace(/^\d+[_\-\s]*/, "")
      .replace(/[_-]+/g, " ")
      .trim()
      .toUpperCase() || "BRAND CAMPAIGN";

  return {
    id: num,
    src: `/brands/${file}`,
    title: `${num} · ${cleanName}`,
    caption: "Swipe or click to browse campaign visuals",
  };
});

const content = `export interface BrandCampaignItem {
  id: string;
  src: string;
  title: string;
  caption: string;
}

export const BRAND_CAMPAIGN_ITEMS: BrandCampaignItem[] = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync(outFile, content, "utf8");
console.log("[sync-brands] Synced", files.length, "files:", files);
