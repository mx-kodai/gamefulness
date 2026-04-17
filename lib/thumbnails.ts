import fs from "node:fs";
import path from "node:path";

let cache: Set<string> | null = null;

export function availableThumbnails(): Set<string> {
  if (cache) return cache;
  try {
    const dir = path.join(process.cwd(), "public", "thumbnails");
    const files = fs.readdirSync(dir);
    cache = new Set(
      files
        .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .map((f) => f.replace(/\.(png|jpg|jpeg|webp)$/i, "")),
    );
  } catch {
    cache = new Set();
  }
  return cache;
}

export function thumbnailPath(slug: string): string | null {
  const dir = path.join(process.cwd(), "public", "thumbnails");
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const full = path.join(dir, `${slug}.${ext}`);
    try {
      if (fs.existsSync(full)) return `/thumbnails/${slug}.${ext}`;
    } catch {}
  }
  return null;
}
