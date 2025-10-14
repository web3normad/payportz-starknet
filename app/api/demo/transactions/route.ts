import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const p = path.join(process.cwd(), 'data', 'mock_transactions.json');
    const raw = await fs.promises.readFile(p, 'utf-8');
    const json = JSON.parse(raw);
    return NextResponse.json({ ok: true, data: json });
  } catch (err:any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
