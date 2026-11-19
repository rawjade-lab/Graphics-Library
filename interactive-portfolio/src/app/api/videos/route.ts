import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

const VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm', '.m4v']);
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];

function findDetailImage(videosDir: string, baseName: string): string | null {
  for (const ext of IMAGE_EXTS) {
    const candidate = `${baseName}${ext}`;
    if (fs.existsSync(path.join(videosDir, candidate))) {
      return `/videos/${encodeURIComponent(candidate)}`;
    }
  }
  return null;
}

function parseOrderKeys(filename: string) {
  const base = filename.replace(/\.[^/.]+$/, '');
  const match = base.match(/^(\d+)(?:[_-](\d+))?/);
  const groupNum = match ? Number(match[1]) : 9999;
  const subNum = match && match[2] !== undefined ? Number(match[2]) : 0;
  return { base, groupNum, subNum };
}

export async function GET() {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(videosDir)) {
      return NextResponse.json({ groups: [], files: [] });
    }

    const entries = fs.readdirSync(videosDir, { withFileTypes: true });
    const videoNames = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => VIDEO_EXTS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => {
        const ka = parseOrderKeys(a);
        const kb = parseOrderKeys(b);
        if (ka.groupNum !== kb.groupNum) return ka.groupNum - kb.groupNum;
        if (ka.subNum !== kb.subNum) return ka.subNum - kb.subNum;
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
      });

    const items = videoNames.map((filename) => {
      const { base, groupNum, subNum } = parseOrderKeys(filename);
      return {
        filename,
        baseName: base,
        groupNum,
        subNum,
        videoUrl: `/videos/${encodeURIComponent(filename)}`,
        detailImageUrl: findDetailImage(videosDir, base),
      };
    });

    const groupMap = new Map<
      number,
      {
        groupNum: number;
        items: typeof items;
      }
    >();

    for (const item of items) {
      const existing = groupMap.get(item.groupNum);
      if (existing) {
        existing.items.push(item);
      } else {
        groupMap.set(item.groupNum, {
          groupNum: item.groupNum,
          items: [item],
        });
      }
    }

    const groups = Array.from(groupMap.values()).sort((a, b) => a.groupNum - b.groupNum);

    return NextResponse.json({ groups, files: items });
  } catch {
    return NextResponse.json({ groups: [], files: [] }, { status: 500 });
  }
}
