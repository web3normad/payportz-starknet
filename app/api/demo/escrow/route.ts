import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'mock_escrows.json');

async function readDB() {
  try {
    const raw = await fs.promises.readFile(DB_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

async function writeDB(data:any[]) {
  await fs.promises.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.promises.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function POST(req: Request) {
  // create escrow proposal
  const body = await req.json().catch(() => ({}));
  const { amount, recipient, currency, creator } = body;
  if (!amount || !recipient) return NextResponse.json({ error: 'amount and recipient required' }, { status: 400 });

  const db = await readDB();
  const id = `esc_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const rec = { id, amount, recipient, currency: currency || 'starknet:usdc', creator: creator || 'guest', status: 'created', createdAt: new Date().toISOString() };
  db.push(rec);
  await writeDB(db);
  return NextResponse.json({ ok: true, escrow: rec });
}

export async function GET(req: Request) {
  // read all escrows or by id
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const db = await readDB();
  if (id) {
    const r = db.find((d:any)=>d.id===id);
    if (!r) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ ok: true, escrow: r });
  }
  return NextResponse.json({ ok: true, escrows: db });
}

export async function PUT(req: Request) {
  // update status: fund or release
  const body = await req.json().catch(() => ({}));
  const { id, action } = body;
  if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 });
  const db = await readDB();
  const idx = db.findIndex((d:any)=>d.id===id);
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (action === 'fund') db[idx].status = 'funded';
  if (action === 'release') db[idx].status = 'released';
  db[idx].updatedAt = new Date().toISOString();
  await writeDB(db);
  return NextResponse.json({ ok: true, escrow: db[idx] });
}
