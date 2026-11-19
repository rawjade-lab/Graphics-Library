import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'characters');
    if (!fs.existsSync(dir)) {
      return NextResponse.json({ files: [], images: [] });
    }
    const entries = fs.readdirSync(dir);
    const files = entries
      .filter((f) => /\.(glb|gltf)$/i.test(f))
      .sort((a, b) => a.localeCompare(b));
    const images = entries
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ files, images });
  } catch (err) {
    return NextResponse.json({ files: [], images: [], error: String(err) });
  }
}
